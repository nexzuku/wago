import OpenAI from 'openai';
import config from '../config/env.js';

const DEEPINFRA_BASE = 'https://api.deepinfra.com';
const TTS_MODEL = 'ResembleAI/chatterbox-multilingual';

function normalizeBase64Audio(input) {
  if (!input) return '';
  let b64 = String(input).trim();
  b64 = b64.replace(/^['"]+|['"]+$/g, '');

  // Handle known malformed prefix: "dataaudio/wavbase64..."
  if (/^dataaudio\//i.test(b64)) b64 = b64.replace(/^dataaudio\//i, 'data:audio/');

  // Proper or malformed data URLs
  if (/^data:/i.test(b64)) {
    if (/base64/i.test(b64) && !b64.includes(',')) b64 = b64.replace(/base64/i, 'base64,');
    if (b64.includes(',')) b64 = b64.split(',').pop() || '';
    else {
      const idx = b64.toLowerCase().lastIndexOf('base64');
      if (idx >= 0) b64 = b64.slice(idx + 'base64'.length);
    }
  } else {
    // Extremely malformed but seen in logs: "...base64<no comma><payload>"
    const idx = b64.toLowerCase().lastIndexOf('base64');
    if (idx >= 0) b64 = b64.slice(idx + 'base64'.length);
  }

  b64 = b64.replace(/^[\s:;,]+/, '');
  b64 = b64.replace(/\s+/g, '');
  b64 = b64.replace(/-/g, '+').replace(/_/g, '/');
  b64 = b64.replace(/[^A-Za-z0-9+/=]/g, '');
  // Remove stray '=' then re-pad
  b64 = b64.replace(/=/g, '');
  if (b64.length % 4 === 1) b64 = b64.slice(0, -1);
  const mod = b64.length % 4;
  if (mod) b64 += '='.repeat(4 - mod);
  return b64;
}

function extractJSON(text) {
  // Strip markdown code fences
  let cleaned = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
  // Try direct parse first
  try { return JSON.parse(cleaned); } catch { /* fall through */ }
  // Extract first JSON object {...}
  const objMatch = cleaned.match(/\{[\s\S]*\}/);
  if (objMatch) { try { return JSON.parse(objMatch[0]); } catch { /* fall through */ } }
  // Extract first JSON array [...]
  const arrMatch = cleaned.match(/\[[\s\S]*\]/);
  if (arrMatch) { try { return JSON.parse(arrMatch[0]); } catch { /* fall through */ } }
  return null;
}

class DeepInfraService {
  constructor() {
    this.client = new OpenAI({
      apiKey: config.deepinfra.apiKey,
      baseURL: 'https://api.deepinfra.com/v1/openai'
    });
    this.model = 'deepseek-ai/DeepSeek-V3.2';
  }

  // ── TTS (Chatterbox Multilingual) ────────────────────────────────────────────

  // Returns { buffer: Buffer, mimeType: string }
  async textToSpeech(text, language = 'ja', voiceId = null, options = {}) {
    // For Japanese (learner-facing TTS): slightly more expressive, clear delivery.
    // For English (feedback/translation): natural but slightly slower for comprehension.
    const isJa = language === 'ja' || language.startsWith('ja-') || language === 'jp';
    const body = {
      text,
      language_id: language,
      // exaggeration: 0.0–1.0. ~0.3–0.4 gives warm, natural delivery without sounding robotic.
      // Too high (>0.6) sounds theatrical; too low (<0.2) sounds flat.
      exaggeration: options.exaggeration ?? (isJa ? 0.35 : 0.3),
      // cfg (classifier-free guidance): 0.0–1.0. Lower = more natural prosody, less "trained" feel.
      // 0.3 gives good naturalness; higher values make speech more monotone.
      cfg: options.cfg ?? 0.3
    };
    if (voiceId) body.voice_id = voiceId;

    const response = await fetch(`${DEEPINFRA_BASE}/v1/inference/${TTS_MODEL}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.deepinfra.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => `${response.status}`);
      throw new Error(`DeepInfra TTS error: ${errText}`);
    }

    let audioBuffer;
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const json = await response.json();
      const audio = json.audio || json.output?.audio;
      if (!audio) throw new Error('No audio in TTS response');
      audioBuffer = Buffer.from(normalizeBase64Audio(audio), 'base64');
    } else {
      audioBuffer = Buffer.from(await response.arrayBuffer());
    }

    // Detect actual format from magic bytes for correct playback on the client
    let mimeType = 'audio/wav'; // Chatterbox Multilingual outputs WAV by default
    if (audioBuffer.length >= 4) {
      if (audioBuffer.subarray(0, 4).toString('ascii') === 'RIFF') {
        mimeType = 'audio/wav';
      } else if (audioBuffer.subarray(0, 3).toString('ascii') === 'ID3' ||
                 (audioBuffer[0] === 0xFF && (audioBuffer[1] & 0xE0) === 0xE0)) {
        mimeType = 'audio/mpeg';
      }
    }

    return { buffer: audioBuffer, mimeType };
  }

  // ── Voice Clone Management ───────────────────────────────────────────────────

  async createVoiceClone(audioBuffer, name, description = '', mimeType = 'audio/wav', filename = 'sample.wav') {
    const formData = new FormData();
    formData.append('files', new Blob([audioBuffer], { type: mimeType }), filename);
    formData.append('name', name);
    if (description) formData.append('description', description);

    const response = await fetch(`${DEEPINFRA_BASE}/v1/voices/add`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${config.deepinfra.apiKey}` },
      body: formData
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => `${response.status}`);
      console.error('[DeepInfra voice clone] status:', response.status, 'body:', errText);
      throw new Error(`Voice clone error: ${errText}`);
    }
    return response.json();
  }

  async deleteVoiceClone(voiceId) {
    const response = await fetch(`${DEEPINFRA_BASE}/v1/voices/${voiceId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${config.deepinfra.apiKey}` }
    });
    if (!response.ok) {
      const errText = await response.text().catch(() => `${response.status}`);
      throw new Error(`Delete voice clone error: ${errText}`);
    }
    return true;
  }

  // Resolve which voice ID to use for a given user + company
  resolveVoiceId(user, company) {
    if (user?.assignedVoiceId) return user.assignedVoiceId;
    const clones = company?.voiceClones || [];
    const def = clones.find(v => v.isDefault && v.status === 'ready');
    if (def?.deepInfraVoiceId) return def.deepInfraVoiceId;
    const firstReady = clones.find(v => v.status === 'ready');
    return firstReady?.deepInfraVoiceId || null;
  }

  async chat(messages, systemPrompt = null, maxTokens = 1000) {
    const formattedMessages = [];
    if (systemPrompt) formattedMessages.push({ role: 'system', content: systemPrompt });
    formattedMessages.push(...messages);

    const _raw = await this.client.chat.completions.create({
      model: this.model,
      messages: formattedMessages,
      temperature: 0.7,
      max_tokens: maxTokens
    });

    return _raw.choices[0].message.content || '';
  }

  // ── Streaming: LLM → NDJSON segments → yields {text,lang} or {correction} ───
  // Each yielded text segment can immediately kick off TTS in parallel.
  // NDJSON format: one JSON object per line, e.g.:
  //   {"text":"こんにちは！","lang":"ja"}
  //   {"text":"Hello!","lang":"en"}
  //   {"correction":null}

  async *streamFreeTalkConversation(messages, companyContext = {}) {
    let topicSection = '';
    if (companyContext.topicName) {
      topicSection += `\nTopic: ${companyContext.topicName}`;
      if (companyContext.backgroundContext) topicSection += `\nBackground: ${companyContext.backgroundContext}`;
      if (companyContext.aiInstructions) topicSection += `\nInstructions: ${companyContext.aiInstructions}`;
      if (companyContext.vocabularyList?.length > 0) {
        topicSection += `\nVocabulary: ${companyContext.vocabularyList.map(v => `${v.japanese}=${v.english}`).join(', ')}`;
      }
      if (companyContext.conversationStarter) topicSection += `\nScenario: ${companyContext.conversationStarter}`;
    }

    const systemPrompt = `You are a Japanese language conversation partner for business training.
Company: ${companyContext.industry || 'business'}${companyContext.companyName ? ` (${companyContext.companyName})` : ''}${topicSection}
${companyContext.aiInstructions ? `Instructions: ${companyContext.aiInstructions}` : ''}
Output ONLY newline-delimited JSON — one object per line, NO surrounding array or braces:
{"text":"<Japanese reply>","lang":"ja"}
{"text":"<English translation>","lang":"en"}
{"correction":null}
Rules:
- 2–3 segments max. Japanese first, then English translation.
- Each segment is ONE short, natural sentence — spoken aloud, not written text.
- Japanese: use natural spoken phrasing with proper sentence-ending particles (ね、よ、か etc.).
- English: plain, clear translation — no brackets, no romanisation, no extra labels.
- Keep sentences short (under 15 words) so TTS reads them at a natural pace.
- If correcting a user mistake, add a "ja" segment with the correct form only.
- End with the correction line.`;

    const formattedMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.map(m => ({ role: m.role, content: m.content }))
    ];

    const stream = await this.client.chat.completions.create({
      model: this.model,
      messages: formattedMessages,
      temperature: 0.7,
      max_tokens: 200,
      stream: true
    });

    let lineBuffer = '';
    for await (const chunk of stream) {
      const token = chunk.choices[0]?.delta?.content || '';
      lineBuffer += token;
      const lines = lineBuffer.split('\n');
      lineBuffer = lines.pop(); // keep incomplete last line
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        const parsed = extractJSON(trimmed);
        if (!parsed) continue;
        if (parsed.text && parsed.lang) yield { text: parsed.text, lang: parsed.lang };
        else if ('correction' in parsed) yield { correction: parsed.correction };
      }
    }
    // flush remainder
    if (lineBuffer.trim()) {
      const parsed = extractJSON(lineBuffer.trim());
      if (parsed?.text && parsed?.lang) yield { text: parsed.text, lang: parsed.lang };
      else if (parsed && 'correction' in parsed) yield { correction: parsed.correction };
    }
  }

  async extractCompanyInfo(content, type = 'text') {
    const systemPrompt = `You are a helpful assistant that extracts company information from text content scraped from a website or document.
Extract the following fields if present:
- name: The company or organization name (look for brand names, site titles, "About us" sections, copyright notices, etc.)
- industry: Industry or sector the company operates in (e.g. Technology, Retail, Healthcare, Finance, etc.)
- address: Physical address or location (city/country is sufficient if full address not found)
- introduction: Brief company description (2-3 sentences summarizing what the company does)

Be thorough — infer the industry from context clues even if not explicitly stated.
Return ONLY a valid JSON object with these exact fields. If a field truly cannot be determined, use null.
Do NOT include any explanation or extra text outside the JSON.`;

    const response = await this.chat([
      { role: 'user', content: `Extract company information from this ${type} content:\n\n${content}` }
    ], systemPrompt);

    const parsed = extractJSON(response);
    return parsed || { name: null, industry: null, address: null, introduction: null };
  }

  async getPronunciationFeedback(expectedText, actualText, context = {}) {
    let topicInfo = '';
    if (context.topicName) topicInfo += `\nTopic: ${context.topicName}`;
    if (context.backgroundContext) topicInfo += `\nDomain context: ${context.backgroundContext}`;
    if (context.aiInstructions) topicInfo += `\nSpecial instructions: ${context.aiInstructions}`;

    const systemPrompt = `You are a Japanese language pronunciation coach.${topicInfo ? `\nContext:${topicInfo}` : ''}
Return ONLY this JSON structure:
{
  "score": <0-100>,
  "segments": [
    { "text": "<short English feedback>", "lang": "en" },
    { "text": "<Japanese example/correction if needed>", "lang": "ja" },
    { "text": "<short English tip>", "lang": "en" }
  ],
  "suggestions": ["tip1", "tip2"]
}
Rules:
- Segments are spoken aloud by a TTS voice — write naturally spoken sentences, not written text.
- Each segment is ONE short sentence, maximum 12 words.
- Start with ONE positive English sentence (e.g. "Great effort!" or "Nice try!").
- Add a Japanese segment ONLY when giving the correct pronunciation to repeat after.
- End with ONE short practical English tip.
- Total 2–4 segments. No parentheses, no romanisation in text, no labels like "(Japanese:)".
- English: warm, encouraging coach voice. Japanese: clear, standard spoken Japanese.`;

    const response = await this.chat([
      {
        role: 'user',
        content: `Expected: "${expectedText}"\nStudent said: "${actualText}"\n${context.romaji ? `Romaji: ${context.romaji}` : ''}\n${context.english ? `Meaning: ${context.english}` : ''}`
      }
    ], systemPrompt);

    const parsed = extractJSON(response);
    if (parsed && typeof parsed.score === 'number') {
      parsed.score = Math.max(0, Math.min(100, parsed.score));
      if (!Array.isArray(parsed.segments)) {
        parsed.segments = [{ text: parsed.feedback || 'Good attempt!', lang: 'en' }];
      }
      return parsed;
    }
    return { score: 70, segments: [{ text: 'Good attempt! Keep practicing.', lang: 'en' }], suggestions: [] };
  }

  async freeTalkConversation(messages, companyContext = {}) {
    let topicSection = '';
    if (companyContext.topicName) {
      topicSection += `\n\nCurrent topic: ${companyContext.topicName}`;
      if (companyContext.backgroundContext) topicSection += `\nTopic background: ${companyContext.backgroundContext}`;
      if (companyContext.aiInstructions) topicSection += `\nTopic-specific instructions: ${companyContext.aiInstructions}`;
      if (companyContext.vocabularyList?.length > 0) {
        const vocabStr = companyContext.vocabularyList.map(v => `${v.japanese} (${v.romaji}) = ${v.english}`).join(', ');
        topicSection += `\nKey vocabulary to incorporate: ${vocabStr}`;
      }
      if (companyContext.conversationStarter) {
        topicSection += `\nScenario: ${companyContext.conversationStarter}`;
      }
    }

    const systemPrompt = `You are a friendly Japanese language conversation partner helping employees practice business Japanese.
Company: ${companyContext.industry || 'general business'}${companyContext.companyName ? ` (${companyContext.companyName})` : ''}${topicSection}
${companyContext.aiInstructions ? `Special instructions: ${companyContext.aiInstructions}` : ''}

Return ONLY this JSON structure:
{
  "segments": [
    { "text": "<Japanese sentence>", "lang": "ja" },
    { "text": "<English translation or brief explanation>", "lang": "en" }
  ],
  "correction": "<optional: note if user made a mistake, else null>"
}
Rules: Each segment is ONE short sentence read aloud in order. Japanese reply goes in "ja" segments. English explanation/translation goes in "en" segments. Keep concise (2-4 segments total). If correcting the user, add a "ja" segment with the corrected phrase.`;

    const formattedMessages = messages.map(m => ({ role: m.role, content: m.content }));
    const response = await this.chat(formattedMessages, systemPrompt);

    const parsed = extractJSON(response);
    if (parsed && Array.isArray(parsed.segments)) return parsed;
    // Fallback: wrap plain text as single Japanese segment
    return { segments: [{ text: parsed?.japanese || response, lang: 'ja' }], correction: null };
  }

  async detectTopicsFromContent(text, existingTopics = []) {
    const topicNames = existingTopics.map(t => t.name).join(', ');
    const systemPrompt = `You are a training content analyzer for a Japanese language training platform.
Analyze the provided text and identify relevant training topics.
${topicNames ? `Existing topics in the system: ${topicNames}` : ''}

Return ONLY a valid JSON object:
{
  "matchedTopics": ["<existing topic name>"],
  "suggestedTopics": [
    { "name": "<new topic name>", "description": "<one sentence description>", "category": "<greetings|business|safety|technical|daily|emergency|custom>" }
  ]
}

Rules:
- matchedTopics: names from the existing topics list that are clearly relevant to the content
- suggestedTopics: NEW topics not in the existing list useful for Japanese language training (max 5)
- Do not include any explanation outside the JSON`;

    const limitedText = text.split(/\s+/).filter(w => w.length > 0).slice(0, 2000).join(' ');

    const response = await this.chat([
      { role: 'user', content: `Analyze this content and detect relevant Japanese training topics:\n\n${limitedText}` }
    ], systemPrompt, 500);

    const parsed = extractJSON(response);
    return parsed || { matchedTopics: [], suggestedTopics: [] };
  }

  async generatePhrases(topic, difficulty = 'beginner', count = 5, context = {}) {
    const systemPrompt = `You are a Japanese language curriculum designer creating training phrases.
Generate ${count} practical Japanese phrases for the topic: "${topic}"
Difficulty level: ${difficulty}
${context.industry ? `Industry context: ${context.industry}` : ''}

Return a JSON array of phrases, each with:
{ "japanese": "日本語", "romaji": "nihongo", "english": "English meaning", "usageContext": "when/how to use this phrase" }

Make phrases practical and commonly used in real business situations.`;

    const response = await this.chat([
      { role: 'user', content: `Generate ${count} ${difficulty} level Japanese phrases for: ${topic}` }
    ], systemPrompt);

    const parsed = extractJSON(response);
    return Array.isArray(parsed) ? parsed : [];
  }
}

export default new DeepInfraService();

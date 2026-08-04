import { GoogleGenerativeAI } from '@google/generative-ai';
import config from '../config/env.js';

class GeminiService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(config.gemini.apiKey);
    this.model = 'gemini-2.0-flash-lite';
  }

  async chat(messages, systemPrompt = null) {
    const model = this.genAI.getGenerativeModel({
      model: this.model,
      ...(systemPrompt && { systemInstruction: systemPrompt })
    });

    const history = [];
    const allMessages = [...messages];
    const lastMessage = allMessages.pop();

    for (const msg of allMessages) {
      history.push({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      });
    }

    const chat = model.startChat({ history });
    const result = await chat.sendMessage(lastMessage.content);
    return result.response.text();
  }

  async extractCompanyInfo(content, type = 'text') {
    const systemPrompt = `You are a helpful assistant that extracts company information from text.
Extract the following fields if present:
- name: Company name
- industry: Industry or sector
- address: Physical address
- introduction: Brief company description (2-3 sentences)

Return ONLY a valid JSON object with these fields. If a field is not found, use null.`;

    const response = await this.chat([
      { role: 'user', content: `Extract company information from this ${type}:\n\n${content}` }
    ], systemPrompt);

    try {
      return JSON.parse(response.replace(/```json\n?|\n?```/g, ''));
    } catch {
      return { name: null, industry: null, address: null, introduction: null };
    }
  }

  async getPronunciationFeedback(expectedText, actualText, context = {}) {
    let topicInfo = '';
    if (context.topicName) topicInfo += `\nTopic: ${context.topicName}`;
    if (context.backgroundContext) topicInfo += `\nDomain context: ${context.backgroundContext}`;
    if (context.aiInstructions) topicInfo += `\nSpecial instructions: ${context.aiInstructions}`;

    const systemPrompt = `You are a Japanese language pronunciation coach. Compare what the student said with the expected phrase.
Provide helpful, encouraging feedback focusing on:
1. Accuracy of pronunciation
2. Common mistakes made
3. Tips for improvement
${topicInfo ? `\nThe student is practicing in this context:${topicInfo}\nUse this context to give more relevant, domain-specific feedback when appropriate.` : ''}
Be concise but supportive. Always find something positive to say.
Return a JSON object with: { "score": 0-100, "feedback": "string", "suggestions": ["tip1", "tip2"] }`;

    const response = await this.chat([
      {
        role: 'user',
        content: `Expected Japanese: "${expectedText}"
Student said: "${actualText}"
Context: ${context.romaji ? `Romaji: ${context.romaji}` : ''}
${context.english ? `Meaning: ${context.english}` : ''}`
      }
    ], systemPrompt);

    try {
      return JSON.parse(response.replace(/```json\n?|\n?```/g, ''));
    } catch {
      return { score: 70, feedback: 'Good attempt! Keep practicing.', suggestions: [] };
    }
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
Company context: ${companyContext.industry || 'general business'}${companyContext.companyName ? ` (${companyContext.companyName})` : ''}${topicSection}

Guidelines:
- Respond naturally in Japanese with romaji in parentheses
- Keep responses concise (1-2 sentences)
- Gently correct any mistakes the user makes
- Adjust difficulty based on user's apparent level
- Be encouraging and supportive
${companyContext.topicName ? '- Stay focused on the current topic and use relevant vocabulary from the topic domain' : ''}
${companyContext.aiInstructions ? `- Follow these special instructions: ${companyContext.aiInstructions}` : ''}

Format your response as JSON: { "japanese": "日本語", "romaji": "nihongo", "english": "translation", "correction": "optional correction note" }`;

    const formattedMessages = messages.map(m => ({
      role: m.role,
      content: m.content
    }));

    const response = await this.chat(formattedMessages, systemPrompt);

    try {
      return JSON.parse(response.replace(/```json\n?|\n?```/g, ''));
    } catch {
      return {
        japanese: response,
        romaji: '',
        english: '',
        correction: null
      };
    }
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

    try {
      return JSON.parse(response.replace(/```json\n?|\n?```/g, ''));
    } catch {
      return [];
    }
  }
}

export default new GeminiService();

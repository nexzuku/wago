import deepinfraService from '../services/deepinfra.service.js';
import storageService from '../services/storage.service.js';
import { Company, Topic } from '../models/index.js';
import { successResponse, errorResponse, ErrorCodes } from '../utils/response.js';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { extractPdfText } from '../utils/pdfText.js';

// Hosts that must never be fetched. This endpoint is reachable without auth
// (it powers onboarding), so an unrestricted fetcher would let anyone probe the
// server's own network — including cloud instance metadata endpoints.
const isBlockedHost = (hostname) => {
  const host = hostname.toLowerCase();

  if (host === 'localhost' || host.endsWith('.localhost') || host.endsWith('.internal') || host.endsWith('.local')) {
    return true;
  }

  // IPv6 loopback / link-local / unique-local
  if (host === '::1' || host.startsWith('fe80:') || host.startsWith('fc') || host.startsWith('fd')) {
    return true;
  }

  const ipv4 = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (!ipv4) return false;

  const [a, b] = ipv4.slice(1).map(Number);
  return (
    a === 0 ||                          // "this" network
    a === 10 ||                         // private
    a === 127 ||                        // loopback
    (a === 169 && b === 254) ||         // link-local (cloud metadata)
    (a === 172 && b >= 16 && b <= 31) ||    // private
    (a === 192 && b === 168)            // private
  );
};

// Accepts "example.com" as well as a full URL, and rejects anything we must not fetch.
const normalizeUrl = (input) => {
  const raw = String(input || '').trim();
  if (!raw) throw new Error('URL is required');

  const withScheme = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;

  let parsed;
  try {
    parsed = new URL(withScheme);
  } catch {
    throw new Error('That does not look like a valid URL');
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error('Only http and https URLs are supported');
  }

  if (isBlockedHost(parsed.hostname)) {
    throw new Error('That URL points to a private or local address and cannot be fetched');
  }

  return parsed.toString();
};

export const extractCompanyInfo = async (req, res, next) => {
  try {
    const { content, type = 'text', url } = req.body;
    let extractionContent = content;

    // Handle URL scraping
    if (type === 'url' && url) {
      let target;
      try {
        target = normalizeUrl(url);
      } catch (err) {
        return errorResponse(res, err.message, ErrorCodes.VALIDATION_ERROR, null, 400);
      }

      try {
        const response = await axios.get(target, {
          timeout: 15000,
          maxRedirects: 5,
          maxContentLength: 5 * 1024 * 1024,
          responseType: 'text',
          // Read the body ourselves so non-2xx pages still surface a clear message
          validateStatus: (status) => status >= 200 && status < 400,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
          }
        });

        const contentType = String(response.headers['content-type'] || '');
        if (contentType && !/text\/html|text\/plain|application\/xhtml/i.test(contentType)) {
          return errorResponse(
            res,
            `That URL returned ${contentType.split(';')[0]} — please provide a link to a normal web page.`,
            ErrorCodes.VALIDATION_ERROR,
            null,
            400
          );
        }

        const $ = cheerio.load(String(response.data || ''));
        // Remove non-content elements
        $('script, style, noscript, iframe, nav, footer, header').remove();
        
        // Extract all visible text from the page body
        let bodyText = $('body').text()
          .replace(/\s+/g, ' ')
          .trim();

        // Fallback: if body text is empty (JS-rendered SPA), extract from meta tags + title + raw text nodes
        if (bodyText.length < 50) {
          const title = $('title').text().trim();
          const metaDesc = $('meta[name="description"]').attr('content') || '';
          const metaKeywords = $('meta[name="keywords"]').attr('content') || '';
          const ogTitle = $('meta[property="og:title"]').attr('content') || '';
          const ogDesc = $('meta[property="og:description"]').attr('content') || '';
          const ogSiteName = $('meta[property="og:site_name"]').attr('content') || '';
          bodyText = [title, ogSiteName, ogTitle, ogDesc, metaDesc, metaKeywords]
            .filter(Boolean)
            .join(' | ');
        }

        extractionContent = bodyText.substring(0, 3000);
      } catch (urlError) {
        console.warn('URL fetch failed:', target, '-', urlError.message);
        const reason =
          urlError.code === 'ENOTFOUND' ? 'that domain could not be found'
          : urlError.code === 'ECONNABORTED' || /timeout/i.test(urlError.message) ? 'the site took too long to respond'
          : urlError.response ? `the site responded with ${urlError.response.status}`
          : 'the site could not be reached';
        return errorResponse(
          res,
          `Failed to fetch content from URL — ${reason}.`,
          ErrorCodes.EXTERNAL_SERVICE_ERROR,
          null,
          400
        );
      }
    }

    if (!extractionContent || !extractionContent.trim()) {
      return errorResponse(res, 'Content or URL is required', ErrorCodes.VALIDATION_ERROR, null, 400);
    }

    const extractedInfo = await deepinfraService.extractCompanyInfo(extractionContent, type);

    return successResponse(res, {
      ...extractedInfo,
      extractedContent: extractionContent.substring(0, 500)
    });
  } catch (error) {
    next(error);
  }
};

export const extractFromPDF = async (req, res, next) => {
  try {
    if (!req.file) {
      return errorResponse(res, 'PDF file is required', ErrorCodes.VALIDATION_ERROR, null, 400);
    }

    const textContent = await extractPdfText(req.file.buffer);

    if (!textContent || textContent.trim().length < 50) {
      return errorResponse(res, 'PDF content is too short or could not be extracted', ErrorCodes.VALIDATION_ERROR, null, 400);
    }

    // Extract company info from PDF content
    const extractedInfo = await deepinfraService.extractCompanyInfo(textContent, 'pdf');

    return successResponse(res, {
      ...extractedInfo,
      extractedContent: textContent.substring(0, 1000)
    });
  } catch (error) {
    console.error('PDF extraction error:', error);
    next(error);
  }
};

export const getPronunciationFeedback = async (req, res, next) => {
  try {
    const { expected, actual, romaji, english, topicId } = req.body;

    if (!expected || !actual) {
      return errorResponse(res, 'Expected and actual text are required', ErrorCodes.VALIDATION_ERROR, null, 400);
    }

    let topicContext = {};
    if (topicId) {
      const topic = await Topic.findOne({
        _id: topicId,
        companyId: req.companyId
      }).lean();
      if (topic) {
        topicContext = {
          topicName: topic.name,
          backgroundContext: topic.backgroundContext || '',
          aiInstructions: topic.aiInstructions || ''
        };
      }
    }

    const feedback = await deepinfraService.getPronunciationFeedback(expected, actual, {
      romaji,
      english,
      ...topicContext
    });

    return successResponse(res, feedback);
  } catch (error) {
    next(error);
  }
};

export const conversation = async (req, res, next) => {
  try {
    const { messages, topicId, conversationStarter } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return errorResponse(res, 'Messages array is required', ErrorCodes.VALIDATION_ERROR, null, 400);
    }

    const company = await Company.findById(req.companyId);
    const aiContext = {
      industry: company.industry,
      companyName: company.name
    };

    if (topicId) {
      const topic = await Topic.findOne({
        _id: topicId,
        companyId: req.companyId
      }).lean();
      if (topic) {
        aiContext.topicName = topic.name;
        aiContext.backgroundContext = topic.backgroundContext || '';
        aiContext.aiInstructions = topic.aiInstructions || '';
        aiContext.vocabularyList = topic.vocabularyList || [];
        if (conversationStarter) aiContext.conversationStarter = conversationStarter;
      }
    }

    const response = await deepinfraService.freeTalkConversation(messages, aiContext);

    // Generate TTS for all segments in parallel if voice is configured
    const voiceId = deepinfraService.resolveVoiceId(req.user, company);
    const audioSegments = await Promise.all(
      (response.segments || []).map(async (seg, i) => {
        if (!voiceId) return { ...seg, audioUrl: null };
        try {
          // Japanese uses the company/user voice clone; English uses the default voice
          const segVoiceId = seg.lang === 'ja' ? voiceId : null;
          const { buffer, mimeType } = await deepinfraService.textToSpeech(seg.text, seg.lang, segVoiceId);
          const ext = mimeType === 'audio/mpeg' ? 'mp3' : 'wav';
          const fileInfo = await storageService.saveAudio(buffer, `conv-${i}-${Date.now()}.${ext}`, req.companyId.toString());
          return { ...seg, audioUrl: fileInfo.url };
        } catch (err) {
          console.warn('Conversation TTS failed:', err.message);
          return { ...seg, audioUrl: null };
        }
      })
    );

    return successResponse(res, {
      segments: audioSegments,
      correction: response.correction || null,
      audioUrl: audioSegments.find(s => s.lang === 'ja')?.audioUrl || null
    });
  } catch (error) {
    next(error);
  }
};

export const generatePhrases = async (req, res, next) => {
  try {
    const { topic, difficulty = 'beginner', count = 5 } = req.body;

    if (!topic) {
      return errorResponse(res, 'Topic is required', ErrorCodes.VALIDATION_ERROR, null, 400);
    }

    const company = await Company.findById(req.companyId);
    
    const phrases = await deepinfraService.generatePhrases(topic, difficulty, count, {
      industry: company.industry
    });

    return successResponse(res, phrases);
  } catch (error) {
    next(error);
  }
};

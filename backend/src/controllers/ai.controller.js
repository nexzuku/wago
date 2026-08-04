import deepinfraService from '../services/deepinfra.service.js';
import storageService from '../services/storage.service.js';
import { Company, Topic } from '../models/index.js';
import { successResponse, errorResponse, ErrorCodes } from '../utils/response.js';
import axios from 'axios';
import * as cheerio from 'cheerio';
// PDF text extraction via raw binary parsing - Node 18 compatible, no native deps
function extractPdfText(buffer) {
  const raw = buffer.toString('latin1');
  const textParts = [];

  // Extract text from BT...ET blocks (PDF text objects) - most reliable source
  const btRegex = /BT\s*([\s\S]*?)\s*ET/g;
  let match;
  while ((match = btRegex.exec(raw)) !== null) {
    const block = match[1];
    // Match both (text) and <hex> string types
    const strMatch = block.match(/\(([^)\\]*(?:\\.[^)\\]*)*)\)/g);
    if (strMatch) {
      const text = strMatch
        .map(s => s.slice(1, -1).replace(/\\n/g, '\n').replace(/\\r/g, '').replace(/\\\\/g, '\\').replace(/\\(.)/g, '$1'))
        .join(' ');
      if (text.trim().length > 3) textParts.push(text);
    }
  }

  // Fallback: scan for readable ASCII runs if BT/ET yielded nothing
  if (textParts.length === 0) {
    const readable = raw.replace(/[^\x20-\x7E\n\r\t]/g, ' ').replace(/\s+/g, ' ').trim();
    if (readable.length > 50) textParts.push(readable.substring(0, 5000));
  }

  return textParts.join('\n');
}

export const extractCompanyInfo = async (req, res, next) => {
  try {
    const { content, type = 'text', url } = req.body;
    let extractionContent = content;

    // Handle URL scraping
    if (type === 'url' && url) {
      try {
        const response = await axios.get(url, {
          timeout: 10000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          }
        });
        
        const $ = cheerio.load(response.data);
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
        return errorResponse(res, 'Failed to fetch content from URL', ErrorCodes.EXTERNAL_SERVICE_ERROR, null, 400);
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

    // Parse PDF content (works on Node 18 with pdf-parse v1/v2 or raw fallback)
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
          const buffer = await deepinfraService.textToSpeech(seg.text, seg.lang, voiceId);
          const fileInfo = await storageService.saveAudio(buffer, `conv-${i}-${Date.now()}.mp3`, req.companyId.toString());
          return { ...seg, audioUrl: fileInfo.url };
        } catch { return { ...seg, audioUrl: null }; }
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

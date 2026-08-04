import { Phrase, Topic } from '../models/index.js';
import { successResponse, errorResponse, paginatedResponse, ErrorCodes } from '../utils/response.js';
import deepinfraService from '../services/deepinfra.service.js';
import storageService from '../services/storage.service.js';

export const listPhrases = async (req, res, next) => {
  try {
    const { topicId } = req.params;
    const { difficulty, page = 1, limit = 50 } = req.query;
    const skip = (page - 1) * limit;

    const query = { topicId, isActive: true };
    if (difficulty) query.difficulty = difficulty;

    const [phrases, total] = await Promise.all([
      Phrase.find(query)
        .sort({ sortOrder: 1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Phrase.countDocuments(query)
    ]);

    return paginatedResponse(res, phrases, page, limit, total);
  } catch (error) {
    next(error);
  }
};

export const createPhrase = async (req, res, next) => {
  try {
    const { topicId } = req.params;
    const { japanese, romaji, english, difficulty, tags, usageContext, isEmergency, emergencyCategory } = req.body;

    // Verify topic exists and belongs to company
    const topic = await Topic.findOne({
      _id: topicId,
      companyId: req.companyId
    });

    if (!topic) {
      return errorResponse(res, 'Topic not found', ErrorCodes.NOT_FOUND, null, 404);
    }

    const phrase = new Phrase({
      companyId: req.companyId,
      topicId,
      japanese,
      romaji,
      english,
      difficulty: difficulty || topic.difficulty,
      tags,
      usageContext,
      isEmergency,
      emergencyCategory,
      createdBy: req.user._id
    });
    await phrase.save();

    return successResponse(res, phrase, null, 201);
  } catch (error) {
    next(error);
  }
};

export const updatePhrase = async (req, res, next) => {
  try {
    const { japanese, romaji, english, difficulty, tags, usageContext, isEmergency, emergencyCategory, isActive, sortOrder } = req.body;

    const phrase = await Phrase.findById(req.params.id);

    if (!phrase) {
      return errorResponse(res, 'Phrase not found', ErrorCodes.NOT_FOUND, null, 404);
    }

    // Check if phrase belongs to company or is global
    if (phrase.companyId && phrase.companyId.toString() !== req.companyId.toString()) {
      return errorResponse(res, 'Phrase not found', ErrorCodes.NOT_FOUND, null, 404);
    }

    if (japanese !== undefined) phrase.japanese = japanese;
    if (romaji !== undefined) phrase.romaji = romaji;
    if (english !== undefined) phrase.english = english;
    if (difficulty !== undefined) phrase.difficulty = difficulty;
    if (tags !== undefined) phrase.tags = tags;
    if (usageContext !== undefined) phrase.usageContext = usageContext;
    if (isEmergency !== undefined) phrase.isEmergency = isEmergency;
    if (emergencyCategory !== undefined) phrase.emergencyCategory = emergencyCategory;
    if (isActive !== undefined) phrase.isActive = isActive;
    if (sortOrder !== undefined) phrase.sortOrder = sortOrder;

    await phrase.save();

    return successResponse(res, phrase);
  } catch (error) {
    next(error);
  }
};

export const deletePhrase = async (req, res, next) => {
  try {
    const phrase = await Phrase.findById(req.params.id);

    if (!phrase) {
      return errorResponse(res, 'Phrase not found', ErrorCodes.NOT_FOUND, null, 404);
    }

    if (phrase.companyId && phrase.companyId.toString() !== req.companyId.toString()) {
      return errorResponse(res, 'Phrase not found', ErrorCodes.NOT_FOUND, null, 404);
    }

    phrase.isActive = false;
    await phrase.save();

    return successResponse(res, { message: 'Phrase deleted' });
  } catch (error) {
    next(error);
  }
};

export const getEmergencyPhrases = async (req, res, next) => {
  try {
    const phrases = await Phrase.find({
      isEmergency: true,
      isActive: true,
      companyId: req.companyId
    }).sort({ emergencyCategory: 1, sortOrder: 1 });

    return successResponse(res, phrases);
  } catch (error) {
    next(error);
  }
};

// Batch pre-generate TTS audio for all phrases in a topic — run in parallel
export const batchGenerateTopicAudio = async (req, res, next) => {
  try {
    const { topicId } = req.params;
    const topic = await Topic.findOne({ _id: topicId, companyId: req.companyId });
    if (!topic) return errorResponse(res, 'Topic not found', ErrorCodes.NOT_FOUND, null, 404);

    const company = req.user.companyId;
    const voiceId = deepinfraService.resolveVoiceId(req.user, company);
    if (!voiceId) return errorResponse(res, 'No voice clone configured for this company', ErrorCodes.VALIDATION_ERROR, null, 400);

    const phrases = await Phrase.find({ topicId, isActive: true, companyId: req.companyId });
    if (!phrases.length) return successResponse(res, { generated: 0, total: 0 });

    // Generate TTS in parallel (up to all at once — DeepInfra handles concurrency)
    const results = await Promise.allSettled(
      phrases.map(async (phrase) => {
        const audioBuffer = await deepinfraService.textToSpeech(phrase.japanese, 'ja', voiceId);
        const fileInfo = await storageService.saveAudio(audioBuffer, `${phrase._id}.mp3`, req.companyId.toString());
        phrase.audioUrl = fileInfo.url;
        phrase.audioGeneratedAt = new Date();
        await phrase.save();
        return phrase._id;
      })
    );

    const generated = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    return successResponse(res, { generated, failed, total: phrases.length });
  } catch (error) {
    next(error);
  }
};

export const generatePhraseAudio = async (req, res, next) => {
  try {
    const phrase = await Phrase.findById(req.params.id);

    if (!phrase) {
      return errorResponse(res, 'Phrase not found', ErrorCodes.NOT_FOUND, null, 404);
    }

    const company = req.user.companyId;
    const voiceId = deepinfraService.resolveVoiceId(req.user, company);

    if (!voiceId) {
      return errorResponse(res, 'No voice clone configured for this company', ErrorCodes.VALIDATION_ERROR, null, 400);
    }

    const audioBuffer = await deepinfraService.textToSpeech(phrase.japanese, 'ja', voiceId);
    const fileInfo = await storageService.saveAudio(audioBuffer, `${phrase._id}.mp3`, req.companyId.toString());

    phrase.audioUrl = fileInfo.url;
    phrase.audioGeneratedAt = new Date();
    await phrase.save();

    return successResponse(res, phrase);
  } catch (error) {
    next(error);
  }
};

import { Topic, Phrase } from '../models/index.js';
import { successResponse, errorResponse, paginatedResponse, ErrorCodes } from '../utils/response.js';
import deepinfraService from '../services/deepinfra.service.js';

export const listTopics = async (req, res, next) => {
  try {
    const { category, difficulty, active } = req.query;

    const query = {};
    if (req.companyId) {
      query.companyId = req.companyId;
    } else {
      query.companyId = null;
    }
    
    if (category) query.category = category;
    if (difficulty) query.difficulty = difficulty;
    if (active !== undefined) query.isActive = active === 'true';

    const topics = await Topic.find(query).sort({ sortOrder: 1, createdAt: -1 });

    return successResponse(res, topics);
  } catch (error) {
    next(error);
  }
};

export const createTopic = async (req, res, next) => {
  try {
    const {
      name, description, icon, color, difficulty, category,
      backgroundContext, aiInstructions, vocabularyList, conversationStarters,
      assignedTo, assignedToAll
    } = req.body;

    const topic = new Topic({
      companyId: req.companyId,
      name,
      description,
      icon,
      color,
      difficulty,
      category,
      backgroundContext: backgroundContext || '',
      aiInstructions: aiInstructions || '',
      vocabularyList: vocabularyList || [],
      conversationStarters: conversationStarters || [],
      assignedTo: assignedTo || [],
      assignedToAll: assignedToAll !== undefined ? assignedToAll : true,
      createdBy: req.user._id
    });
    await topic.save();

    return successResponse(res, topic, null, 201);
  } catch (error) {
    next(error);
  }
};

export const getTopic = async (req, res, next) => {
  try {
    const topic = await Topic.findOne({
      _id: req.params.id,
      companyId: req.companyId
    });

    if (!topic) {
      return errorResponse(res, 'Topic not found', ErrorCodes.NOT_FOUND, null, 404);
    }

    // Get phrases for this topic
    const phrases = await Phrase.find({ 
      topicId: topic._id,
      isActive: true
    }).sort({ sortOrder: 1 });

    return successResponse(res, { ...topic.toObject(), phrases });
  } catch (error) {
    next(error);
  }
};

export const updateTopic = async (req, res, next) => {
  try {
    const {
      name, description, icon, color, difficulty, category, isActive, sortOrder,
      backgroundContext, aiInstructions, vocabularyList, conversationStarters,
      assignedTo, assignedToAll
    } = req.body;

    const topic = await Topic.findOne({
      _id: req.params.id,
      companyId: req.companyId // Can only update own topics
    });

    if (!topic) {
      return errorResponse(res, 'Topic not found', ErrorCodes.NOT_FOUND, null, 404);
    }

    if (name !== undefined) topic.name = name;
    if (description !== undefined) topic.description = description;
    if (icon !== undefined) topic.icon = icon;
    if (color !== undefined) topic.color = color;
    if (difficulty !== undefined) topic.difficulty = difficulty;
    if (category !== undefined) topic.category = category;
    if (isActive !== undefined) topic.isActive = isActive;
    if (sortOrder !== undefined) topic.sortOrder = sortOrder;
    if (backgroundContext !== undefined) topic.backgroundContext = backgroundContext;
    if (aiInstructions !== undefined) topic.aiInstructions = aiInstructions;
    if (vocabularyList !== undefined) topic.vocabularyList = vocabularyList;
    if (conversationStarters !== undefined) topic.conversationStarters = conversationStarters;
    if (assignedTo !== undefined) topic.assignedTo = assignedTo;
    if (assignedToAll !== undefined) topic.assignedToAll = assignedToAll;

    await topic.save();

    return successResponse(res, topic);
  } catch (error) {
    next(error);
  }
};

// Generate phrases using AI based on topic context
export const generateTopicPhrases = async (req, res, next) => {
  try {
    const { count = 5 } = req.body;

    const topic = await Topic.findOne({
      _id: req.params.id,
      companyId: req.companyId
    });

    if (!topic) {
      return errorResponse(res, 'Topic not found', ErrorCodes.NOT_FOUND, null, 404);
    }

    // Build rich context for AI
    const contextParts = [`Topic: ${topic.name}`];
    if (topic.description) contextParts.push(`Description: ${topic.description}`);
    if (topic.backgroundContext) contextParts.push(`Background: ${topic.backgroundContext}`);
    if (topic.aiInstructions) contextParts.push(`Instructions: ${topic.aiInstructions}`);
    if (topic.vocabularyList?.length > 0) {
      const vocabStr = topic.vocabularyList.map(v => `${v.japanese} (${v.romaji}) = ${v.english}`).join(', ');
      contextParts.push(`Key vocabulary: ${vocabStr}`);
    }

    const generated = await deepinfraService.generatePhrases(
      contextParts.join('\n'),
      topic.difficulty,
      count,
      { industry: req.company?.industry || '' }
    );

    // Optionally save them
    const { save } = req.body;
    let savedPhrases = [];
    if (save && Array.isArray(generated)) {
      const maxOrder = await Phrase.findOne({ topicId: topic._id }).sort({ sortOrder: -1 }).select('sortOrder');
      let order = (maxOrder?.sortOrder || 0) + 1;

      for (const p of generated) {
        const phrase = await Phrase.create({
          topicId: topic._id,
          companyId: topic.companyId,
          japanese: p.japanese,
          romaji: p.romaji,
          english: p.english,
          usageContext: p.usageContext || '',
          difficulty: topic.difficulty,
          sortOrder: order++,
          createdBy: req.user._id
        });
        savedPhrases.push(phrase);
      }
    }

    return successResponse(res, {
      generated,
      saved: savedPhrases,
      savedCount: savedPhrases.length
    });
  } catch (error) {
    next(error);
  }
};

// CRUD for phrases within a topic
export const createPhrase = async (req, res, next) => {
  try {
    const { japanese, romaji, english, usageContext, difficulty, tags, isEmergency, emergencyCategory } = req.body;

    const topic = await Topic.findOne({
      _id: req.params.id,
      companyId: req.companyId
    });

    if (!topic) {
      return errorResponse(res, 'Topic not found', ErrorCodes.NOT_FOUND, null, 404);
    }

    const maxOrder = await Phrase.findOne({ topicId: topic._id }).sort({ sortOrder: -1 }).select('sortOrder');

    const phrase = await Phrase.create({
      topicId: topic._id,
      companyId: topic.companyId,
      japanese,
      romaji,
      english,
      usageContext: usageContext || '',
      difficulty: difficulty || topic.difficulty,
      tags: tags || [],
      isEmergency: isEmergency || false,
      emergencyCategory: emergencyCategory || null,
      sortOrder: (maxOrder?.sortOrder || 0) + 1,
      createdBy: req.user._id
    });

    return successResponse(res, phrase, null, 201);
  } catch (error) {
    next(error);
  }
};

export const updatePhrase = async (req, res, next) => {
  try {
    const { japanese, romaji, english, usageContext, difficulty, tags, isActive, sortOrder, isEmergency, emergencyCategory } = req.body;

    const phrase = await Phrase.findOne({
      _id: req.params.phraseId,
      topicId: req.params.id,
      companyId: req.companyId
    });
    if (!phrase) {
      return errorResponse(res, 'Phrase not found', ErrorCodes.NOT_FOUND, null, 404);
    }

    if (japanese !== undefined) phrase.japanese = japanese;
    if (romaji !== undefined) phrase.romaji = romaji;
    if (english !== undefined) phrase.english = english;
    if (usageContext !== undefined) phrase.usageContext = usageContext;
    if (difficulty !== undefined) phrase.difficulty = difficulty;
    if (tags !== undefined) phrase.tags = tags;
    if (isActive !== undefined) phrase.isActive = isActive;
    if (sortOrder !== undefined) phrase.sortOrder = sortOrder;
    if (isEmergency !== undefined) phrase.isEmergency = isEmergency;
    if (emergencyCategory !== undefined) phrase.emergencyCategory = emergencyCategory;

    await phrase.save();
    return successResponse(res, phrase);
  } catch (error) {
    next(error);
  }
};

export const deletePhrase = async (req, res, next) => {
  try {
    const phrase = await Phrase.findOne({
      _id: req.params.phraseId,
      topicId: req.params.id,
      companyId: req.companyId
    });
    if (!phrase) {
      return errorResponse(res, 'Phrase not found', ErrorCodes.NOT_FOUND, null, 404);
    }

    phrase.isActive = false;
    await phrase.save();
    return successResponse(res, { message: 'Phrase deleted' });
  } catch (error) {
    next(error);
  }
};

// ─── Bulk Import Phrases from CSV ───
export const bulkImportPhrases = async (req, res, next) => {
  try {
    const { phrases } = req.body; // Array of { japanese, romaji, english, difficulty, usageContext, tags }
    const topicId = req.params.id;

    const topic = await Topic.findOne({
      _id: topicId,
      companyId: req.companyId
    });

    if (!topic) {
      return errorResponse(res, 'Topic not found', ErrorCodes.NOT_FOUND, null, 400);
    }

    if (!Array.isArray(phrases) || phrases.length === 0) {
      return errorResponse(res, 'Phrases array is required', ErrorCodes.VALIDATION_ERROR, null, 400);
    }

    const results = { created: 0, skipped: 0, errors: [] };

    for (let i = 0; i < phrases.length; i++) {
      const p = phrases[i];
      if (!p.japanese || !p.romaji || !p.english) {
        results.errors.push(`Row ${i + 1}: Missing required fields (japanese, romaji, english)`);
        results.skipped++;
        continue;
      }

      try {
        await Phrase.create({
          companyId: topic.companyId || req.companyId,
          topicId,
          japanese: p.japanese.trim(),
          romaji: p.romaji.trim(),
          english: p.english.trim(),
          difficulty: p.difficulty || topic.difficulty || 'beginner',
          usageContext: p.usageContext || '',
          tags: p.tags ? (Array.isArray(p.tags) ? p.tags : p.tags.split(',').map(t => t.trim())) : [],
          createdBy: req.user._id,
          sortOrder: i
        });
        results.created++;
      } catch (err) {
        results.errors.push(`Row ${i + 1}: ${err.message}`);
        results.skipped++;
      }
    }

    return successResponse(res, results, `Imported ${results.created} phrases, ${results.skipped} skipped`, 201);
  } catch (error) {
    next(error);
  }
};

export const deleteTopic = async (req, res, next) => {
  try {
    const topic = await Topic.findOne({
      _id: req.params.id,
      companyId: req.companyId
    });

    if (!topic) {
      return errorResponse(res, 'Topic not found', ErrorCodes.NOT_FOUND, null, 404);
    }

    // Soft delete - just mark as inactive
    topic.isActive = false;
    await topic.save();

    return successResponse(res, { message: 'Topic deleted' });
  } catch (error) {
    next(error);
  }
};

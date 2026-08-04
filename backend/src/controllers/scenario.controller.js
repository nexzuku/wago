import { Scenario, TrainingSession, Phrase, AuditLog } from '../models/index.js';
import { successResponse, errorResponse, ErrorCodes } from '../utils/response.js';

// Admin: List all scenarios
export const listScenarios = async (req, res, next) => {
  try {
    const scenarios = await Scenario.find({
      companyId: req.companyId,
      isActive: true
    })
      .populate('topicIds', 'name icon')
      .populate('prerequisiteScenarioId', 'title')
      .sort({ category: 1, sortOrder: 1 });

    return successResponse(res, scenarios);
  } catch (error) {
    next(error);
  }
};

// Admin: Create scenario
export const createScenario = async (req, res, next) => {
  try {
    const { title, description, icon, category, categoryLabel, difficulty, duration, topicIds, prerequisiteScenarioId, sortOrder } = req.body;

    const scenario = new Scenario({
      companyId: req.companyId,
      title,
      description,
      icon,
      category,
      categoryLabel,
      difficulty,
      duration,
      topicIds,
      prerequisiteScenarioId,
      sortOrder,
      createdBy: req.user._id
    });
    await scenario.save();

    await AuditLog.create({
      companyId: req.companyId,
      userId: req.user._id,
      action: 'scenario.created',
      resource: 'settings',
      resourceId: scenario._id,
      details: { title, category }
    });

    return successResponse(res, scenario, null, 201);
  } catch (error) {
    next(error);
  }
};

// Admin: Update scenario
export const updateScenario = async (req, res, next) => {
  try {
    const { title, description, icon, category, categoryLabel, difficulty, duration, topicIds, prerequisiteScenarioId, sortOrder, isActive } = req.body;

    const scenario = await Scenario.findOne({
      _id: req.params.id,
      companyId: req.companyId
    });

    if (!scenario) {
      return errorResponse(res, 'Scenario not found', ErrorCodes.NOT_FOUND, null, 404);
    }

    if (title !== undefined) scenario.title = title;
    if (description !== undefined) scenario.description = description;
    if (icon !== undefined) scenario.icon = icon;
    if (category !== undefined) scenario.category = category;
    if (categoryLabel !== undefined) scenario.categoryLabel = categoryLabel;
    if (difficulty !== undefined) scenario.difficulty = difficulty;
    if (duration !== undefined) scenario.duration = duration;
    if (topicIds !== undefined) scenario.topicIds = topicIds;
    if (prerequisiteScenarioId !== undefined) scenario.prerequisiteScenarioId = prerequisiteScenarioId;
    if (sortOrder !== undefined) scenario.sortOrder = sortOrder;
    if (isActive !== undefined) scenario.isActive = isActive;

    await scenario.save();

    return successResponse(res, scenario);
  } catch (error) {
    next(error);
  }
};

// Admin: Delete scenario
export const deleteScenario = async (req, res, next) => {
  try {
    const scenario = await Scenario.findOne({
      _id: req.params.id,
      companyId: req.companyId
    });

    if (!scenario) {
      return errorResponse(res, 'Scenario not found', ErrorCodes.NOT_FOUND, null, 404);
    }

    scenario.isActive = false;
    await scenario.save();

    return successResponse(res, { message: 'Scenario deleted' });
  } catch (error) {
    next(error);
  }
};

// Employee: Get scenarios with progress
export const getScenariosForTraining = async (req, res, next) => {
  try {
    const scenarios = await Scenario.find({
      companyId: req.companyId,
      isActive: true
    })
      .populate('topicIds', 'name icon')
      .sort({ category: 1, sortOrder: 1 });

    // Get user's completed sessions
    const sessions = await TrainingSession.find({
      userId: req.user._id,
      isCompleted: true
    }).select('topicId averageScore');

    const completedTopicIds = new Set(
      sessions.filter(s => s.averageScore >= 60).map(s => s.topicId?.toString())
    );

    // Get phrase counts per topic
    const topicPhraseCountMap = {};
    for (const scenario of scenarios) {
      for (const topic of (scenario.topicIds || [])) {
        const tid = topic._id?.toString() || topic.toString();
        if (!topicPhraseCountMap[tid]) {
          const count = await Phrase.countDocuments({ topicId: tid, isActive: true });
          topicPhraseCountMap[tid] = count;
        }
      }
    }

    const baseScenarios = scenarios.map(s => {
      const obj = s.toObject();
      const topicCount = (obj.topicIds || []).length;
      const completedCount = (obj.topicIds || []).filter(t =>
        completedTopicIds.has(t._id?.toString() || t.toString())
      ).length;

      obj.progress = topicCount > 0 ? Math.round((completedCount / topicCount) * 100) : 0;
      obj.phraseCount = (obj.topicIds || []).reduce((sum, t) => {
        return sum + (topicPhraseCountMap[t._id?.toString() || t.toString()] || 0);
      }, 0);

      return obj;
    });

    const progressMap = new Map(baseScenarios.map(s => [s._id.toString(), s.progress]));

    const scenariosWithProgress = baseScenarios.map(obj => {
      const prereqId = obj.prerequisiteScenarioId?.toString();
      const prereqProgress = prereqId ? (progressMap.get(prereqId) || 0) : null;

      if (obj.progress >= 100) {
        obj.status = 'completed';
      } else if (prereqId) {
        obj.status = prereqProgress >= 100 || obj.progress > 0 ? 'available' : 'locked';
      } else {
        obj.status = 'available';
      }

      return obj;
    });

    // Group by category
    const grouped = {};
    scenariosWithProgress.forEach(s => {
      const cat = s.categoryLabel || s.category || 'General';
      if (!grouped[cat]) grouped[cat] = { category: cat, icon: s.icon, scenarios: [] };
      grouped[cat].scenarios.push(s);
    });

    return successResponse(res, {
      categories: Object.values(grouped),
      flat: scenariosWithProgress
    });
  } catch (error) {
    next(error);
  }
};

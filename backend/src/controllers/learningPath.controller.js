import { LearningPath, TrainingSession, AuditLog } from '../models/index.js';
import { successResponse, errorResponse, ErrorCodes } from '../utils/response.js';

// Admin: List all learning paths
export const listLearningPaths = async (req, res, next) => {
  try {
    const paths = await LearningPath.find({
      companyId: req.companyId,
      isActive: true
    })
      .populate('modules.topicIds', 'name icon')
      .populate('modules.contentIds', 'title type description fileUrl')
      .populate('prerequisitePathId', 'title level')
      .sort({ sortOrder: 1 });

    return successResponse(res, paths);
  } catch (error) {
    next(error);
  }
};

// Admin: Create learning path
export const createLearningPath = async (req, res, next) => {
  try {
    const { level, levelLabel, title, description, duration, modules, prerequisitePathId, sortOrder } = req.body;

    const path = new LearningPath({
      companyId: req.companyId,
      level,
      levelLabel,
      title,
      description,
      duration,
      modules,
      prerequisitePathId,
      sortOrder,
      createdBy: req.user._id
    });
    await path.save();

    await AuditLog.create({
      companyId: req.companyId,
      userId: req.user._id,
      action: 'learningpath.created',
      resource: 'settings',
      resourceId: path._id,
      details: { title, level }
    });

    return successResponse(res, path, null, 201);
  } catch (error) {
    next(error);
  }
};

// Admin: Update learning path
export const updateLearningPath = async (req, res, next) => {
  try {
    const { level, levelLabel, title, description, duration, modules, prerequisitePathId, sortOrder, isActive } = req.body;

    const path = await LearningPath.findOne({
      _id: req.params.id,
      companyId: req.companyId
    });

    if (!path) {
      return errorResponse(res, 'Learning path not found', ErrorCodes.NOT_FOUND, null, 404);
    }

    if (level !== undefined) path.level = level;
    if (levelLabel !== undefined) path.levelLabel = levelLabel;
    if (title !== undefined) path.title = title;
    if (description !== undefined) path.description = description;
    if (duration !== undefined) path.duration = duration;
    if (modules !== undefined) path.modules = modules;
    if (prerequisitePathId !== undefined) path.prerequisitePathId = prerequisitePathId;
    if (sortOrder !== undefined) path.sortOrder = sortOrder;
    if (isActive !== undefined) path.isActive = isActive;

    await path.save();

    return successResponse(res, path);
  } catch (error) {
    next(error);
  }
};

// Admin: Delete learning path
export const deleteLearningPath = async (req, res, next) => {
  try {
    const path = await LearningPath.findOne({
      _id: req.params.id,
      companyId: req.companyId
    });

    if (!path) {
      return errorResponse(res, 'Learning path not found', ErrorCodes.NOT_FOUND, null, 404);
    }

    path.isActive = false;
    await path.save();

    return successResponse(res, { message: 'Learning path deleted' });
  } catch (error) {
    next(error);
  }
};

// Employee: Get learning paths with progress
export const getPathsForTraining = async (req, res, next) => {
  try {
    const paths = await LearningPath.find({
      companyId: req.companyId,
      isActive: true
    })
      .populate('modules.topicIds', 'name icon')
      .populate('modules.contentIds', 'title type description fileUrl')
      .populate('prerequisitePathId', 'title level')
      .sort({ sortOrder: 1 });

    // Get user's completed sessions to calculate module progress
    const sessions = await TrainingSession.find({
      userId: req.user._id,
      isCompleted: true
    }).select('topicId averageScore');

    const completedTopicIds = new Set(
      sessions.filter(s => s.averageScore >= 60).map(s => s.topicId?.toString())
    );

    const basePaths = paths.map(p => {
      const pathObj = p.toObject();
      let totalTopics = 0;
      let completedTopics = 0;

      pathObj.modules = pathObj.modules.map(mod => {
        const modTopicCount = mod.topicIds?.length || 0;
        const modCompleted = (mod.topicIds || []).filter(t =>
          completedTopicIds.has(t._id?.toString() || t.toString())
        ).length;

        totalTopics += modTopicCount;
        completedTopics += modCompleted;

        let status = 'locked';
        if (modCompleted === modTopicCount && modTopicCount > 0) status = 'completed';
        else if (modCompleted > 0) status = 'current';

        return { ...mod, status, completedCount: modCompleted, totalCount: modTopicCount };
      });

      pathObj.progress = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

      return pathObj;
    });

    const progressMap = new Map(basePaths.map(p => [p._id.toString(), p.progress]));

    const pathsWithProgress = basePaths.map(pathObj => {
      const prereqId = pathObj.prerequisitePathId?._id?.toString() || pathObj.prerequisitePathId?.toString();
      const prereqProgress = prereqId ? (progressMap.get(prereqId) || 0) : null;
      const unlocked = prereqId ? prereqProgress >= 100 : true;

      // Normalize module statuses: unlock first incomplete module if path is unlocked
      if (unlocked) {
        let foundCurrent = false;
        pathObj.modules = pathObj.modules.map(mod => {
          if (mod.status === 'completed') return mod;
          if (!foundCurrent) {
            foundCurrent = true;
            return { ...mod, status: 'current' };
          }
          return { ...mod, status: 'locked' };
        });
      } else {
        pathObj.modules = pathObj.modules.map(mod => ({ ...mod, status: 'locked' }));
      }

      return { ...pathObj, unlocked };
    });

    return successResponse(res, pathsWithProgress);
  } catch (error) {
    next(error);
  }
};

import { TrainingSession, Topic, Phrase, User, SavedPhrase, AudioMetric } from '../models/index.js';
import { successResponse, errorResponse, paginatedResponse, ErrorCodes } from '../utils/response.js';
import { checkAndAwardBadges, getAllBadgeDefinitions } from '../services/badges.service.js';

export const getAssignedTopics = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Get all active topics for this company
    const allTopics = await Topic.find({
      companyId: req.companyId,
      isActive: true
    }).sort({ sortOrder: 1 });

    // Filter: show topic if assignedToAll=true OR user is in assignedTo list
    const visibleTopics = allTopics.filter(topic => {
      if (topic.assignedToAll) return true;
      if (topic.assignedTo?.some(id => id.toString() === userId.toString())) return true;
      return false;
    });

    // Also check user-level assignments as override
    const user = await User.findById(userId);
    if (user.assignedTopics?.length > 0) {
      const assignedIds = new Set(user.assignedTopics.map(id => id.toString()));
      const merged = visibleTopics.filter(t => assignedIds.has(t._id.toString()) || t.assignedToAll);
      return successResponse(res, merged);
    }

    return successResponse(res, visibleTopics);
  } catch (error) {
    next(error);
  }
};

export const getAudioMetrics = async (req, res, next) => {
  try {
    const { period = '7d' } = req.query;

    let startDate = new Date();
    switch (period) {
      case '7d': startDate.setDate(startDate.getDate() - 7); break;
      case '30d': startDate.setDate(startDate.getDate() - 30); break;
      case '90d': startDate.setDate(startDate.getDate() - 90); break;
      default: startDate.setDate(startDate.getDate() - 7);
    }

    const match = { userId: req.user._id, createdAt: { $gte: startDate } };

    const [summary] = await AudioMetric.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          energyAvg: { $avg: '$energy.score' },
          timingAvg: { $avg: '$timing.score' },
          stabilityAvg: { $avg: '$stability.score' },
          articulationAvg: { $avg: '$articulation.score' },
          accuracyAvg: { $avg: '$accuracy' },
          disengagementAvg: { $avg: '$sensoryDisengagement.score' }
        }
      }
    ]);

    const dailyTrend = await AudioMetric.aggregate([
      { $match: match },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          energy: { $avg: '$energy.score' },
          accuracy: { $avg: '$accuracy' },
          stability: { $avg: '$stability.score' },
          timing: { $avg: '$timing.score' },
          articulation: { $avg: '$articulation.score' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    return successResponse(res, {
      summary: {
        count: summary?.count || 0,
        energyAvg: Math.round(summary?.energyAvg || 0),
        timingAvg: Math.round(summary?.timingAvg || 0),
        stabilityAvg: Math.round(summary?.stabilityAvg || 0),
        articulationAvg: Math.round(summary?.articulationAvg || 0),
        accuracyAvg: Math.round(summary?.accuracyAvg || 0),
        disengagementAvg: Math.round(summary?.disengagementAvg || 0)
      },
      dailyTrend: dailyTrend.map(d => ({
        date: d._id,
        energy: Math.round(d.energy || 0),
        accuracy: Math.round(d.accuracy || 0),
        stability: Math.round(d.stability || 0),
        timing: Math.round(d.timing || 0),
        articulation: Math.round(d.articulation || 0)
      }))
    });
  } catch (error) {
    next(error);
  }
};

export const getTrainingPhrases = async (req, res, next) => {
  try {
    const { topicId } = req.params;
    const { limit = 20, random = false } = req.query;

    const query = {
      topicId,
      isActive: true,
      companyId: req.companyId
    };

    let phrases;
    if (random === 'true') {
      phrases = await Phrase.aggregate([
        { $match: query },
        { $sample: { size: parseInt(limit) } }
      ]);
    } else {
      phrases = await Phrase.find(query)
        .sort({ sortOrder: 1 })
        .limit(parseInt(limit));
    }

    return successResponse(res, phrases);
  } catch (error) {
    next(error);
  }
};

export const startSession = async (req, res, next) => {
  try {
    const { topicId, mode } = req.body;

    if (!['listen_repeat', 'test', 'free_talk'].includes(mode)) {
      return errorResponse(res, 'Invalid mode', ErrorCodes.VALIDATION_ERROR, null, 400);
    }

    const session = new TrainingSession({
      userId: req.user._id,
      companyId: req.companyId,
      topicId,
      mode
    });
    await session.save();

    return successResponse(res, session, null, 201);
  } catch (error) {
    next(error);
  }
};

export const updateSession = async (req, res, next) => {
  try {
    const { attempt, conversationMessage } = req.body;

    const session = await TrainingSession.findOne({
      _id: req.params.id,
      userId: req.user._id,
      isCompleted: false
    });

    if (!session) {
      return errorResponse(res, 'Session not found', ErrorCodes.NOT_FOUND, null, 404);
    }

    if (attempt) {
      session.attempts.push(attempt);
    }

    if (conversationMessage) {
      session.conversation.push(conversationMessage);
    }

    await session.save();

    return successResponse(res, session);
  } catch (error) {
    next(error);
  }
};

export const completeSession = async (req, res, next) => {
  try {
    const session = await TrainingSession.findOne({
      _id: req.params.id,
      userId: req.user._id,
      isCompleted: false
    });

    if (!session) {
      return errorResponse(res, 'Session not found', ErrorCodes.NOT_FOUND, null, 404);
    }

    session.complete();
    await session.save();

    // Update user progress
    const user = await User.findById(req.user._id);
    user.progress.totalPhrasesPracticed += session.phrasesAttempted;
    user.progress.totalTimeMinutes += session.durationMinutes;
    user.progress.lastActiveAt = new Date();

    // Update streak
    const today = new Date().toDateString();
    const lastActive = user.progress.lastActiveAt ? new Date(user.progress.lastActiveAt).toDateString() : null;
    
    if (lastActive !== today) {
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      if (lastActive === yesterday) {
        user.progress.currentStreak += 1;
      } else {
        user.progress.currentStreak = 1;
      }
      
      if (user.progress.currentStreak > user.progress.longestStreak) {
        user.progress.longestStreak = user.progress.currentStreak;
      }
    }

    // Update skills based on session performance
    if (session.averageScore > 0) {
      const weight = 0.1; // How much this session affects overall score
      user.progress.skills.pronunciation = Math.round(
        user.progress.skills.pronunciation * (1 - weight) + session.averageScore * weight
      );
    }

    // Award stars
    if (session.averageScore >= 90) {
      user.stars += 3;
    } else if (session.averageScore >= 70) {
      user.stars += 2;
    } else if (session.averageScore >= 50) {
      user.stars += 1;
    }

    // Update daily goals
    resetDailyGoalsIfNeeded(user);
    user.dailyGoals.phrasesToday += session.phrasesAttempted;
    user.dailyGoals.minutesToday += session.durationMinutes;

    await user.save();

    // Check for new badges
    const totalSessions = await TrainingSession.countDocuments({ userId: req.user._id, isCompleted: true });
    const freeTalkSessions = await TrainingSession.countDocuments({ userId: req.user._id, isCompleted: true, mode: 'free_talk' });
    const newBadges = await checkAndAwardBadges(user, {
      totalSessions,
      sessionScore: session.averageScore,
      avgScore: session.averageScore,
      freeTalkSessions
    });

    return successResponse(res, {
      session,
      userProgress: user.progress,
      starsEarned: session.averageScore >= 90 ? 3 : session.averageScore >= 70 ? 2 : session.averageScore >= 50 ? 1 : 0,
      newBadges
    });
  } catch (error) {
    next(error);
  }
};

export const getProgress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    
    // Get recent sessions
    const recentSessions = await TrainingSession.find({
      userId: req.user._id,
      isCompleted: true
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('topicId', 'name icon');

    return successResponse(res, {
      progress: user.progress,
      stars: user.stars,
      badges: user.badges,
      recentSessions
    });
  } catch (error) {
    next(error);
  }
};

export const getLeaderboard = async (req, res, next) => {
  try {
    const { period = '7d' } = req.query;

    let startDate = new Date();
    switch (period) {
      case '7d': startDate.setDate(startDate.getDate() - 7); break;
      case '30d': startDate.setDate(startDate.getDate() - 30); break;
      case 'all': startDate = new Date(0); break;
      default: startDate.setDate(startDate.getDate() - 7);
    }

    // Get all employees in the same company
    const employees = await User.find({
      companyId: req.companyId,
      role: 'employee',
      status: 'active'
    }).select('profile stars progress');

    // Get session data for the period
    const sessions = await TrainingSession.aggregate([
      {
        $match: {
          companyId: req.companyId,
          isCompleted: true,
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$userId',
          totalPhrases: { $sum: '$phrasesAttempted' },
          totalMinutes: { $sum: '$durationMinutes' },
          avgScore: { $avg: '$averageScore' },
          sessionCount: { $sum: 1 }
        }
      }
    ]);

    const sessionMap = {};
    sessions.forEach(s => { sessionMap[s._id.toString()] = s; });

    const leaderboard = employees.map(emp => {
      const s = sessionMap[emp._id.toString()] || {};
      // Balanced formula: quality (avgScore) weighted equally with quantity so a high-accuracy
      // learner ranks above a low-accuracy phrase-grinder
      const score = (s.avgScore || 0) * 10 + (s.totalPhrases || 0) * 5 + (s.totalMinutes || 0) * 3;
      return {
        userId: emp._id,
        name: `${emp.profile?.firstName || ''} ${emp.profile?.lastName || ''}`.trim(),
        totalPhrases: s.totalPhrases || 0,
        totalMinutes: s.totalMinutes || 0,
        avgScore: Math.round(s.avgScore || 0),
        score: Math.round(score),
        isCurrentUser: emp._id.toString() === req.user._id.toString()
      };
    }).sort((a, b) => b.score - a.score);

    // Add rank
    leaderboard.forEach((entry, i) => { entry.rank = i + 1; });

    return successResponse(res, leaderboard);
  } catch (error) {
    next(error);
  }
};

export const getStats = async (req, res, next) => {
  try {
    const { period = '7d' } = req.query;
    
    let startDate = new Date();
    switch (period) {
      case '7d': startDate.setDate(startDate.getDate() - 7); break;
      case '30d': startDate.setDate(startDate.getDate() - 30); break;
      case '90d': startDate.setDate(startDate.getDate() - 90); break;
      default: startDate.setDate(startDate.getDate() - 7);
    }

    // Use aggregation to avoid loading all session documents into memory
    const [agg] = await TrainingSession.aggregate([
      { $match: { userId: req.user._id, isCompleted: true, createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: null,
          totalSessions: { $sum: 1 },
          totalMinutes: { $sum: '$durationMinutes' },
          totalPhrases: { $sum: '$phrasesAttempted' },
          averageScore: { $avg: '$averageScore' },
          listen_repeat: { $sum: { $cond: [{ $eq: ['$mode', 'listen_repeat'] }, 1, 0] } },
          test: { $sum: { $cond: [{ $eq: ['$mode', 'test'] }, 1, 0] } },
          free_talk: { $sum: { $cond: [{ $eq: ['$mode', 'free_talk'] }, 1, 0] } }
        }
      }
    ]);

    const stats = {
      totalSessions: agg?.totalSessions || 0,
      totalMinutes: agg?.totalMinutes || 0,
      totalPhrases: agg?.totalPhrases || 0,
      averageScore: agg ? Math.round(agg.averageScore || 0) : 0,
      byMode: {
        listen_repeat: agg?.listen_repeat || 0,
        test: agg?.test || 0,
        free_talk: agg?.free_talk || 0
      }
    };

    return successResponse(res, stats);
  } catch (error) {
    next(error);
  }
};

// ─── Daily Goals ───
const resetDailyGoalsIfNeeded = (user) => {
  const today = new Date().toISOString().split('T')[0];
  if (!user.dailyGoals) {
    user.dailyGoals = { phrasesTarget: 10, minutesTarget: 5, phrasesToday: 0, minutesToday: 0, lastResetDate: today };
  }
  if (user.dailyGoals.lastResetDate !== today) {
    user.dailyGoals.phrasesToday = 0;
    user.dailyGoals.minutesToday = 0;
    user.dailyGoals.lastResetDate = today;
  }
};

export const getDailyGoals = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    resetDailyGoalsIfNeeded(user);
    await user.save();
    return successResponse(res, user.dailyGoals);
  } catch (error) {
    next(error);
  }
};

export const updateDailyGoalTargets = async (req, res, next) => {
  try {
    const { phrasesTarget, minutesTarget } = req.body;
    const user = await User.findById(req.user._id);
    resetDailyGoalsIfNeeded(user);
    if (phrasesTarget !== undefined) user.dailyGoals.phrasesTarget = Math.max(1, phrasesTarget);
    if (minutesTarget !== undefined) user.dailyGoals.minutesTarget = Math.max(1, minutesTarget);
    await user.save();
    return successResponse(res, user.dailyGoals);
  } catch (error) {
    next(error);
  }
};

// ─── Saved / Favorite Phrases ───
export const getSavedPhrases = async (req, res, next) => {
  try {
    const saved = await SavedPhrase.find({ userId: req.user._id })
      .populate('phraseId')
      .populate('topicId', 'name icon color')
      .sort({ createdAt: -1 });

    return successResponse(res, saved.filter(s => s.phraseId)); // filter out deleted phrases
  } catch (error) {
    next(error);
  }
};

export const toggleSavePhrase = async (req, res, next) => {
  try {
    const { phraseId, topicId } = req.body;

    const existing = await SavedPhrase.findOne({
      userId: req.user._id,
      phraseId
    });

    if (existing) {
      await SavedPhrase.deleteOne({ _id: existing._id });
      return successResponse(res, { saved: false, message: 'Phrase removed from favorites' });
    }

    await SavedPhrase.create({
      userId: req.user._id,
      phraseId,
      topicId: topicId || null
    });

    return successResponse(res, { saved: true, message: 'Phrase saved to favorites' });
  } catch (error) {
    next(error);
  }
};

export const getSavedPhraseIds = async (req, res, next) => {
  try {
    const saved = await SavedPhrase.find({ userId: req.user._id }).select('phraseId');
    return successResponse(res, saved.map(s => s.phraseId.toString()));
  } catch (error) {
    next(error);
  }
};

// ─── Pronunciation History ───
export const getPronunciationHistory = async (req, res, next) => {
  try {
    const { topicId, limit = 50 } = req.query;

    const query = {
      userId: req.user._id,
      isCompleted: true,
      'attempts.0': { $exists: true } // only sessions with attempts
    };
    if (topicId) query.topicId = topicId;

    const sessions = await TrainingSession.find(query)
      .populate('topicId', 'name icon color')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .select('topicId mode attempts createdAt averageScore');

    // Flatten attempts with session context
    const history = [];
    for (const session of sessions) {
      for (const attempt of session.attempts) {
        history.push({
          _id: attempt._id,
          sessionId: session._id,
          topicName: session.topicId?.name || 'Unknown',
          topicIcon: session.topicId?.icon || '📚',
          mode: session.mode,
          phraseId: attempt.phraseId,
          userTranscript: attempt.userTranscript,
          score: attempt.score,
          feedback: attempt.feedback,
          attemptedAt: attempt.attemptedAt || session.createdAt
        });
      }
    }

    // Sort by date desc and limit
    history.sort((a, b) => new Date(b.attemptedAt) - new Date(a.attemptedAt));

    return successResponse(res, history.slice(0, parseInt(limit)));
  } catch (error) {
    next(error);
  }
};

// ─── Badges ───
export const getBadgeDefinitions = async (req, res, next) => {
  try {
    const definitions = getAllBadgeDefinitions();
    const userBadges = new Set((await User.findById(req.user._id).select('badges')).badges || []);
    const result = definitions.map(b => ({
      ...b,
      earned: userBadges.has(b.id),
      check: undefined
    }));
    return successResponse(res, result);
  } catch (error) {
    next(error);
  }
};

export const getUserBadges = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('badges');
    const definitions = getAllBadgeDefinitions();
    const earned = (user.badges || []).map(id => {
      const def = definitions.find(b => b.id === id);
      return def ? { id: def.id, name: def.name, icon: def.icon, description: def.description } : { id, name: id, icon: '🏅', description: '' };
    });
    return successResponse(res, earned);
  } catch (error) {
    next(error);
  }
};

import { TrainingSession, User, Topic, Phrase, AudioMetric } from '../models/index.js';
import { successResponse, errorResponse, ErrorCodes } from '../utils/response.js';

export const getCompanyAnalytics = async (req, res, next) => {
  try {
    const { period = '7d' } = req.query;
    const companyId = req.companyId;

    let startDate = new Date();
    switch (period) {
      case '7d': startDate.setDate(startDate.getDate() - 7); break;
      case '30d': startDate.setDate(startDate.getDate() - 30); break;
      case '90d': startDate.setDate(startDate.getDate() - 90); break;
      default: startDate.setDate(startDate.getDate() - 7);
    }

    const sessionMatch = { companyId, isCompleted: true, createdAt: { $gte: startDate } };

    // Run all aggregations + counts in parallel — avoids loading session docs into memory
    const [
      employeeCount,
      [overviewAgg],
      modeAgg,
      topicAgg,
      activityAgg,
      empAgg,
      topicCount,
      phraseCount
    ] = await Promise.all([
      User.countDocuments({ companyId, role: 'employee', status: 'active' }),

      // Single-pass overview: totals + active user count
      TrainingSession.aggregate([
        { $match: sessionMatch },
        {
          $group: {
            _id: null,
            totalSessions: { $sum: 1 },
            totalMinutes: { $sum: '$durationMinutes' },
            totalPhrases: { $sum: '$phrasesAttempted' },
            avgScore: { $avg: '$averageScore' },
            activeUsers: { $addToSet: '$userId' }
          }
        }
      ]),

      // Mode breakdown
      TrainingSession.aggregate([
        { $match: sessionMatch },
        { $group: { _id: '$mode', count: { $sum: 1 } } }
      ]),

      // Topic popularity — $lookup for name/icon, no populate
      TrainingSession.aggregate([
        { $match: sessionMatch },
        {
          $group: {
            _id: '$topicId',
            sessions: { $sum: 1 },
            avgScore: { $avg: '$averageScore' }
          }
        },
        {
          $lookup: {
            from: 'topics',
            localField: '_id',
            foreignField: '_id',
            as: 'topic'
          }
        },
        { $unwind: { path: '$topic', preserveNullAndEmpty: true } },
        {
          $project: {
            name: { $ifNull: ['$topic.name', 'Unknown'] },
            icon: { $ifNull: ['$topic.icon', '📚'] },
            sessions: 1,
            avgScore: { $round: ['$avgScore', 0] }
          }
        },
        { $sort: { sessions: -1 } },
        { $limit: 10 }
      ]),

      // Daily activity chart
      TrainingSession.aggregate([
        { $match: sessionMatch },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            sessions: { $sum: 1 },
            minutes: { $sum: '$durationMinutes' },
            phrases: { $sum: '$phrasesAttempted' }
          }
        },
        { $sort: { _id: 1 } }
      ]),

      // Employee performance — $lookup for profile name
      TrainingSession.aggregate([
        { $match: sessionMatch },
        {
          $group: {
            _id: '$userId',
            sessions: { $sum: 1 },
            avgScore: { $avg: '$averageScore' },
            phrases: { $sum: '$phrasesAttempted' },
            minutes: { $sum: '$durationMinutes' }
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'user'
          }
        },
        { $unwind: { path: '$user', preserveNullAndEmpty: true } },
        {
          $project: {
            name: {
              $trim: {
                input: {
                  $concat: [
                    { $ifNull: ['$user.profile.firstName', ''] },
                    ' ',
                    { $ifNull: ['$user.profile.lastName', ''] }
                  ]
                }
              }
            },
            sessions: 1,
            avgScore: { $round: ['$avgScore', 0] },
            phrases: 1,
            minutes: 1
          }
        },
        { $sort: { avgScore: -1 } },
        { $limit: 20 }
      ]),

      Topic.countDocuments({ companyId, isActive: true }),
      Phrase.countDocuments({ companyId, isActive: true })
    ]);

    // Shape mode breakdown from aggregation result
    const modeMap = {};
    modeAgg.forEach(m => { modeMap[m._id] = m.count; });

    return successResponse(res, {
      overview: {
        totalEmployees: employeeCount,
        activeEmployees: overviewAgg?.activeUsers?.length || 0,
        totalSessions: overviewAgg?.totalSessions || 0,
        totalMinutes: overviewAgg?.totalMinutes || 0,
        totalPhrases: overviewAgg?.totalPhrases || 0,
        avgScore: overviewAgg ? Math.round(overviewAgg.avgScore || 0) : 0,
        topicCount,
        phraseCount
      },
      modeBreakdown: {
        listen_repeat: modeMap.listen_repeat || 0,
        test: modeMap.test || 0,
        free_talk: modeMap.free_talk || 0
      },
      topicPopularity: topicAgg,
      activityChart: activityAgg.map(d => ({ date: d._id, sessions: d.sessions, minutes: d.minutes, phrases: d.phrases })),
      employeePerformance: empAgg.map(e => ({ name: e.name || 'Employee', sessions: e.sessions, avgScore: e.avgScore, phrases: e.phrases, minutes: e.minutes }))
    });
  } catch (error) {
    next(error);
  }
};

export const getCompanyAudioMetrics = async (req, res, next) => {
  try {
    const { period = '7d' } = req.query;
    const companyId = req.companyId;

    let startDate = new Date();
    switch (period) {
      case '7d': startDate.setDate(startDate.getDate() - 7); break;
      case '30d': startDate.setDate(startDate.getDate() - 30); break;
      case '90d': startDate.setDate(startDate.getDate() - 90); break;
      default: startDate.setDate(startDate.getDate() - 7);
    }

    const match = { companyId, createdAt: { $gte: startDate } };

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

    const emotionBreakdown = await AudioMetric.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$emotion.label',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
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
      })),
      emotionBreakdown: emotionBreakdown.map(e => ({ label: e._id || 'unknown', count: e.count }))
    });
  } catch (error) {
    next(error);
  }
};

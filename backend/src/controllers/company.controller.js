import { Company, User, TrainingSession, AuditLog, Topic, Content, Phrase } from '../models/index.js';
import { successResponse, errorResponse, ErrorCodes } from '../utils/response.js';
import storageService from '../services/storage.service.js';

export const getCurrentCompany = async (req, res, next) => {
  try {
    const company = await Company.findById(req.companyId);
    return successResponse(res, company);
  } catch (error) {
    next(error);
  }
};

export const updateCompany = async (req, res, next) => {
  try {
    const { name, industry, address, contactEmail, introduction } = req.body;

    const company = await Company.findById(req.companyId);

    if (name !== undefined) company.name = name;
    if (industry !== undefined) company.industry = industry;
    if (address !== undefined) company.address = address;
    if (contactEmail !== undefined) company.contactEmail = contactEmail;
    if (introduction !== undefined) company.introduction = introduction;

    await company.save();

    await AuditLog.create({
      companyId: req.companyId,
      userId: req.user._id,
      action: 'company.updated',
      resource: 'company',
      resourceId: company._id,
      details: req.body
    });

    return successResponse(res, company);
  } catch (error) {
    next(error);
  }
};

export const updateBranding = async (req, res, next) => {
  try {
    const { primaryColor, loginMessage } = req.body;

    const company = await Company.findById(req.companyId);

    if (primaryColor !== undefined) company.primaryColor = primaryColor;
    if (loginMessage !== undefined) company.loginMessage = loginMessage;

    // Handle logo upload
    if (req.file) {
      const fileInfo = await storageService.saveLogo(
        req.file.buffer,
        req.file.originalname,
        req.companyId.toString()
      );
      company.logo = fileInfo.url;
    }

    await company.save();

    return successResponse(res, company);
  } catch (error) {
    next(error);
  }
};

export const updateSSO = async (req, res, next) => {
  try {
    const { enabled, provider, metadata } = req.body;

    const company = await Company.findById(req.companyId);

    company.sso = {
      enabled: enabled || false,
      provider: provider || null,
      metadata: metadata || null
    };

    await company.save();

    await AuditLog.create({
      companyId: req.companyId,
      userId: req.user._id,
      action: 'company.sso_updated',
      resource: 'company',
      resourceId: company._id,
      details: { enabled, provider }
    });

    return successResponse(res, company.sso);
  } catch (error) {
    next(error);
  }
};

export const getStats = async (req, res, next) => {
  try {
    const { period = '30d' } = req.query;
    
    let startDate = new Date();
    switch (period) {
      case '7d': startDate.setDate(startDate.getDate() - 7); break;
      case '30d': startDate.setDate(startDate.getDate() - 30); break;
      case '90d': startDate.setDate(startDate.getDate() - 90); break;
      default: startDate.setDate(startDate.getDate() - 30);
    }

    const [
      totalEmployees,
      activeToday,
      totalSessions,
      sessions,
      allUsers,
      topics,
      content,
      recentAuditLogs
    ] = await Promise.all([
      User.countDocuments({ companyId: req.companyId, role: 'employee', status: 'active' }),
      User.countDocuments({ 
        companyId: req.companyId, 
        'progress.lastActiveAt': { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
      }),
      TrainingSession.countDocuments({ companyId: req.companyId, isCompleted: true }),
      TrainingSession.find({
        companyId: req.companyId,
        isCompleted: true,
        createdAt: { $gte: startDate }
      }).populate('userId', 'email profile').populate('topicId', 'name'),
      User.find({ 
        companyId: req.companyId, 
        role: 'employee',
        status: 'active'
      }).select('email profile progress stars'),
      Topic.find({
        companyId: req.companyId,
        isActive: true
      }),
      Content.find({
        companyId: req.companyId,
        isActive: true
      }),
      AuditLog.find({
        companyId: req.companyId,
        createdAt: { $gte: startDate }
      }).populate('userId', 'email profile').sort({ createdAt: -1 }).limit(20)
    ]);

    // Calculate averages
    const totalMinutes = sessions.reduce((sum, s) => sum + s.durationMinutes, 0);
    const avgProgress = sessions.length > 0
      ? Math.round(sessions.reduce((sum, s) => sum + s.averageScore, 0) / sessions.length)
      : 0;

    // Get user activity by day
    const activityByDay = {};
    sessions.forEach(s => {
      const day = s.createdAt.toISOString().split('T')[0];
      activityByDay[day] = (activityByDay[day] || 0) + 1;
    });

    // Calculate training progress distribution
    const completedUsers = allUsers.filter(u => u.progress.skills.pronunciation >= 80).length;
    const inProgressUsers = allUsers.filter(u =>
      u.progress.skills.pronunciation > 20 && u.progress.skills.pronunciation < 80
    ).length;
    const notStartedUsers = totalEmployees - completedUsers - inProgressUsers;

    const safePercent = (num, den) => (den > 0 ? Math.round((num / den) * 100) : 0);
    const trainingProgress = totalEmployees > 0
      ? [
          { name: 'Completed', value: safePercent(completedUsers, totalEmployees), color: '#10b981' },
          { name: 'In Progress', value: safePercent(inProgressUsers, totalEmployees), color: '#f59e0b' },
          { name: 'Not Started', value: safePercent(notStartedUsers, totalEmployees), color: '#ef4444' }
        ]
      : [
          { name: 'No Employees', value: 100, color: '#e2e8f0' }
        ];

    // Get top performers
    const topPerformers = allUsers
      .sort((a, b) => b.stars - a.stars)
      .slice(0, 5)
      .map(user => ({
        name: user.profile?.firstName && user.profile?.lastName 
          ? `${user.profile.firstName} ${user.profile.lastName.charAt(0)}.`
          : user.email.split('@')[0],
        email: user.email,
        stars: user.stars,
        progress: user.progress.skills.pronunciation
      }));

    // Get popular topics with engagement metrics
    const topicEngagement = {};
    sessions.forEach(session => {
      if (session.topicId) {
        const topicId = session.topicId._id.toString();
        if (!topicEngagement[topicId]) {
          topicEngagement[topicId] = {
            topic: session.topicId,
            learners: new Set(),
            totalSessions: 0,
            totalScore: 0
          };
        }
        topicEngagement[topicId].learners.add(session.userId._id.toString());
        topicEngagement[topicId].totalSessions++;
        topicEngagement[topicId].totalScore += session.averageScore;
      }
    });

    const popularTopics = Object.values(topicEngagement)
      .map(engagement => ({
        name: engagement.topic.name,
        learners: engagement.learners.size,
        progress: Math.round(engagement.totalScore / engagement.totalSessions) || 0,
        icon: 'MessageSquare'
      }))
      .sort((a, b) => b.learners - a.learners)
      .slice(0, 4);

    // Generate recent activity feed
    const recentActivity = [];
    
    // Add training completions
    sessions.slice(-10).reverse().forEach(session => {
      const userName = session.userId.profile?.firstName && session.userId.profile?.lastName
        ? `${session.userId.profile.firstName} ${session.userId.profile.lastName.charAt(0)}.`
        : session.userId.email.split('@')[0];
      
      recentActivity.push({
        user: userName,
        action: `completed "${session.topicId?.name || 'training'}" session`,
        time: getTimeAgo(session.createdAt)
      });
    });

    // Add audit log activities
    recentAuditLogs.slice(0, 10).forEach(log => {
      const userName = log.userId?.profile?.firstName && log.userId?.profile?.lastName
        ? `${log.userId.profile.firstName} ${log.userId.profile.lastName.charAt(0)}.`
        : log.userId?.email?.split('@')[0] || 'Admin';

      let actionText = '';
      switch (log.action) {
        case 'user.created':
          actionText = 'added new employee';
          break;
        case 'content.uploaded':
          actionText = `uploaded "${log.details?.title || 'content'}"`;
          break;
        case 'topic.created':
          actionText = `created topic "${log.details?.name || 'new topic'}"`;
          break;
        case 'voice.sample_uploaded':
          actionText = 'updated voice sample';
          break;
        default:
          actionText = log.action.replace(/\./g, ' ');
      }

      recentActivity.push({
        user: userName,
        action: actionText,
        time: getTimeAgo(log.createdAt)
      });
    });

    // Sort by most recent and limit
    recentActivity.sort((a, b) => {
      const timeA = parseTimeAgo(a.time);
      const timeB = parseTimeAgo(b.time);
      return timeA - timeB;
    });

    // Content analytics
    const totalViews = content.reduce((sum, c) => sum + (c.views || 0), 0);
    const topContent = content
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 5)
      .map(c => ({ 
        id: c._id, 
        title: c.title, 
        views: c.views || 0,
        type: c.type
      }));

    const contentAnalytics = {
      totalMaterials: content.length,
      activeTopics: topics.length,
      avgEngagement: content.length > 0 
        ? Math.round(totalViews / content.length)
        : 0,
      urlResources: content.filter(c => c.type === 'url').length,
      topContent
    };

    return successResponse(res, {
      kpis: {
        totalEmployees,
        activeToday,
        avgProgress,
        totalTrainingHours: Math.round(totalMinutes / 60)
      },
      activityByDay,
      trainingProgress,
      recentActivity: recentActivity.slice(0, 6),
      popularTopics,
      contentAnalytics,
      topPerformers,
      totalSessions
    });
  } catch (error) {
    next(error);
  }
};

// Helper function to calculate time ago
function getTimeAgo(date) {
  const now = new Date();
  const diffMs = now - new Date(date);
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
}

// Helper function to parse time ago for sorting
function parseTimeAgo(timeStr) {
  if (timeStr === 'just now') return 0;
  const match = timeStr.match(/(\d+)\s+(minute|hour|day)/);
  if (!match) return 0;
  const value = parseInt(match[1]);
  const unit = match[2];
  if (unit === 'minute') return value;
  if (unit === 'hour') return value * 60;
  if (unit === 'day') return value * 60 * 24;
  return 0;
}

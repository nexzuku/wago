// Badge definitions and award logic
const BADGES = [
  // Session count badges
  { id: 'first_session', name: 'First Steps', icon: '🎯', description: 'Complete your first training session', check: (ctx) => ctx.totalSessions >= 1 },
  { id: 'sessions_10', name: 'Getting Started', icon: '📚', description: 'Complete 10 training sessions', check: (ctx) => ctx.totalSessions >= 10 },
  { id: 'sessions_50', name: 'Dedicated Learner', icon: '🎓', description: 'Complete 50 training sessions', check: (ctx) => ctx.totalSessions >= 50 },
  { id: 'sessions_100', name: 'Centurion', icon: '💯', description: 'Complete 100 training sessions', check: (ctx) => ctx.totalSessions >= 100 },

  // Score badges
  { id: 'perfect_score', name: 'Perfect Score', icon: '⭐', description: 'Score 100% on a session', check: (ctx) => ctx.sessionScore === 100 },
  { id: 'high_scorer', name: 'High Achiever', icon: '🏆', description: 'Average score above 90%', check: (ctx) => ctx.avgScore >= 90 },

  // Streak badges
  { id: 'streak_3', name: 'On a Roll', icon: '🔥', description: 'Maintain a 3-day streak', check: (ctx) => ctx.streak >= 3 },
  { id: 'streak_7', name: 'Week Warrior', icon: '💪', description: 'Maintain a 7-day streak', check: (ctx) => ctx.streak >= 7 },
  { id: 'streak_30', name: 'Monthly Master', icon: '🌟', description: 'Maintain a 30-day streak', check: (ctx) => ctx.streak >= 30 },

  // Phrase badges
  { id: 'phrases_50', name: 'Phrase Explorer', icon: '🗣️', description: 'Practice 50 phrases', check: (ctx) => ctx.totalPhrases >= 50 },
  { id: 'phrases_200', name: 'Word Wizard', icon: '✨', description: 'Practice 200 phrases', check: (ctx) => ctx.totalPhrases >= 200 },
  { id: 'phrases_500', name: 'Language Legend', icon: '👑', description: 'Practice 500 phrases', check: (ctx) => ctx.totalPhrases >= 500 },

  // Time badges
  { id: 'time_60', name: 'Hour of Power', icon: '⏰', description: 'Spend 60 minutes training', check: (ctx) => ctx.totalMinutes >= 60 },
  { id: 'time_300', name: 'Marathon Learner', icon: '🏃', description: 'Spend 5 hours training', check: (ctx) => ctx.totalMinutes >= 300 },

  // Mode badges
  { id: 'free_talker', name: 'Free Talker', icon: '💬', description: 'Complete 10 free talk sessions', check: (ctx) => ctx.freeTalkSessions >= 10 },
  { id: 'daily_goal', name: 'Goal Getter', icon: '🎯', description: 'Complete your daily goals', check: (ctx) => ctx.dailyGoalsMet },

  // Star badges
  { id: 'stars_50', name: 'Rising Star', icon: '🌠', description: 'Earn 50 stars', check: (ctx) => ctx.stars >= 50 },
  { id: 'stars_200', name: 'Superstar', icon: '💫', description: 'Earn 200 stars', check: (ctx) => ctx.stars >= 200 },
];

export const getAllBadgeDefinitions = () => BADGES;

export const checkAndAwardBadges = async (user, sessionContext = {}) => {
  const existing = new Set(user.badges || []);
  const newBadges = [];

  const ctx = {
    totalSessions: (sessionContext.totalSessions || 0),
    sessionScore: sessionContext.sessionScore || 0,
    avgScore: sessionContext.avgScore || 0,
    streak: user.progress?.currentStreak || 0,
    totalPhrases: user.progress?.totalPhrasesPracticed || 0,
    totalMinutes: user.progress?.totalTimeMinutes || 0,
    freeTalkSessions: sessionContext.freeTalkSessions || 0,
    dailyGoalsMet: (
      user.dailyGoals?.phrasesToday >= user.dailyGoals?.phrasesTarget &&
      user.dailyGoals?.minutesToday >= user.dailyGoals?.minutesTarget
    ),
    stars: user.stars || 0,
  };

  for (const badge of BADGES) {
    if (!existing.has(badge.id) && badge.check(ctx)) {
      newBadges.push(badge.id);
    }
  }

  if (newBadges.length > 0) {
    user.badges = [...(user.badges || []), ...newBadges];
    await user.save();
  }

  return newBadges.map(id => BADGES.find(b => b.id === id));
};

export default { getAllBadgeDefinitions, checkAndAwardBadges };

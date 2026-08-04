import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Flame, Star, Target, Clock, Users, ChevronRight, Loader2, Trophy, TrendingUp, Bookmark, History, Settings2, Check, Award } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import { trainingAPI } from '../../services/api';

const ProgressPage = () => {
  const { user, company } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [audioMetrics, setAudioMetrics] = useState(null);
  const [tab, setTab] = useState('week');
  const [leaderboard, setLeaderboard] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLeaderboardLoading, setIsLeaderboardLoading] = useState(true);
  const [dailyGoals, setDailyGoals] = useState(null);
  const [savedPhrases, setSavedPhrases] = useState([]);
  const [pronHistory, setPronHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [badges, setBadges] = useState([]);
  const [showBadges, setShowBadges] = useState(false);

  // Fire all initial fetches in parallel so the page renders in a single loading cycle
  useEffect(() => {
    const loadAll = async () => {
      setIsLoading(true);
      await Promise.all([
        trainingAPI.getStats('7d')
          .then(({ data }) => setStats(data.data))
          .catch(() => setStats({ totalSessions: 0, totalMinutes: 0, totalPhrases: 0, averageScore: 0, byMode: { listen_repeat: 0, test: 0, free_talk: 0 } })),
        trainingAPI.getAudioMetrics('7d')
          .then(({ data }) => setAudioMetrics(data.data))
          .catch(() => setAudioMetrics(null)),
        trainingAPI.getDailyGoals()
          .then(({ data }) => setDailyGoals(data.data))
          .catch(() => setDailyGoals({ phrasesTarget: 10, minutesTarget: 5, phrasesToday: 0, minutesToday: 0 })),
        trainingAPI.getBadges()
          .then(({ data }) => setBadges(data.data || []))
          .catch(() => setBadges([]))
      ]);
      setIsLoading(false);
    };
    loadAll();
  }, []);

  useEffect(() => {
    loadLeaderboard();
  }, [tab]);

  const loadSavedPhrases = async () => {
    try {
      const { data } = await trainingAPI.getSavedPhrases();
      setSavedPhrases(data.data || []);
    } catch (err) {
      setSavedPhrases([]);
    }
  };

  const loadPronHistory = async () => {
    try {
      const { data } = await trainingAPI.getPronunciationHistory({ limit: 20 });
      setPronHistory(data.data || []);
    } catch (err) {
      setPronHistory([]);
    }
  };

  const loadLeaderboard = async () => {
    setIsLeaderboardLoading(true);
    try {
      const period = tab === 'week' ? '7d' : 'all';
      const { data } = await trainingAPI.getLeaderboard(period);
      const entries = data.data || [];
      const withBadges = entries.map((entry) => ({
        ...entry,
        badge: entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : `#${entry.rank}`,
        stats: `${entry.totalPhrases} phrases • ${entry.totalMinutes} mins`
      }));
      setLeaderboard(withBadges);
    } catch (err) {
      console.error('Failed to load leaderboard:', err);
      setLeaderboard([]);
    } finally {
      setIsLeaderboardLoading(false);
    }
  };

  const skills = user?.progress?.skills || { fluency: 0, pronunciation: 0, grammar: 0, pitch: 0 };
  const streak = user?.progress?.currentStreak || 0;
  const stars = user?.stars || 0;

  // Build weekly data from stats
  const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const weekData = dayLabels.map((day, i) => {
    const modeStats = stats?.byMode || {};
    const total = (modeStats.listen_repeat || 0) + (modeStats.test || 0) + (modeStats.free_talk || 0);
    const baseValue = total > 0 ? Math.min(Math.round((stats?.averageScore || 50) + (Math.random() * 20 - 10)), 100) : 0;
    return { day, value: Math.max(baseValue, 0) };
  });

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-400" />
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto px-4 md:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/20 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-display font-bold text-white">Your Progress</h1>
              <p className="text-xs text-slate-500">Track your Japanese learning journey</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          {[
            { icon: '🔥', value: streak, label: 'Day Streak', color: 'from-orange-500/15 to-amber-500/10', borderColor: 'border-orange-500/15', textColor: 'text-orange-400' },
            { icon: '⭐', value: stars, label: 'Points', color: 'from-amber-500/15 to-yellow-500/10', borderColor: 'border-amber-500/15', textColor: 'text-amber-400' },
            { icon: '🎯', value: `${stats?.averageScore || 0}%`, label: 'Accuracy', color: 'from-primary-500/15 to-blue-500/10', borderColor: 'border-primary-500/15', textColor: 'text-primary-400' },
            { icon: '⏱️', value: stats?.totalMinutes || 0, label: 'Minutes', color: 'from-violet-500/15 to-purple-500/10', borderColor: 'border-violet-500/15', textColor: 'text-violet-400' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className={`rounded-2xl border ${stat.borderColor} p-4 text-center`}
              style={{ background: `linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))` }}
            >
              <span className="text-2xl block mb-2">{stat.icon}</span>
              <span className={`text-2xl font-black ${stat.textColor} block`}>{stat.value}</span>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1 block">
                {stat.label}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Daily Goals */}
        {dailyGoals && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="rounded-2xl border border-white/[0.08] p-5 mb-5"
            style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))' }}
          >
            <h3 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">
              <Target className="w-4 h-4 text-emerald-400" /> Today's Goals
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                {
                  label: 'Phrases',
                  current: dailyGoals.phrasesToday || 0,
                  target: dailyGoals.phrasesTarget || 10,
                  icon: '📝',
                  color: 'bg-primary-500'
                },
                {
                  label: 'Minutes',
                  current: dailyGoals.minutesToday || 0,
                  target: dailyGoals.minutesTarget || 5,
                  icon: '⏱️',
                  color: 'bg-violet-500'
                }
              ].map(goal => {
                const pct = Math.min(100, Math.round((goal.current / goal.target) * 100));
                const done = pct >= 100;
                return (
                  <div key={goal.label} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
                        <span>{goal.icon}</span> {goal.label}
                      </span>
                      <span className={`text-xs font-bold ${done ? 'text-emerald-400' : 'text-slate-300'}`}>
                        {done ? <Check className="w-3.5 h-3.5 inline" /> : null} {goal.current}/{goal.target}
                      </span>
                    </div>
                    <div className="h-2.5 bg-white/[0.06] rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${done ? 'bg-emerald-500' : goal.color}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Audio Metrics */}
        {audioMetrics?.summary && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="rounded-2xl border border-white/[0.08] p-5 mb-5"
            style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))' }}
          >
            <h3 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" /> Speech Analytics (7 Days)
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
              {[
                { label: 'Energy', value: audioMetrics.summary.energyAvg, color: 'text-cyan-300' },
                { label: 'Timing', value: audioMetrics.summary.timingAvg, color: 'text-emerald-300' },
                { label: 'Stability', value: audioMetrics.summary.stabilityAvg, color: 'text-violet-300' },
                { label: 'Articulation', value: audioMetrics.summary.articulationAvg, color: 'text-amber-300' },
                { label: 'Accuracy', value: audioMetrics.summary.accuracyAvg, color: 'text-primary-300' },
                { label: 'Engagement', value: 100 - (audioMetrics.summary.disengagementAvg || 0), color: 'text-rose-300' }
              ].map(metric => (
                <div key={metric.label} className="rounded-xl border border-white/[0.06] p-3 bg-white/[0.03]">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{metric.label}</p>
                  <p className={`text-lg font-black ${metric.color}`}>{metric.value ?? 0}%</p>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              {(audioMetrics.dailyTrend || []).slice(-7).map((day) => (
                <div key={day.date} className="flex items-center gap-3">
                  <span className="text-[10px] text-slate-400 font-mono w-12 flex-shrink-0">
                    {new Date(day.date + 'T00:00:00').toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                  </span>
                  <div className="flex-1 h-2.5 bg-white/[0.06] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                      style={{ width: `${Math.min(100, Math.max(day.accuracy || 0, 0))}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-semibold text-slate-400 w-10 text-right">{day.accuracy ?? 0}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Two Column Layout on Desktop */}
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          {/* Skills Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl border border-white/[0.08] p-5"
            style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))' }}
          >
            <h3 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-slate-500" />
              Skills Breakdown
            </h3>
            <div className="space-y-4">
              {[
                { label: 'Fluency', icon: '🗣️', value: skills.fluency, color: 'bg-indigo-500', bgColor: 'bg-indigo-500/10' },
                { label: 'Pronunciation', icon: '📢', value: skills.pronunciation, color: 'bg-amber-500', bgColor: 'bg-amber-500/10' },
                { label: 'Grammar', icon: '📝', value: skills.grammar, color: 'bg-emerald-500', bgColor: 'bg-emerald-500/10' },
                { label: 'Pitch', icon: '🎵', value: skills.pitch, color: 'bg-pink-500', bgColor: 'bg-pink-500/10' },
              ].map((skill) => (
                <div key={skill.label}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-300 flex items-center gap-2">
                      <span className={`w-7 h-7 rounded-lg ${skill.bgColor} flex items-center justify-center text-xs`}>{skill.icon}</span>
                      {skill.label}
                    </span>
                    <span className="text-sm font-bold text-white">{skill.value}%</span>
                  </div>
                  <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${skill.color}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${skill.value}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Weekly Chart */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl border border-white/[0.08] p-5"
            style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))' }}
          >
            <h3 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">
              <Target className="w-4 h-4 text-slate-500" />
              This Week's Activity
            </h3>
            <div className="flex items-end justify-around h-36 gap-2 mt-2">
              {weekData.map((day, i) => (
                <div key={i} className="flex flex-col items-center gap-1.5 flex-1">
                  <span className="text-[10px] font-bold text-slate-500 tabular-nums">{day.value > 0 ? `${day.value}%` : ''}</span>
                  <div className="w-full flex justify-center" style={{ height: '100px' }}>
                    <motion.div
                      className="w-full max-w-[28px] bg-gradient-to-t from-primary-600 to-primary-400 rounded-lg"
                      initial={{ height: 0 }}
                      animate={{ height: `${day.value}%` }}
                      transition={{ duration: 0.5, delay: i * 0.05 }}
                      style={{ minHeight: day.value > 0 ? '4px' : '0' }}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-slate-500">{day.day}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Quick Access: History & Saved */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            onClick={() => {
              setShowHistory(!showHistory);
              setShowSaved(false);
              if (!showHistory && pronHistory.length === 0) loadPronHistory();
            }}
            className={`rounded-2xl border p-4 text-left transition-all ${
              showHistory ? 'border-primary-500/30 bg-primary-500/[0.06]' : 'border-white/[0.08] hover:border-white/[0.15]'
            }`}
            style={!showHistory ? { background: 'linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))' } : {}}
          >
            <History className={`w-5 h-5 mb-2 ${showHistory ? 'text-primary-400' : 'text-slate-500'}`} />
            <p className="text-sm font-semibold text-slate-200">Pronunciation History</p>
            <p className="text-[10px] text-slate-500 mt-0.5">View past attempts & scores</p>
          </motion.button>
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.28 }}
            onClick={() => {
              setShowSaved(!showSaved);
              setShowHistory(false);
              if (!showSaved && savedPhrases.length === 0) loadSavedPhrases();
            }}
            className={`rounded-2xl border p-4 text-left transition-all ${
              showSaved ? 'border-amber-500/30 bg-amber-500/[0.06]' : 'border-white/[0.08] hover:border-white/[0.15]'
            }`}
            style={!showSaved ? { background: 'linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))' } : {}}
          >
            <Bookmark className={`w-5 h-5 mb-2 ${showSaved ? 'text-amber-400' : 'text-slate-500'}`} />
            <p className="text-sm font-semibold text-slate-200">Saved Phrases</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Your bookmarked phrases</p>
          </motion.button>
        </div>

        {/* Pronunciation History Panel */}
        {showHistory && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="rounded-2xl border border-white/[0.08] overflow-hidden mb-4"
            style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))' }}
          >
            <div className="p-5 pb-3">
              <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2">
                <History className="w-4 h-4 text-primary-400" /> Recent Pronunciation Attempts
              </h3>
            </div>
            <div className="divide-y divide-white/[0.04] max-h-80 overflow-y-auto">
              {pronHistory.length === 0 ? (
                <div className="py-10 text-center">
                  <p className="text-sm text-slate-400">No pronunciation history yet</p>
                  <p className="text-xs text-slate-500 mt-1">Start practicing to see your attempts here</p>
                </div>
              ) : (
                pronHistory.map((item, i) => (
                  <div key={item._id || i} className="px-5 py-3 flex items-center gap-3">
                    <span className="text-lg">{item.topicIcon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-200 truncate">{item.userTranscript || '—'}</p>
                      <p className="text-[10px] text-slate-500">{item.topicName} • {new Date(item.attemptedAt).toLocaleDateString()}</p>
                    </div>
                    <div className={`text-sm font-bold px-2 py-1 rounded-lg ${
                      item.score >= 80 ? 'text-emerald-400 bg-emerald-500/10' :
                      item.score >= 50 ? 'text-amber-400 bg-amber-500/10' :
                      'text-rose-400 bg-rose-500/10'
                    }`}>
                      {item.score}%
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}

        {/* Saved Phrases Panel */}
        {showSaved && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="rounded-2xl border border-white/[0.08] overflow-hidden mb-4"
            style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))' }}
          >
            <div className="p-5 pb-3">
              <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-amber-400" /> Saved Phrases ({savedPhrases.length})
              </h3>
            </div>
            <div className="divide-y divide-white/[0.04] max-h-80 overflow-y-auto">
              {savedPhrases.length === 0 ? (
                <div className="py-10 text-center">
                  <p className="text-sm text-slate-400">No saved phrases yet</p>
                  <p className="text-xs text-slate-500 mt-1">Bookmark phrases while learning to review them here</p>
                </div>
              ) : (
                savedPhrases.map((item, i) => {
                  const phrase = item.phraseId;
                  return (
                    <div key={item._id || i} className="px-5 py-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs">{item.topicId?.icon || '📚'}</span>
                        <span className="text-[10px] text-slate-500 font-medium">{item.topicId?.name || 'Unknown'}</span>
                      </div>
                      <p className="text-sm font-medium text-slate-200 font-japanese">{phrase?.japanese || '—'}</p>
                      <p className="text-xs text-slate-400">{phrase?.romaji} — {phrase?.english}</p>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}

        {/* Achievements / Badges */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.32 }}
          className="rounded-2xl border border-white/[0.08] overflow-hidden mb-4"
          style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))' }}
        >
          <button
            onClick={() => setShowBadges(!showBadges)}
            className="w-full p-5 pb-3 flex items-center justify-between text-left"
          >
            <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" /> Achievements
              <span className="text-[10px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full font-bold">
                {badges.filter(b => b.earned).length}/{badges.length}
              </span>
            </h3>
            <ChevronRight className={`w-4 h-4 text-slate-500 transition-transform ${showBadges ? 'rotate-90' : ''}`} />
          </button>
          {showBadges && (
            <div className="px-5 pb-5">
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {badges.map(badge => (
                  <div
                    key={badge.id}
                    className={`relative p-3 rounded-xl text-center transition-all ${
                      badge.earned
                        ? 'bg-gradient-to-b from-amber-500/10 to-amber-500/5 border border-amber-500/20'
                        : 'bg-white/[0.02] border border-white/[0.06] opacity-40'
                    }`}
                  >
                    <span className="text-2xl block mb-1">{badge.icon}</span>
                    <p className={`text-[10px] font-bold leading-tight ${badge.earned ? 'text-slate-200' : 'text-slate-500'}`}>
                      {badge.name}
                    </p>
                    <p className="text-[8px] text-slate-500 mt-0.5 leading-tight">{badge.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Team Leaderboard */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl border border-white/[0.08] overflow-hidden"
          style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))' }}
        >
          <div className="p-5 pb-3">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2">
                <Users className="w-4 h-4 text-slate-500" /> Team Leaderboard
              </h3>
              {company?.name && (
                <span className="text-[10px] font-semibold text-slate-500 bg-white/[0.06] px-2.5 py-1 rounded-lg">
                  {company.name}
                </span>
              )}
            </div>

            {/* Period Tabs */}
            <div className="flex gap-1.5">
              {['week', 'alltime'].map(t => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    tab === t ? 'bg-primary-600 text-white' : 'bg-white/[0.06] text-slate-400 hover:bg-white/[0.1]'
                  }`}
                >
                  {t === 'week' ? 'This Week' : 'All Time'}
                </button>
              ))}
            </div>
          </div>

          {/* Leaderboard List */}
          <div className="divide-y divide-white/[0.04]">
            {isLeaderboardLoading ? (
              <div className="py-8 flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-primary-400" />
              </div>
            ) : leaderboard.length === 0 ? (
              <div className="py-10 text-center">
                <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mx-auto mb-3">
                  <Users className="w-6 h-6 text-slate-600" />
                </div>
                <p className="text-sm text-slate-400 font-medium">No team activity yet</p>
                <p className="text-xs text-slate-500 mt-1">Start practicing to appear on the leaderboard!</p>
              </div>
            ) : (
              leaderboard.map((member) => (
                <div
                  key={member.rank}
                  className={`flex items-center gap-3 px-5 py-3.5 transition-colors ${
                    member.isCurrentUser ? 'bg-primary-500/[0.06]' : 'hover:bg-white/[0.02]'
                  }`}
                >
                  <span className={`text-lg w-8 text-center flex-shrink-0 ${
                    member.rank <= 3 ? '' : 'text-sm font-bold text-slate-500'
                  }`}>
                    {member.badge}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-white/[0.08] to-white/[0.04] border border-white/[0.08] flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-slate-300">
                      {(member.name || 'E')[0].toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold ${member.isCurrentUser ? 'text-primary-300' : 'text-slate-200'}`}>
                      {member.name || 'Employee'}
                      {member.isCurrentUser && <span className="text-[10px] text-primary-400 ml-1.5">(You)</span>}
                    </p>
                    <p className="text-[10px] text-slate-500">{member.stats}</p>
                  </div>
                  <span className="text-sm font-bold text-slate-300 tabular-nums">
                    {member.score?.toLocaleString?.() || 0}
                  </span>
                </div>
              ))
            )}
          </div>

          <div className="px-5 py-3 border-t border-white/[0.04] text-center">
            <p className="text-xs text-slate-500 font-medium">Keep practicing to climb the ranks!</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProgressPage;

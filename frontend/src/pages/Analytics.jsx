import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3, Users, Clock, Target, TrendingUp, BookOpen,
  Loader2, ChevronRight, Award, MessageCircle, Headphones, Zap
} from 'lucide-react';
import { analyticsAPI } from '../services/api';
import { Card, StatCard } from '../components/ui';

const Analytics = () => {
  const [data, setData] = useState(null);
  const [audioMetrics, setAudioMetrics] = useState(null);
  const [period, setPeriod] = useState('7d');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [period]);

  const loadAnalytics = async () => {
    setIsLoading(true);
    try {
      const [{ data: res }, { data: audioRes }] = await Promise.all([
        analyticsAPI.getCompanyAnalytics(period),
        analyticsAPI.getCompanyAudioMetrics(period)
      ]);
      setData(res.data);
      setAudioMetrics(audioRes.data);
    } catch (err) {
      console.error('Failed to load analytics:', err);
      setData(null);
      setAudioMetrics(null);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-20">
        <BarChart3 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-slate-700">No analytics data</h3>
        <p className="text-sm text-slate-500">Data will appear once employees start training.</p>
      </div>
    );
  }

  const { overview, modeBreakdown, topicPopularity, activityChart, employeePerformance } = data;
  const totalModes = (modeBreakdown.listen_repeat || 0) + (modeBreakdown.test || 0) + (modeBreakdown.free_talk || 0);

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-blue-600" /> Reports & Analytics
          </h1>
          <p className="text-sm text-slate-500 mt-1">Company-wide training performance overview</p>
        </div>
        <div className="flex gap-1.5 bg-slate-100 rounded-lg p-1">
          {[
            { value: '7d', label: '7 Days' },
            { value: '30d', label: '30 Days' },
            { value: '90d', label: '90 Days' },
          ].map(p => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                period === p.value ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Active Employees" value={`${overview.activeEmployees}/${overview.totalEmployees}`} icon={Users} color="from-blue-500 to-blue-600" />
        <StatCard label="Total Sessions" value={overview.totalSessions} icon={Target} color="from-emerald-500 to-emerald-600" />
        <StatCard label="Training Minutes" value={overview.totalMinutes} icon={Clock} color="from-violet-500 to-violet-600" />
        <StatCard label="Avg Score" value={`${overview.avgScore}%`} icon={TrendingUp} color="from-amber-500 to-amber-600" />
      </div>

      {/* Charts Row */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Activity Chart */}
        <Card>
          <div className="p-5">
            <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-500" /> Daily Activity
            </h3>
            {activityChart.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-sm">No activity data</div>
            ) : (
              <div className="space-y-1.5">
                {activityChart.slice(-14).map((day, i) => {
                  const maxSessions = Math.max(...activityChart.map(d => d.sessions), 1);
                  const pct = Math.round((day.sessions / maxSessions) * 100);
                  return (
                    <div key={day.date} className="flex items-center gap-3">
                      <span className="text-[10px] text-slate-400 font-mono w-16 flex-shrink-0">
                        {new Date(day.date + 'T00:00:00').toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                      </span>
                      <div className="flex-1 h-5 bg-slate-50 rounded-md overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-md"
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.5, delay: i * 0.03 }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-slate-600 w-8 text-right">{day.sessions}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Card>

        {/* Mode Breakdown */}
        <Card>
          <div className="p-5">
            <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-violet-500" /> Training Mode Breakdown
            </h3>
            <div className="space-y-4">
              {[
                { label: 'Listen & Repeat', value: modeBreakdown.listen_repeat || 0, icon: Headphones, color: 'bg-blue-500', bgColor: 'bg-blue-50 text-blue-600' },
                { label: 'Test Yourself', value: modeBreakdown.test || 0, icon: Zap, color: 'bg-amber-500', bgColor: 'bg-amber-50 text-amber-600' },
                { label: 'Free Talk', value: modeBreakdown.free_talk || 0, icon: MessageCircle, color: 'bg-emerald-500', bgColor: 'bg-emerald-50 text-emerald-600' },
              ].map(mode => {
                const pct = totalModes > 0 ? Math.round((mode.value / totalModes) * 100) : 0;
                return (
                  <div key={mode.label}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <span className={`w-7 h-7 rounded-lg ${mode.bgColor} flex items-center justify-center`}>
                          <mode.icon className="w-3.5 h-3.5" />
                        </span>
                        {mode.label}
                      </span>
                      <span className="text-sm font-bold text-slate-700">{mode.value} <span className="text-slate-400 font-normal text-xs">({pct}%)</span></span>
                    </div>
                    <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${mode.color}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8 }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 grid grid-cols-2 gap-3">
              <div className="text-center p-3 bg-slate-50 rounded-lg">
                <p className="text-2xl font-bold text-slate-900">{overview.topicCount}</p>
                <p className="text-[10px] font-semibold text-slate-500 uppercase">Topics</p>
              </div>
              <div className="text-center p-3 bg-slate-50 rounded-lg">
                <p className="text-2xl font-bold text-slate-900">{overview.phraseCount}</p>
                <p className="text-[10px] font-semibold text-slate-500 uppercase">Phrases</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Audio Analytics */}
      {audioMetrics?.summary && (
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <div className="p-5">
              <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-cyan-500" /> Speech Analytics Summary
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Energy', value: audioMetrics.summary.energyAvg, color: 'text-cyan-600' },
                  { label: 'Timing', value: audioMetrics.summary.timingAvg, color: 'text-emerald-600' },
                  { label: 'Stability', value: audioMetrics.summary.stabilityAvg, color: 'text-violet-600' },
                  { label: 'Articulation', value: audioMetrics.summary.articulationAvg, color: 'text-amber-600' },
                  { label: 'Accuracy', value: audioMetrics.summary.accuracyAvg, color: 'text-blue-600' },
                  { label: 'Engagement', value: 100 - (audioMetrics.summary.disengagementAvg || 0), color: 'text-rose-600' }
                ].map(metric => (
                  <div key={metric.label} className="rounded-lg border border-slate-100 p-3 bg-slate-50">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{metric.label}</p>
                    <p className={`text-lg font-black ${metric.color}`}>{metric.value ?? 0}%</p>
                  </div>
                ))}
              </div>
            </div>
          </Card>
          <Card>
            <div className="p-5">
              <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-indigo-500" /> Daily Accuracy Trend
              </h3>
              {(audioMetrics.dailyTrend || []).length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-sm">No audio metrics yet</div>
              ) : (
                <div className="space-y-2">
                  {audioMetrics.dailyTrend.slice(-14).map((day, i) => {
                    const maxVal = Math.max(...audioMetrics.dailyTrend.map(d => d.accuracy || 0), 1);
                    const pct = Math.round(((day.accuracy || 0) / maxVal) * 100);
                    return (
                      <div key={day.date} className="flex items-center gap-3">
                        <span className="text-[10px] text-slate-400 font-mono w-16 flex-shrink-0">
                          {new Date(day.date + 'T00:00:00').toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                        </span>
                        <div className="flex-1 h-4 bg-slate-50 rounded-md overflow-hidden">
                          <motion.div
                            className="h-full bg-gradient-to-r from-indigo-500 to-blue-400"
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.5, delay: i * 0.03 }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-slate-600 w-8 text-right">{day.accuracy ?? 0}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Topic Popularity */}
      {topicPopularity.length > 0 && (
        <Card>
          <div className="p-5">
            <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-500" /> Most Popular Topics
            </h3>
            <div className="space-y-2">
              {topicPopularity.map((topic, i) => (
                <div key={topic.name} className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-lg">
                  <span className="text-xs font-bold text-slate-400 w-5 text-center">{i + 1}</span>
                  <span className="text-lg">{topic.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{topic.name}</p>
                    <p className="text-[10px] text-slate-500">{topic.sessions} sessions</p>
                  </div>
                  <div className={`text-xs font-bold px-2 py-1 rounded-md ${
                    topic.avgScore >= 80 ? 'bg-emerald-50 text-emerald-700' :
                    topic.avgScore >= 50 ? 'bg-amber-50 text-amber-700' :
                    'bg-slate-100 text-slate-600'
                  }`}>
                    {topic.avgScore}% avg
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Employee Performance */}
      {employeePerformance.length > 0 && (
        <Card>
          <div className="p-5">
            <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" /> Employee Performance
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                    <th className="text-left py-2 pr-3">#</th>
                    <th className="text-left py-2 pr-3">Employee</th>
                    <th className="text-right py-2 pr-3">Sessions</th>
                    <th className="text-right py-2 pr-3">Phrases</th>
                    <th className="text-right py-2 pr-3">Minutes</th>
                    <th className="text-right py-2">Avg Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {employeePerformance.map((emp, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 pr-3">
                        <span className={`text-xs font-bold ${i < 3 ? 'text-amber-600' : 'text-slate-400'}`}>
                          {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`}
                        </span>
                      </td>
                      <td className="py-2.5 pr-3 font-medium text-slate-800">{emp.name}</td>
                      <td className="py-2.5 pr-3 text-right text-slate-600">{emp.sessions}</td>
                      <td className="py-2.5 pr-3 text-right text-slate-600">{emp.phrases}</td>
                      <td className="py-2.5 pr-3 text-right text-slate-600">{emp.minutes}</td>
                      <td className="py-2.5 text-right">
                        <span className={`font-bold ${
                          emp.avgScore >= 80 ? 'text-emerald-600' :
                          emp.avgScore >= 50 ? 'text-amber-600' :
                          'text-slate-500'
                        }`}>
                          {emp.avgScore}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default Analytics;

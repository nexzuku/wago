import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users,
  Activity,
  TrendingUp,
  Clock,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  BookOpen,
  Mic2,
  Play,
  Bell,
  Star,
  FileText,
  MessageSquare,
  AlertTriangle,
  Briefcase,
  Utensils,
  Download,
  Upload,
  Share2
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { companyAPI } from '../services/api';
import useAuthStore from '../store/authStore';
import { Loader, Avatar, Card, StatCard, Button } from '../components/ui';

const Dashboard = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data } = await companyAPI.getStats('30d');
      setStats(data.data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
      setError('Failed to load dashboard data. Please refresh the page.');
    } finally {
      setIsLoading(false);
    }
  };

  // Activity data for visualization from backend
  const activityData = stats?.activityByDay && Object.keys(stats.activityByDay).length > 0
    ? Object.entries(stats.activityByDay)
        .sort(([a], [b]) => new Date(a) - new Date(b))
        .slice(-7) // Last 7 days
        .map(([date, count]) => ({
          date: new Date(date).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
          sessions: count
        }))
    : [];

  const kpis = [
    {
      label: 'Team Members',
      value: stats?.kpis?.totalEmployees || 0,
      icon: Users,
      change: '+3',
      trend: 'up',
      color: 'from-primary-500 to-primary-600'
    },
    {
      label: 'Active Today',
      value: stats?.kpis?.activeToday || 0,
      icon: Activity,
      change: '+5',
      trend: 'up',
      color: 'from-emerald-500 to-emerald-600'
    },
    {
      label: 'Avg Progress',
      value: `${stats?.kpis?.avgProgress || 0}%`,
      icon: TrendingUp,
      change: '+8%',
      trend: 'up',
      color: 'from-amber-500 to-amber-600'
    },
    {
      label: 'Training Hours',
      value: stats?.kpis?.totalTrainingHours || 0,
      icon: Clock,
      change: '+24h',
      trend: 'up',
      color: 'from-violet-500 to-violet-600'
    }
  ];

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <Loader size="lg" />
          <p className="mt-4 text-slate-500 font-medium">Loading workspace...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg max-w-md">
            <p className="text-red-600 font-medium">{error}</p>
          </div>
          <Button onClick={fetchStats} variant="primary">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-8 space-y-8">
      {/* Page Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-primary-600 uppercase tracking-[0.2em] mb-2">
            <span className="w-2 h-2 rounded-full bg-primary-600 animate-pulse" />
            Workspace Overview
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Welcome back{user?.profile?.firstName ? `, ${user.profile.firstName}` : ''}
          </h1>
          <p className="text-slate-500 text-sm mt-2 font-medium">
            Your organization's Japanese training performance for the last 30 days.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button className="relative p-2.5 text-slate-500 hover:text-slate-700 rounded-xl hover:bg-white/80 border border-transparent hover:border-slate-200/60 transition-all backdrop-blur-sm">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-colors">
            <Download className="w-4 h-4" />
            Export Report
          </button>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {kpis.map((kpi, i) => (
          <StatCard
            key={i}
            label={kpi.label}
            value={kpi.value}
            icon={kpi.icon}
            change={kpi.change}
            trend={kpi.trend}
            color={kpi.color}
            delay={i * 0.1}
          />
        ))}
      </section>

      {/* Main Content Grid */}
      <section className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2" padding="lg" animate delay={0.2}>
          <div className="flex items-start justify-between mb-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-1">Training Activity</h3>
              <p className="text-xs text-slate-500 font-medium">Daily session completions across all teams</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Live</span>
              </div>
              <select className="text-xs font-medium text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1">
                <option>7 Days</option>
                <option>30 Days</option>
                <option>90 Days</option>
              </select>
            </div>
          </div>

          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityData}>
                <defs>
                  <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0891b2" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#0891b2" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }}
                  dx={-10}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 600,
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="sessions"
                  stroke="#0891b2"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorSessions)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card padding="lg" animate delay={0.3}>
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-1">Training Progress</h3>
            <p className="text-xs text-slate-500 font-medium">Status overview</p>
          </div>

          <div className="h-[220px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats?.trainingProgress || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {(stats?.trainingProgress || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center mt-[-36px]">
                <div className="text-2xl font-black text-slate-900">
                  {stats?.trainingProgress?.find(p => p.name === 'Completed')?.value ?? 0}%
                </div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Completion</div>
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* Quick Actions & Top Performers */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Quick Actions</h2>
            <Link to="/learn" className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1">
              View All <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { to: '/learn', icon: Play, title: 'Start Session', desc: 'Begin interactive learning', color: 'bg-gradient-to-br from-cyan-50 to-blue-50 text-cyan-600 border-cyan-100' },
              { to: '/employees', icon: Users, title: 'Team Directory', desc: 'Manage your team roster', color: 'bg-gradient-to-br from-emerald-50 to-teal-50 text-emerald-600 border-emerald-100' },
              { to: '/content', icon: BookOpen, title: 'Library', desc: 'Curate learning materials', color: 'bg-gradient-to-br from-amber-50 to-orange-50 text-amber-600 border-amber-100' },
              { to: '/voice', icon: Mic2, title: 'Voice Studio', desc: 'Customize AI voice profiles', color: 'bg-gradient-to-br from-violet-50 to-purple-50 text-violet-600 border-violet-100' },
            ].map((action, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
              >
                <Link
                  to={action.to}
                  className="group p-5 bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 hover:border-primary-300/50 hover:shadow-[0_12px_40px_rgba(0,0,0,0.1)] transition-all duration-300 flex items-center gap-4"
                >
                  <div className={`w-12 h-12 rounded-xl ${action.color} flex items-center justify-center border group-hover:scale-110 transition-transform duration-300`}>
                    <action.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-primary-600 transition-colors">
                      {action.title}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">{action.desc}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-primary-400 group-hover:translate-x-1 transition-all" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        <Card padding="lg" animate delay={0.5}>
          <div className="mb-5">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-1">Top Performers</h3>
            <p className="text-xs text-slate-500 font-medium">Highest achieving learners this week</p>
          </div>
          
          {stats?.topPerformers?.length > 0 ? (
            <div className="space-y-3">
              {stats.topPerformers.slice(0, 4).map((performer, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + i * 0.1 }}
                  className="p-3 flex items-center gap-3 bg-slate-50/50 rounded-xl hover:bg-slate-50 transition-colors group cursor-pointer"
                >
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                    i === 0 ? 'bg-gradient-to-br from-amber-400 to-amber-500 text-white shadow-amber-200 shadow-lg' :
                    i === 1 ? 'bg-gradient-to-br from-slate-300 to-slate-400 text-white' :
                    i === 2 ? 'bg-gradient-to-br from-orange-300 to-orange-400 text-white' :
                    'bg-slate-100 text-slate-500'
                  }`}>
                    {i + 1}
                  </div>
                  <Avatar
                    name={performer.name || performer.email}
                    size="sm"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">
                      {performer.name || performer.email?.split('@')[0]}
                    </p>
                    <p className="text-[11px] font-medium text-slate-500">
                      {performer.progress}% Accuracy
                    </p>
                  </div>
                  <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1.5 rounded-lg text-amber-700 border border-amber-100">
                    <Star className="w-3 h-3 fill-amber-500" />
                    <span className="text-xs font-bold">{performer.stars || 0}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-slate-300" />
              </div>
              <p className="text-sm font-semibold text-slate-700">No performance data</p>
              <p className="text-xs text-slate-400 mt-1">Complete sessions to see rankings</p>
            </div>
          )}
        </Card>
      </div>

      {/* Popular Topics */}
      <section>
        <Card padding="lg" animate delay={0.7}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-1">Popular Topics</h3>
              <p className="text-xs text-slate-500 font-medium">Most active learning modules</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-primary-500"></span> Active</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-slate-300"></span> Rate</span>
            </div>
          </div>

          <div className="overflow-x-auto">
{stats?.popularTopics?.length > 0 ? (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="pb-4 text-xs font-bold text-slate-400 uppercase tracking-widest pl-4">Topic</th>
                    <th className="pb-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Learners</th>
                    <th className="pb-4 text-xs font-bold text-slate-400 uppercase tracking-widest w-1/3 pr-4">Progress</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {stats.popularTopics.map((topic, i) => {
                    const Icon = {
                      'MessageSquare': MessageSquare,
                      'AlertTriangle': AlertTriangle,
                      'Briefcase': Briefcase,
                      'Utensils': Utensils
                    }[topic.icon] || FileText;

                    return (
                      <tr key={i} className="group hover:bg-slate-50 transition-colors">
                        <td className="py-4 pl-4">
                          <div className="flex items-center gap-4">
                            <Icon className="w-5 h-5 text-slate-400 group-hover:text-primary-600 transition-colors" />
                            <span className="text-sm font-bold text-slate-900">{topic.name}</span>
                          </div>
                        </td>
                        <td className="py-4">
                          <span className="text-sm font-bold text-slate-700">{topic.learners}</span>
                        </td>
                        <td className="py-4 pr-4">
                          <div className="flex items-center gap-4">
                            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-primary-500 to-primary-400 rounded-full"
                                style={{ width: `${topic.progress}%` }}
                              />
                            </div>
                            <span className="text-xs font-black text-slate-700 w-8">{topic.progress}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-8">
                <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-slate-500 font-medium">No topic data available</p>
                <p className="text-xs text-slate-400 mt-1">Start training sessions to see popular topics</p>
              </div>
            )}
          </div>
        </Card>
      </section >

      {/* Content Analytics */}
      <section>
        <Card variant="dark" padding="lg" animate delay={0.8}>
          <div className="flex items-start justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-2xl border border-indigo-500/30">
                <FileText className="w-6 h-6 text-indigo-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Content Analytics</h3>
                <p className="text-slate-400 text-sm">Performance metrics for training materials</p>
              </div>
            </div>
            <button className="text-sm font-semibold text-slate-300 hover:text-white flex items-center gap-2 bg-slate-800/80 hover:bg-slate-700 px-4 py-2.5 rounded-xl transition-all border border-slate-700">
              <ArrowUpRight className="w-4 h-4" />
              Full Report
            </button>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            {[
              { label: 'Total Materials', value: stats?.contentAnalytics?.totalMaterials, icon: FileText },
              { label: 'Active Topics', value: stats?.contentAnalytics?.activeTopics, icon: Star },
              { label: 'Avg Engagement', value: `${stats?.contentAnalytics?.avgEngagement}%`, icon: TrendingUp },
              { label: 'URL Resources', value: stats?.contentAnalytics?.urlResources, icon: ArrowUpRight },
            ].map((stat, i) => (
              <div key={i} className="p-5 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800 transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</span>
                  <stat.icon className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="text-3xl font-black tracking-tight">{stat.value}</div>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                <Star className="w-3 h-3 text-amber-500" /> Most Used Materials
              </h4>
              <div className="space-y-2">
                {stats?.contentAnalytics?.topContent?.length > 0 ? (
                  stats.contentAnalytics.topContent.map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-3 -mx-3 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer group">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center font-bold text-[10px] text-slate-400 border border-slate-700 group-hover:border-slate-600 group-hover:text-white transition-all">
                          {item.type?.toUpperCase() || 'DOC'}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors">{item.title || item.name}</p>
                        </div>
                      </div>
                      <div className="text-right min-w-[100px]">
                        <div className="flex items-center justify-end gap-2 mb-1">
                          <span className="text-xs font-bold text-white">{item.views || 0}</span>
                          <span className="text-[10px] text-slate-500 uppercase">Views</span>
                        </div>
                        <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${Math.min((item.views || 0) / 10, 100)}%` }} />
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6">
                    <FileText className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                    <p className="text-xs text-slate-400">No content data available</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                <TrendingUp className="w-3 h-3 text-emerald-500" /> Insights
              </h4>
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 p-6 rounded-2xl mb-auto">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0 border border-amber-500/20">
                    <Star className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <h5 className="text-sm font-bold mb-2 text-white">Emergency content is trending</h5>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Materials related to emergency procedures have seen a <span className="font-bold text-white">92% completion rate</span> this week. This is an increase of 12% over last week.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex items-center gap-4">
                <Button
                  variant="primary"
                  leftIcon={<Upload className="w-4 h-4" />}
                  className="flex-1 font-bold uppercase tracking-wider text-xs"
                >
                  Upload Content
                </Button>
                <Button
                  variant="accent"
                  className="flex-1 font-bold uppercase tracking-wider text-xs bg-slate-800 border border-slate-700 hover:bg-slate-700 hover:border-slate-600"
                >
                  Manage Topics
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </section>

    </div>

  );
};

export default Dashboard;

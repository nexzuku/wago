import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, CheckCircle, Circle, Route, ChevronRight, Loader2, MapPin } from 'lucide-react';
import { learningPathsAPI } from '../../services/api';


const PathsPage = () => {
  const [paths, setPaths] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPaths();
  }, []);

  const loadPaths = async () => {
    try {
      const { data } = await learningPathsAPI.getForTraining();
      const items = data.data || [];
      setPaths(items);
    } catch (err) {
      console.error('Failed to load learning paths:', err);
      setPaths([]);
    } finally {
      setIsLoading(false);
    }
  };

  const levelStyles = {
    beginner: {
      color: 'from-emerald-500 to-teal-500',
      bgColor: 'bg-emerald-500/10',
      textColor: 'text-emerald-400',
      borderColor: 'border-emerald-500/20',
      label: '初級 Beginner'
    },
    intermediate: {
      color: 'from-blue-500 to-indigo-500',
      bgColor: 'bg-blue-500/10',
      textColor: 'text-blue-400',
      borderColor: 'border-blue-500/20',
      label: '中級 Intermediate'
    },
    advanced: {
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-500/10',
      textColor: 'text-purple-400',
      borderColor: 'border-purple-500/20',
      label: '上級 Advanced'
    }
  };

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
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-violet-500/20 flex items-center justify-center">
              <Route className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-display font-bold text-white">Learning Paths</h1>
              <p className="text-xs text-slate-500">Structured journeys from beginner to advanced</p>
            </div>
          </div>
          <p className="text-sm text-slate-400 mt-2 max-w-2xl">
            Follow structured learning paths that combine Japanese language with company culture and work skills. Complete each path to unlock the next level.
          </p>
        </div>

        {/* Path Cards */}
        {paths.length === 0 && (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-8 h-8 text-slate-600" />
            </div>
            <h3 className="text-lg font-display font-bold text-slate-300 mb-2">No Learning Paths Yet</h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto">Learning paths haven't been set up yet. Check back soon!</p>
          </div>
        )}

        {/* Timeline Layout */}
        <div className="relative">
          {/* Vertical connector line */}
          {paths.length > 1 && (
            <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-emerald-500/20 via-blue-500/20 to-purple-500/20 hidden md:block" />
          )}

          <div className="space-y-5">
            {paths.map((path, idx) => {
              const styles = levelStyles[path.level] || levelStyles.beginner;
              const levelLabel = path.levelLabel || styles.label || path.level;
              const lockMessage = path.lockMessage || (path.prerequisitePathId ? 'Complete previous path first' : 'Locked');
              return (
                <motion.div
                  key={path._id || path.id || idx}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="relative md:pl-14"
                >
                  {/* Timeline dot */}
                  <div className={`hidden md:flex absolute left-3.5 top-5 w-5 h-5 rounded-full items-center justify-center border-2 z-10 ${
                    path.unlocked ? styles.borderColor + ' ' + styles.bgColor : 'border-slate-700 bg-slate-800'
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${path.unlocked ? 'bg-current ' + styles.textColor : 'bg-slate-600'}`} />
                  </div>

                  <div className={`rounded-2xl border overflow-hidden transition-all ${
                    path.unlocked ? 'border-white/[0.08]' : 'border-white/[0.04] opacity-60'
                  }`}
                  style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)' }}
                  >
                    {/* Path Header */}
                    <div className="px-5 pt-5 pb-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold ${styles.bgColor} ${styles.textColor} mb-2`}>
                            {levelLabel}
                          </div>
                          <h2 className="text-lg font-display font-bold text-white">{path.title}</h2>
                          <p className="text-xs text-slate-500 mt-0.5">{path.duration}</p>
                        </div>
                        {path.unlocked && (
                          <div className="text-right flex-shrink-0">
                            <span className={`text-2xl font-black ${styles.textColor}`}>{path.progress}%</span>
                          </div>
                        )}
                      </div>

                      {/* Progress Bar */}
                      <div className="mt-3">
                        <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden">
                          <motion.div
                            className={`h-full rounded-full bg-gradient-to-r ${styles.color}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${path.progress}%` }}
                            transition={{ duration: 0.8, delay: idx * 0.1 + 0.3 }}
                          />
                        </div>
                        {!path.unlocked && (
                          <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-1.5">
                            <Lock className="w-3 h-3" /> {lockMessage}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Modules */}
                    <div className="px-5 pb-5">
                      <div className="space-y-1.5">
                        {path.modules.map((mod, i) => (
                          <div
                            key={i}
                            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-all ${
                              mod.status === 'completed' ? 'bg-emerald-500/[0.07]' :
                              mod.status === 'current' ? 'bg-primary-500/10 border border-primary-500/20' :
                              'bg-white/[0.02] border border-white/[0.04]'
                            }`}
                          >
                            {mod.status === 'completed' ? (
                              <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                            ) : mod.status === 'current' ? (
                              <div className="relative flex-shrink-0">
                                <Circle className="w-4 h-4 text-primary-500" />
                                <span className="absolute inset-0 rounded-full bg-primary-400 animate-ping opacity-20" />
                              </div>
                            ) : (
                              <Lock className="w-4 h-4 text-slate-600 flex-shrink-0" />
                            )}
                            <span className={`flex-1 ${
                              mod.status === 'completed' ? 'text-emerald-400 line-through decoration-emerald-600/50' :
                              mod.status === 'current' ? 'text-primary-300 font-medium' :
                              'text-slate-500'
                            }`}>
                              {mod.name}
                            </span>
                            {mod.status === 'current' && (
                              <span className="text-[10px] font-bold text-primary-400 bg-primary-500/15 px-2 py-0.5 rounded-md">
                                CURRENT
                              </span>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Action Button */}
                      {path.unlocked && (
                        <button className="w-full mt-4 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-xl font-semibold text-sm shadow-lg shadow-primary-600/10 hover:shadow-xl hover:shadow-primary-600/20 transition-all hover:scale-[1.01] active:scale-[0.99]">
                          {path.progress > 0 ? 'Continue Learning' : 'Start Path'}
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PathsPage;

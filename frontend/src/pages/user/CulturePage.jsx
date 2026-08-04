import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, ChevronDown, ChevronUp, Check, X as XIcon, Loader2, BookOpen, Eye } from 'lucide-react';
import { cultureAPI } from '../../services/api';


const CulturePage = () => {
  const [cultureData, setCultureData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expanded, setExpanded] = useState(new Set());
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    loadCulture();
  }, []);

  const loadCulture = async () => {
    try {
      const { data } = await cultureAPI.getForTraining();
      const items = data.data || [];
      setCultureData(items);
      if (items.length > 0) setExpanded(new Set([items[0]._id]));
    } catch (err) {
      console.error('Failed to load culture content:', err);
      setCultureData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggle = (id) => {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
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
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500/20 to-orange-500/20 border border-rose-500/20 flex items-center justify-center">
              <span className="text-lg">⛩️</span>
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-display font-bold text-white">Culture & Etiquette</h1>
              <p className="text-xs text-slate-500">
                {cultureData.length} {cultureData.length === 1 ? 'lesson' : 'lessons'} available
              </p>
            </div>
          </div>
          <p className="text-sm text-slate-400 mt-2 max-w-2xl">
            Master Japanese workplace culture, business manners, and proper etiquette to work effectively with Japanese colleagues.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex gap-2 mb-5 overflow-x-auto pb-1 scrollbar-none">
          {['all', 'etiquette', 'business', 'social'].map(f => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeFilter === f
                  ? 'bg-primary-600 text-white'
                  : 'bg-white/[0.06] text-slate-400 hover:bg-white/[0.1] hover:text-slate-300 border border-white/[0.06]'
              }`}
            >
              {f === 'all' ? 'All Topics' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Culture Sections */}
        {cultureData.length === 0 && (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-slate-600" />
            </div>
            <h3 className="text-lg font-display font-bold text-slate-300 mb-2">No Culture Content Yet</h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto">Your admin hasn't added any culture lessons yet. Check back soon!</p>
          </div>
        )}

        <div className="grid gap-3 md:grid-cols-1">
          {cultureData.map((section, idx) => (
            <motion.div
              key={section._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="rounded-2xl border border-white/[0.08] overflow-hidden"
              style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)' }}
            >
              {/* Section Header */}
              <button
                onClick={() => toggle(section._id)}
                className="w-full flex items-center justify-between p-4 md:p-5 text-left hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-white/[0.06] border border-white/[0.06] flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">{section.icon}</span>
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-white text-sm md:text-base">{section.title}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{section.subtitle}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {section.videoUrl && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(section.videoUrl, '_blank', 'noopener,noreferrer');
                      }}
                      className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-primary-500/10 text-primary-400 rounded-lg text-xs font-semibold hover:bg-primary-500/20 transition-colors border border-primary-500/20"
                    >
                      <Play className="w-3 h-3" /> Watch Video
                    </button>
                  )}
                  <div className={`p-1.5 rounded-lg transition-all ${expanded.has(section._id) ? 'bg-white/[0.06]' : ''}`}>
                    {expanded.has(section._id) ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-500" />
                    )}
                  </div>
                </div>
              </button>

              {/* Section Content */}
              <AnimatePresence>
                {expanded.has(section._id) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 md:px-5 pb-4 md:pb-5 pt-1 border-t border-white/[0.06]">
                      {/* Mobile video button */}
                      {section.videoUrl && (
                        <button
                          onClick={() => window.open(section.videoUrl, '_blank', 'noopener,noreferrer')}
                          className="sm:hidden flex items-center gap-1.5 px-3 py-2 mt-3 mb-2 bg-primary-500/10 text-primary-400 rounded-lg text-xs font-semibold hover:bg-primary-500/20 transition-colors border border-primary-500/20 w-full justify-center"
                        >
                          <Play className="w-3 h-3" /> Watch Video Lesson
                        </button>
                      )}

                      {section.contentType === 'types' && section.types && (
                        <div className="grid gap-2.5 mt-3 sm:grid-cols-2">
                          {section.types.map((item, i) => (
                            <div key={i} className="flex items-start gap-3 p-3.5 rounded-xl border border-white/[0.06]" style={{ background: 'rgba(255,255,255,0.02)' }}>
                              <div className="w-9 h-9 rounded-lg bg-primary-500/15 text-primary-400 flex items-center justify-center text-xs font-bold flex-shrink-0">
                                {item.label.includes('°') ? item.label.split('°')[0] + '°' : (i + 1)}
                              </div>
                              <div>
                                <p className="font-semibold text-slate-200 text-sm">{item.label}</p>
                                <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{item.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {section.contentType === 'rules' && section.rules && (
                        <div className="space-y-2 mt-3">
                          {section.rules.map((item, i) => (
                            <div key={i} className={`flex items-start gap-3 p-3 rounded-xl border ${
                              item.isPositive ? 'border-emerald-500/10 bg-emerald-500/[0.03]' : 'border-rose-500/10 bg-rose-500/[0.03]'
                            }`}>
                              <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                                item.isPositive ? 'bg-emerald-500/15' : 'bg-rose-500/15'
                              }`}>
                                {item.isPositive ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                                ) : (
                                  <XIcon className="w-3.5 h-3.5 text-rose-400" />
                                )}
                              </div>
                              <span className={`text-sm leading-relaxed ${item.isPositive ? 'text-slate-300' : 'text-rose-300'}`}>
                                {item.text}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {section.contentType === 'tips' && section.tips && (
                        <div className="space-y-2.5 mt-3">
                          {section.tips.map((item, i) => (
                            <div key={i} className="p-4 rounded-xl space-y-2 border border-white/[0.06]" style={{ background: 'rgba(255,255,255,0.02)' }}>
                              <div className="flex items-start gap-2">
                                <span className="text-rose-400 text-xs font-bold bg-rose-500/10 px-2 py-0.5 rounded flex-shrink-0">DON'T</span>
                                <span className="text-sm text-slate-400">{item.bad}</span>
                              </div>
                              <div className="flex items-start gap-2">
                                <span className="text-emerald-400 text-xs font-bold bg-emerald-500/10 px-2 py-0.5 rounded flex-shrink-0">DO</span>
                                <span className="text-sm text-slate-200 font-medium">{item.good}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CulturePage;

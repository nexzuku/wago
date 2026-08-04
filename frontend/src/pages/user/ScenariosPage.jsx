import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lock, Play, CheckCircle, Clock, BookOpen, Info, Loader2, Briefcase, ChevronRight } from 'lucide-react';
import { scenariosAPI } from '../../services/api';


const difficultyColors = {
  beginner: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  intermediate: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  advanced: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
};

const ScenariosPage = () => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadScenarios();
  }, []);

  const loadScenarios = async () => {
    try {
      const { data } = await scenariosAPI.getForTraining();
      const response = data.data || {};
      if (response.categories && response.categories.length > 0) {
        setCategories(response.categories);
      } else {
        setCategories([]);
      }
    } catch (err) {
      console.error('Failed to load scenarios:', err);
      setCategories([]);
    } finally {
      setIsLoading(false);
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
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-500/20 flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-display font-bold text-white">Workplace Scenarios</h1>
              <p className="text-xs text-slate-500">Practice real workplace situations</p>
            </div>
          </div>
          <div className="flex items-start gap-2.5 mt-3 p-3.5 rounded-xl border border-blue-500/15" style={{ background: 'rgba(59,130,246,0.06)' }}>
            <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-blue-300/80 leading-relaxed">
              Complete basic topics to unlock advanced scenarios. Each scenario simulates real workplace conversations.
            </p>
          </div>
        </div>

        {/* Scenario Categories */}
        {categories.length === 0 && (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mx-auto mb-4">
              <Briefcase className="w-8 h-8 text-slate-600" />
            </div>
            <h3 className="text-lg font-display font-bold text-slate-300 mb-2">No Scenarios Yet</h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto">Workplace scenarios haven't been created yet. Check back soon!</p>
          </div>
        )}

        <div className="space-y-8">
          {categories.map((category, catIdx) => (
            <motion.div
              key={category.id || category.category || catIdx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: catIdx * 0.08 }}
            >
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 rounded-lg bg-white/[0.06] border border-white/[0.06] flex items-center justify-center">
                  <span className="text-base">{category.icon || '📘'}</span>
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white">{category.title || category.category}</h2>
                  <p className="text-[10px] text-slate-500">{category.scenarios?.length || 0} scenarios</p>
                </div>
              </div>

              <div className="grid gap-2.5 sm:grid-cols-2">
                {category.scenarios.map((scenario) => (
                  <ScenarioCard key={scenario._id || scenario.id} scenario={scenario} />
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

const ScenarioCard = ({ scenario }) => {
  const isLocked = scenario.status === 'locked';
  const isCompleted = scenario.status === 'completed';

  return (
    <button
      disabled={isLocked}
      className={`w-full flex flex-col p-4 rounded-2xl text-left transition-all border group ${
        isLocked
          ? 'border-white/[0.04] opacity-50 cursor-not-allowed'
          : isCompleted
            ? 'border-emerald-500/20 hover:border-emerald-500/30'
            : 'border-white/[0.08] hover:border-primary-500/20 cursor-pointer'
      }`}
      style={
        isLocked ? { background: 'rgba(255,255,255,0.01)' } :
        isCompleted ? { background: 'linear-gradient(180deg, rgba(16,185,129,0.06), rgba(16,185,129,0.02))' } :
        { background: 'linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))' }
      }
    >
      {/* Top Row */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
          isLocked ? 'bg-white/[0.04]' :
          isCompleted ? 'bg-emerald-500/15' :
          'bg-primary-500/15'
        }`}>
          {isLocked ? <Lock className="w-4 h-4 text-slate-600" /> :
           isCompleted ? <CheckCircle className="w-4 h-4 text-emerald-400" /> :
           <Play className="w-4 h-4 text-primary-400" />}
        </div>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${difficultyColors[scenario.difficulty] || 'bg-white/[0.06] text-slate-400 border-white/[0.06]'}`}>
          {scenario.difficulty}
        </span>
      </div>

      {/* Content */}
      <h3 className={`font-display font-semibold text-sm mb-1 ${isLocked ? 'text-slate-600' : 'text-white'}`}>
        {scenario.title}
      </h3>
      <p className={`text-xs mb-3 leading-relaxed line-clamp-2 ${isLocked ? 'text-slate-600' : 'text-slate-400'}`}>
        {scenario.desc || scenario.description}
      </p>

      {/* Stats Row */}
      <div className="flex items-center gap-3 text-[10px] text-slate-500 mt-auto">
        <span className="flex items-center gap-1">
          <BookOpen className="w-3 h-3" /> {(scenario.phrases ?? scenario.phraseCount ?? 0)} phrases
        </span>
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" /> {scenario.duration}
        </span>
        {!isLocked && (
          <ChevronRight className="w-3 h-3 ml-auto text-slate-600 group-hover:text-primary-400 transition-colors" />
        )}
      </div>

      {/* Progress Bar */}
      {!isLocked && scenario.progress !== undefined && (
        <div className="mt-3">
          <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isCompleted ? 'bg-emerald-500' : 'bg-primary-500'
              }`}
              style={{ width: `${scenario.progress}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">
            {scenario.progress}% complete
          </span>
        </div>
      )}
    </button>
  );
};

export default ScenariosPage;

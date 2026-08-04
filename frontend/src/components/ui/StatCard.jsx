import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown } from 'lucide-react';
import clsx from 'clsx';

const StatCard = ({
  label,
  value,
  icon: Icon,
  change,
  changeLabel,
  trend = 'up',
  color = 'from-cyan-500 to-blue-600',
  delay = 0,
  className,
}) => {
  const TrendIcon = trend === 'up' ? TrendingUp : TrendingDown;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={clsx(
        'relative overflow-hidden rounded-2xl p-6',
        'bg-white/80 backdrop-blur-xl border border-white/20',
        'shadow-[0_8px_32px_rgba(0,0,0,0.08)] hover:shadow-[0_16px_48px_rgba(0,0,0,0.12)]',
        'transition-shadow duration-300',
        className
      )}
    >
      {/* Gradient Background Glow */}
      <div className={clsx(
        'absolute -top-20 -right-20 w-40 h-40 rounded-full opacity-20 blur-3xl bg-gradient-to-br',
        color
      )} />
      
      {/* Subtle Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000000' fill-opacity='1' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='1'/%3E%3C/g%3E%3C/svg%3E")`
      }} />
      
      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          {Icon && (
            <motion.div 
              whileHover={{ scale: 1.05, rotate: 5 }}
              className={clsx(
                'w-12 h-12 rounded-2xl bg-gradient-to-br flex items-center justify-center shadow-lg',
                'shadow-cyan-500/20',
                color
              )}
            >
              <Icon className="w-6 h-6 text-white" />
            </motion.div>
          )}
          {change && (
            <div className={clsx(
              'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold',
              trend === 'up' 
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                : 'bg-rose-50 text-rose-700 border border-rose-200'
            )}>
              <TrendIcon className="w-3 h-3" />
              {change}
            </div>
          )}
        </div>
        
        <div className="space-y-1">
          <div className="text-3xl font-bold text-slate-900 tracking-tight">
            {value}
          </div>
          <div className="flex items-center gap-2">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</div>
            {changeLabel && (
              <span className="text-[10px] text-slate-400">• {changeLabel}</span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default StatCard;

import { motion } from 'framer-motion';
import clsx from 'clsx';

const ProgressBar = ({
  value = 0,
  max = 100,
  size = 'md',
  variant = 'primary',
  showLabel = false,
  label,
  animated = true,
  className,
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const sizes = {
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3',
  };

  const variants = {
    primary: 'from-primary-600 to-primary-400',
    success: 'from-accent-jade to-emerald-400',
    warning: 'from-accent-gold to-amber-400',
    danger: 'from-red-600 to-red-400',
    rose: 'from-rose-500 to-rose-400',
    gradient: 'from-primary-600 via-violet-500 to-emerald-500',
  };

  return (
    <div className={clsx('w-full', className)}>
      {(showLabel || label) && (
        <div className="flex items-center justify-between mb-2 text-[10px] font-bold uppercase tracking-wider">
          <span className="text-slate-400">{label || 'Progress'}</span>
          <span className="text-slate-900">{Math.round(percentage)}%</span>
        </div>
      )}
      <div className={clsx('bg-slate-100 rounded-full overflow-hidden', sizes[size])}>
        <motion.div
          className={clsx('h-full rounded-full bg-primary-600')}
          initial={animated ? { width: 0 } : false}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;

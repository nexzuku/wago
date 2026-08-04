import { motion } from 'framer-motion';
import clsx from 'clsx';

const Loader = ({
  size = 'md',
  variant = 'spinner',
  text,
  className,
  fullScreen = false,
}) => {
  const sizes = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const Spinner = () => (
    <div
      className={clsx(
        'border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin',
        sizes[size]
      )}
    />
  );

  const Dots = () => (
    <div className="flex items-center gap-1">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className={clsx(
            'rounded-full bg-primary-500',
            size === 'sm' ? 'w-1.5 h-1.5' : size === 'lg' ? 'w-3 h-3' : 'w-2 h-2'
          )}
          animate={{ y: [0, -8, 0] }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.15,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );

  const Pulse = () => (
    <div className="relative">
      <motion.div
        className={clsx(
          'rounded-full bg-primary-500/30',
          sizes[size]
        )}
        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
      />
      <div
        className={clsx(
          'absolute inset-0 rounded-full bg-primary-500',
          sizes[size]
        )}
        style={{ transform: 'scale(0.5)' }}
      />
    </div>
  );

  const JapanesePulse = () => (
    <motion.div
      className={clsx(
        'flex items-center justify-center rounded-xl bg-slate-900 font-display font-bold text-white',
        size === 'sm' ? 'w-8 h-8 text-sm' : size === 'lg' ? 'w-16 h-16 text-2xl' : 'w-12 h-12 text-lg'
      )}
      animate={{ 
        scale: [1, 1.05, 1],
        boxShadow: [
          '0 0 0 0 rgba(99, 102, 241, 0)',
          '0 0 0 10px rgba(99, 102, 241, 0.1)',
          '0 0 0 0 rgba(99, 102, 241, 0)'
        ]
      }}
      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
    >
      和
    </motion.div>
  );

  const loaderContent = (
    <div className={clsx('flex flex-col items-center gap-4', className)}>
      {variant === 'spinner' && <Spinner />}
      {variant === 'dots' && <Dots />}
      {variant === 'pulse' && <Pulse />}
      {variant === 'japanese' && <JapanesePulse />}
      {text && (
        <p className="text-slate-500 text-sm animate-pulse">{text}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
        {loaderContent}
      </div>
    );
  }

  return loaderContent;
};

export default Loader;

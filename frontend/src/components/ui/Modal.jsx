import { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import clsx from 'clsx';

const Modal = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
  showClose = true,
  className,
}) => {
  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-[90vw]',
  };

  const handleEscape = useCallback((e) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, handleEscape]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
            className={clsx(
              'relative w-full bg-white border border-slate-200 rounded-xl shadow-2xl',
              'max-h-[90vh] overflow-y-auto scrollbar-thin',
              sizes[size],
              className
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {(title || showClose) && (
              <div className="sticky top-0 z-10 flex items-start justify-between p-6 pb-4 bg-white border-b border-slate-100">
                <div>
                  {title && (
                    <h2 className="text-xl font-bold text-slate-900">
                      {title}
                    </h2>
                  )}
                  {description && (
                    <p className="mt-1 text-sm text-slate-500">{description}</p>
                  )}
                </div>
                {showClose && (
                  <button
                    onClick={onClose}
                    className="p-2 -m-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            )}
            <div className="p-6 pt-4">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Modal;

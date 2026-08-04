import { motion } from 'framer-motion';
import { FolderOpen } from 'lucide-react';
import Button from './Button';

const EmptyState = ({
  icon: Icon = FolderOpen,
  title,
  description,
  action,
  actionLabel,
  actionIcon,
  className,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`text-center py-16 px-6 bg-white rounded-xl border border-slate-200 ${className}`}
    >
      <div className="w-16 h-16 mx-auto mb-5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center">
        <Icon className="w-8 h-8 text-slate-400" />
      </div>
      {title && (
        <h3 className="font-bold text-lg text-slate-900 mb-2">
          {title}
        </h3>
      )}
      {description && (
        <p className="text-slate-500 text-sm max-w-sm mx-auto mb-6 leading-relaxed">{description}</p>
      )}
      {action && actionLabel && (
        <Button onClick={action} leftIcon={actionIcon}>
          {actionLabel}
        </Button>
      )}
    </motion.div>
  );
};

export default EmptyState;

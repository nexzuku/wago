import clsx from 'clsx';

const Skeleton = ({
  variant = 'rectangle',
  width,
  height,
  className,
  count = 1,
  gap = 3,
}) => {
  const variants = {
    rectangle: 'rounded-lg',
    circle: 'rounded-full',
    text: 'rounded h-4',
    card: 'rounded-2xl h-32',
    avatar: 'rounded-full w-10 h-10',
  };

  const items = Array.from({ length: count }, (_, i) => (
    <div
      key={i}
      className={clsx(
        'bg-slate-200 animate-pulse',
        variants[variant],
        className
      )}
      style={{
        width: width || (variant === 'text' ? '100%' : undefined),
        height: height,
      }}
    />
  ));

  if (count === 1) return items[0];

  return <div className={`space-y-${gap}`}>{items}</div>;
};

const SkeletonCard = ({ className }) => (
  <div className={clsx('bg-white rounded-xl p-6 border border-slate-200 shadow-sm', className)}>
    <div className="flex items-start gap-4">
      <Skeleton variant="avatar" />
      <div className="flex-1 space-y-3">
        <Skeleton variant="text" width="60%" />
        <Skeleton variant="text" width="40%" />
      </div>
    </div>
    <div className="mt-4 space-y-2">
      <Skeleton variant="text" />
      <Skeleton variant="text" width="80%" />
    </div>
  </div>
);

const SkeletonTable = ({ rows = 5, cols = 4 }) => (
  <div className="space-y-3">
    {Array.from({ length: rows }, (_, i) => (
      <div key={i} className="flex items-center gap-4 px-4 py-3">
        <Skeleton variant="avatar" />
        {Array.from({ length: cols - 1 }, (_, j) => (
          <div key={j} className="flex-1">
            <Skeleton variant="text" width={j === 0 ? '70%' : '50%'} />
          </div>
        ))}
      </div>
    ))}
  </div>
);

Skeleton.Card = SkeletonCard;
Skeleton.Table = SkeletonTable;

export default Skeleton;

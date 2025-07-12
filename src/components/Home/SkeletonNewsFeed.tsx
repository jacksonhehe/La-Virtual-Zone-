import CardSkeleton from '../common/CardSkeleton';

const SkeletonNewsFeed = () => (
  <div className="space-y-2">
    {Array.from({ length: 4 }).map((_, i) => (
      <CardSkeleton key={i} className="h-24" lines={3} />
    ))}
  </div>
);

export default SkeletonNewsFeed;

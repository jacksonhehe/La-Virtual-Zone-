import CardSkeleton from './CardSkeleton';

const DashboardSkeleton = () => (
  <div className="container mx-auto px-4 py-8 space-y-6">
    <div className="h-6 w-1/3 animate-pulse rounded bg-white/10" />
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <CardSkeleton key={i} className="h-24" lines={0} />
      ))}
    </div>
    <CardSkeleton className="h-64" lines={0} />
  </div>
);

export default DashboardSkeleton;

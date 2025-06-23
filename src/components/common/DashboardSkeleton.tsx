const DashboardSkeleton = () => (
  <div className="container mx-auto px-4 py-8 animate-pulse space-y-6">
    <div className="h-6 w-1/3 bg-gray-700 rounded" />
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-24 bg-gray-700 rounded" />
      ))}
    </div>
    <div className="h-64 bg-gray-700 rounded" />
  </div>
);

export default DashboardSkeleton;

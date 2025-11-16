interface  StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
}

const StatsCard = ({ title, value, icon, trend, trendValue }: StatsCardProps) => {
  const renderTrend = () => {
    if (!trend || !trendValue) return null;
    
    switch (trend) {
      case 'up':
        return (
          <div className="text-green-400 text-sm flex items-center">
            <span className="mr-1">↑</span>
            <span>{trendValue}</span>
          </div>
        );
      case 'down':
        return (
          <div className="text-red-400 text-sm flex items-center">
            <span className="mr-1">↓</span>
            <span>{trendValue}</span>
          </div>
        );
      case 'neutral':
        return (
          <div className="text-gray-400 text-sm flex items-center">
            <span className="mr-1">→</span>
            <span>{trendValue}</span>
          </div>
        );
      default:
        return null;
    }
  };
  
  return (
    <div className="card p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-400 text-sm mb-2">{title}</p>
          <p className="text-xl font-bold">{value}</p>
          {renderTrend()}
        </div>
        <div className="bg-gray-800 p-3 rounded-lg">
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
 
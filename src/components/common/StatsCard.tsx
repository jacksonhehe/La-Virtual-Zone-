import ProgressBar from './ProgressBar';
import { ArrowUp, ArrowDown, ArrowRight } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  progress?: number;
}

const StatsCard = ({ title, value, icon, trend, trendValue, progress }: StatsCardProps) => {
  const renderTrend = () => {
    if (!trend || !trendValue) return null;
    
    switch (trend) {
      case 'up':
        return (
          <div className="text-green-400 text-sm flex items-center">
            <ArrowUp size={14} className="mr-1" />
            <span>{trendValue}</span>
          </div>
        );
      case 'down':
        return (
          <div className="text-red-400 text-sm flex items-center">
            <ArrowDown size={14} className="mr-1" />
            <span>{trendValue}</span>
          </div>
        );
      case 'neutral':
        return (
          <div className="text-gray-400 text-sm flex items-center">
            <ArrowRight size={14} className="mr-1" />
            <span>{trendValue}</span>
          </div>
        );
      default:
        return null;
    }
  };
  
  return (
    <div className="group relative overflow-hidden card-glass p-4">
      <span className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/20 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="mb-2 text-xs text-gray-400 sm:text-sm">{title}</p>
          <p className="text-xl font-bold" aria-live="polite">{value}</p>
          {renderTrend()}
          {typeof progress === 'number' && (
            <div className="mt-2">
              <ProgressBar value={progress} />
            </div>
          )}
        </div>
        <div className="ml-4 rounded-lg bg-gray-800 p-3 ring-1 ring-inset ring-white/20">
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
 
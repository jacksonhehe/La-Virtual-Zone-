import  { LucideIcon } from 'lucide-react';

interface Props {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  gradient: string;
}

const StatsCard = ({ title, value, change, changeType = 'neutral', icon: Icon, gradient }: Props) => {
  const changeColor = changeType === 'positive' ? 'text-emerald-400' : 
                     changeType === 'negative' ? 'text-red-400' : 'text-gray-400';

  return (
    <div className="kpi-card group">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold gradient-text">{value}</p>
          {change && (
            <p className={`text-xs mt-1 ${changeColor}`}>{change}</p>
          )}
        </div>
        <div className={`p-3 ${gradient} rounded-2xl shadow-lg group-hover:scale-110 transition-transform`}>
          <Icon className="text-white" size={28} />
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
 
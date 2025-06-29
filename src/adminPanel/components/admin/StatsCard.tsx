import  { LucideIcon } from 'lucide-react';
import Card from '../../../components/ui/Card';

interface Props {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  gradient: string;
}

const StatsCard = ({ title, value, change, changeType = 'neutral', icon: Icon, gradient }: Props) => {
  const changeColor =
    changeType === 'positive'
      ? 'text-neon-green'
      : changeType === 'negative'
        ? 'text-neon-red'
        : 'text-vz-text';

  return (
    <Card className="kpi-card group p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-heading text-vz-text">{title}</p>
          <p className="text-3xl font-heading gradient-text">{value}</p>
          {change && (
            <p className={`text-xs mt-1 ${changeColor}`}>{change}</p>
          )}
        </div>
        <div className={`p-3 ${gradient} rounded shadow-lg group-hover:scale-110 transition-transform`}>
          <Icon className="text-vz-text" size={28} />
        </div>
      </div>
    </Card>
  );
};

export default StatsCard;
 
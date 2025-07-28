import React from 'react';

type Props = {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  title: string;
  value: React.ReactNode;
  gradient?: string;
};

const StatsCard: React.FC<Props> = ({ icon: Icon, title, value, gradient = 'from-slate-600 to-slate-800' }) => {
  return (
    <div className="rounded-xl border border-gray-700/50 bg-gray-800/40 p-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs text-gray-400">{title}</div>
          <div className="text-lg font-semibold text-white">{value}</div>
        </div>
        <div className={`p-2 rounded-lg bg-gradient-to-br ${gradient}`}>
          <Icon width={20} height={20} />
        </div>
      </div>
    </div>
  );
};

export default StatsCard;

import React from 'react';

type AdminPageHeaderProps = {
  title: string;
  subtitle?: string;
  badge?: string;
  actions?: React.ReactNode;
};

const AdminPageHeader = ({ title, subtitle, badge, actions }: AdminPageHeaderProps) => {
  return (
    <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div>
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold">{title}</h2>
          {badge && <span className="text-sm text-gray-400">{badge}</span>}
        </div>
        {subtitle && <p className="mt-1 text-sm text-gray-400">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
};

export default AdminPageHeader;

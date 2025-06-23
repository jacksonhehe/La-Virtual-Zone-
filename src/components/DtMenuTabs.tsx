import { NavLink, useMatch } from 'react-router-dom';

const tabs = [
  { to: '/liga-master/plantilla', label: 'Plantilla' },
  { to: '/liga-master/tacticas', label: 'Táctica' },
  { to: '/liga-master/finanzas', label: 'Finanzas' },
  { to: '/liga-master/calendario', label: 'Calendario' }
];

const TabLink = ({ to, label }: { to: string; label: string }) => {
  const match = useMatch(to);

  return (
    <NavLink
      to={to}
      role="tab"
      aria-selected={match ? 'true' : 'false'}
      className={({ isActive }) =>
        `pb-2 border-b-2 ${
          isActive ? 'border-accent' : 'border-transparent'
        } focus:outline-none focus-visible:ring-2 focus-visible:ring-accent`
      }
    >
      {label}
    </NavLink>
  );
};

const DtMenuTabs = () => (
  <nav
    className="flex gap-4 text-sm md:text-base font-semibold border-b border-zinc-700 mb-4"
    role="tablist"
  >
    {tabs.map(tab => (
      <TabLink key={tab.to} to={tab.to} label={tab.label} />
    ))}
  </nav>
);

export default DtMenuTabs;

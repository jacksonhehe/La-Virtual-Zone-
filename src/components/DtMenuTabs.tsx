import { NavLink } from 'react-router-dom';

const tabs = [
  { to: '/liga-master/plantilla', label: 'Plantilla' },
  { to: '/liga-master/tacticas', label: 'Táctica' },
  { to: '/liga-master/finanzas', label: 'Finanzas' },
  { to: '/liga-master/calendario', label: 'Calendario' }
];

const DtMenuTabs = () => (
  <nav className="flex gap-4 text-sm md:text-base font-semibold border-b border-zinc-700 mb-4">
    {tabs.map(tab => (
      <NavLink
        key={tab.to}
        to={tab.to}
        className={({ isActive }) =>
          `pb-2 border-b-2 ${isActive ? 'border-accent' : 'border-transparent'}`
        }
      >
        {tab.label}
      </NavLink>
    ))}
  </nav>
);

export default DtMenuTabs;

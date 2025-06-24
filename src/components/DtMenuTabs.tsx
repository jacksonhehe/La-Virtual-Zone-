
import { NavLink, useLocation } from "react-router-dom";

const tabs = [
  { to: "/liga-master/plantilla", label: "Plantilla" },
  { to: "/liga-master/tacticas", label: "Tácticas" },
  { to: "/liga-master/finanzas", label: "Finanzas" },
  { to: "/liga-master/calendario", label: "Calendario" },
];

const DtMenuTabs: React.FC = () => {
  const location = useLocation();
  return (
    <nav
      className="relative mb-6 flex gap-4 border-b border-zinc-700 text-sm font-semibold sm:text-base"
      role="tablist"
    >
      {tabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          className={({ isActive }) =>
            `pb-2 transition-colors duration-150 hover:text-accent ${
              isActive ? 'border-b-2 border-accent text-accent' : 'text-zinc-300'
            }`
          }
          aria-selected={location.pathname === tab.to}
        >
          {tab.label}
        </NavLink>
      ))}
    </nav>
  );
};

export default DtMenuTabs;

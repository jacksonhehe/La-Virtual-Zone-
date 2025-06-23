import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { useDataStore } from '../../store/dataStore';

const DtSidebar = () => {
  const { club } = useDataStore();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const links = [
    { to: `/liga-master/club/${club.slug}/plantilla`, label: 'Plantilla' },
    { to: '/liga-master/tacticas', label: 'Tácticas' },
    { to: `/liga-master/club/${club.slug}/finanzas`, label: 'Finanzas' },
    { to: '/liga-master/mercado', label: 'Mercado' },
    { to: '/liga-master/fixture', label: 'Fixture' },
    { to: '/liga-master/analisis', label: 'Análisis' }
  ];

  const handleNav = (to: string) => {
    navigate(to);
    setOpen(false);
  };

  return (
    <>
      <button
        aria-label="Abrir menú"
        className="md:hidden p-2 text-white z-50"
        onClick={() => setOpen(!open)}
      >
        <Menu size={24} />
      </button>

      <div
        onClick={() => setOpen(false)}
        className={`fixed inset-0 bg-black/50 transition-opacity md:hidden z-40 ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      />

      <aside
        className={`fixed md:static top-0 left-0 z-50 w-56 h-full bg-dark-light border-r border-gray-800 p-4 transform transition-transform ${
          open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <nav className="space-y-2 mt-8 md:mt-0">
          {links.map(link => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => handleNav(link.to)}
              className="block rounded px-3 py-2 card-hover hover:bg-dark-lighter"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default DtSidebar;

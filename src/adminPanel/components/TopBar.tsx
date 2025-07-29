import { Search, Sun, Moon, User } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

interface Props {
  onSearch?: (term: string) => void;
}

const TopBar = ({ onSearch }: Props) => {
  const { theme, toggleTheme } = useTheme();
  const [term, setTerm] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(term);
  };

  return (
    <div className="flex items-center justify-between mb-6">
      <form onSubmit={handleSubmit} className="relative w-full max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          className="input pl-9 w-full"
          placeholder="Buscar..."
          value={term}
          onChange={(e) => setTerm(e.target.value)}
        />
      </form>

      <div className="flex items-center gap-4 ml-4">
        <button
          type="button"
          onClick={toggleTheme}
          aria-label="Cambiar tema"
          className="btn-outline p-2 rounded-full"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <Link to="/perfil" aria-label="Perfil" className="btn-outline p-2 rounded-full">
          <User size={18} />
        </Link>
      </div>
    </div>
  );
};

export default TopBar;

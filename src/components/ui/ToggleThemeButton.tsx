import { Moon, Sun } from 'lucide-react';
import { useThemeStore } from '@/store/themeStore';

export default function ToggleThemeButton() {
  const { theme, setTheme } = useThemeStore();
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const current = theme === 'system' ? (prefersDark ? 'dark' : 'light') : theme;

  const toggle = () => {
    const next = current === 'dark' ? 'light' : 'dark';
    setTheme(next); // Solo actualiza el store global
    // La clase 'dark' se gestiona centralizadamente en App.tsx
  };

  return (
    <button onClick={toggle} aria-label="Alternar tema" className="p-2">
      {current === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
}

import { useState, useEffect } from 'react';
import { Check, Moon, Sun, Monitor } from 'lucide-react';

interface ThemeOption {
  id: string;
  name: string;
  icon: React.ReactNode;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  preview: string;
}

/**
 * Componente para seleccionar y personalizar el tema de la interfaz
 */
const ThemeSelector = () => {
  const [selectedTheme, setSelectedTheme] = useState('default');
  
  // Opciones de temas disponibles
  const themes: ThemeOption[] = [
    {
      id: 'default',
      name: 'Predeterminado',
      icon: <Monitor size={18} />,
      colors: {
        primary: '#3b82f6',
        secondary: '#8b5cf6',
        accent: '#10b981'
      },
      preview: 'linear-gradient(to right, #3b82f6, #8b5cf6)'
    },
    {
      id: 'dark',
      name: 'Oscuro',
      icon: <Moon size={18} />,
      colors: {
        primary: '#6366f1',
        secondary: '#8b5cf6',
        accent: '#ec4899'
      },
      preview: 'linear-gradient(to right, #6366f1, #8b5cf6)'
    },
    {
      id: 'neon',
      name: 'Neón',
      icon: <Sun size={18} />,
      colors: {
        primary: '#10b981',
        secondary: '#3b82f6',
        accent: '#f59e0b'
      },
      preview: 'linear-gradient(to right, #10b981, #3b82f6)'
    },
    {
      id: 'sunset',
      name: 'Atardecer',
      icon: <Sun size={18} />,
      colors: {
        primary: '#f59e0b',
        secondary: '#ef4444',
        accent: '#8b5cf6'
      },
      preview: 'linear-gradient(to right, #f59e0b, #ef4444)'
    }
  ];
  
  // Aplicar el tema seleccionado
  useEffect(() => {
    const theme = themes.find(t => t.id === selectedTheme);
    if (theme) {
      document.documentElement.style.setProperty('--primary', theme.colors.primary);
      document.documentElement.style.setProperty('--secondary', theme.colors.secondary);
      document.documentElement.style.setProperty('--accent', theme.colors.accent);
      
      // Guardar preferencia en localStorage
      localStorage.setItem('user-theme', selectedTheme);
    }
  }, [selectedTheme]);
  
  // Cargar tema guardado al iniciar
  useEffect(() => {
    const savedTheme = localStorage.getItem('user-theme');
    if (savedTheme && themes.some(t => t.id === savedTheme)) {
      setSelectedTheme(savedTheme);
    }
  }, []);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-200">Tema de la interfaz</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {themes.map((theme) => (
          <div
            key={theme.id}
            className={`relative rounded-lg overflow-hidden cursor-pointer transition-all duration-300 ${
              selectedTheme === theme.id 
                ? 'ring-2 ring-primary ring-offset-2 ring-offset-dark' 
                : 'hover:scale-105'
            }`}
            onClick={() => setSelectedTheme(theme.id)}
          >
            {/* Vista previa del tema */}
            <div 
              className="h-20 w-full"
              style={{ background: theme.preview }}
            />
            
            {/* Información del tema */}
            <div className="p-2 bg-dark-lighter">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{theme.name}</span>
                <div className="text-gray-400">{theme.icon}</div>
              </div>
            </div>
            
            {/* Indicador de selección */}
            {selectedTheme === theme.id && (
              <div className="absolute top-2 right-2 bg-primary text-white p-1 rounded-full">
                <Check size={14} />
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-800">
        <p className="text-sm text-gray-400">
          Los cambios de tema se aplicarán inmediatamente y se guardarán para futuras sesiones.
        </p>
      </div>
    </div>
  );
};

export default ThemeSelector;
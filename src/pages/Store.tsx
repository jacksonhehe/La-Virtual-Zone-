import { useState } from 'react';
import PageHeader from '../components/common/PageHeader';
import { Search, AlertCircle } from 'lucide-react';
import { useDataStore } from '../store/dataStore';
import { formatCurrency } from '../utils/helpers';

const Store = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const { storeItems } = useDataStore();
  
  // Filter store items
  const filteredItems = storeItems.filter(product => {
    if (activeCategory !== 'all' && product.category !== activeCategory) {
      return false;
    }
    
    if (searchQuery && !product.name.toLowerCase().includes(searchQuery.toLowerCase()) && !product.description.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    return true;
  });
  
  return (
    <div>
      <PageHeader 
        title="Tienda Virtual" 
        subtitle="Mejora tu experiencia con elementos cosméticos, personalizaciones y más."
        image="https://images.unsplash.com/photo-1511406361295-0a1ff814c0ce?ixid=M3w3MjUzNDh8MHwxfHNlYXJjaHwyfHxlc3BvcnRzJTIwZ2FtaW5nJTIwZGFyayUyMHRoZW1lfGVufDB8fHx8MTc0NzA3MTE4MHww&ixlib=rb-4.1.0"
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between mb-8 gap-4">
          <div className="flex items-center md:w-1/2 lg:w-1/3">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={16} className="text-gray-500" />
              </div>
              <input
                type="text"
                placeholder="Buscar productos..."
                className="input pl-10 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex space-x-2 overflow-x-auto pb-2 md:pb-0">
            <button 
              onClick={() => setActiveCategory('all')}
              className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-sm ${activeCategory === 'all' ? 'bg-primary text-white' : 'bg-dark-light text-gray-300 hover:bg-dark-lighter'}`}
            >
              Todos
            </button>
            <button 
              onClick={() => setActiveCategory('club')}
              className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-sm ${activeCategory === 'club' ? 'bg-primary text-white' : 'bg-dark-light text-gray-300 hover:bg-dark-lighter'}`}
            >
              Club
            </button>
            <button 
              onClick={() => setActiveCategory('user')}
              className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-sm ${activeCategory === 'user' ? 'bg-primary text-white' : 'bg-dark-light text-gray-300 hover:bg-dark-lighter'}`}
            >
              Usuario
            </button>
            <button 
              onClick={() => setActiveCategory('achievement')}
              className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-sm ${activeCategory === 'achievement' ? 'bg-primary text-white' : 'bg-dark-light text-gray-300 hover:bg-dark-lighter'}`}
            >
              Logros
            </button>
            <button 
              onClick={() => setActiveCategory('booster')}
              className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-sm ${activeCategory === 'booster' ? 'bg-primary text-white' : 'bg-dark-light text-gray-300 hover:bg-dark-lighter'}`}
            >
              Potenciadores
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map(product => (
            <div key={product.id} className="card overflow-hidden group">
              <div className="aspect-square bg-dark-lighter overflow-hidden relative">
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute top-3 left-3">
                  <span className={`
                    inline-block px-2 py-1 text-xs font-medium rounded-full
                    ${product.category === 'club' ? 'bg-neon-green/20 text-neon-green' : ''}
                    ${product.category === 'user' ? 'bg-neon-blue/20 text-neon-blue' : ''}
                    ${product.category === 'achievement' ? 'bg-neon-purple/20 text-neon-purple' : ''}
                    ${product.category === 'booster' ? 'bg-neon-red/20 text-neon-red' : ''}
                  `}>
                    {product.category === 'club' ? 'Club' :
                     product.category === 'user' ? 'Usuario' :
                     product.category === 'achievement' ? 'Logro' : 'Potenciador'}
                  </span>
                </div>
                <div className="absolute top-3 right-3">
                  <span className="inline-block bg-dark-light px-2 py-1 text-xs font-medium rounded-full">
                    Nivel {product.minLevel}+
                  </span>
                </div>
              </div>
              
              <div className="p-4">
                <h3 className="font-bold mb-2 group-hover:text-primary transition-colors">{product.name}</h3>
                <p className="text-sm text-gray-400 mb-4">{product.description}</p>
                
                <div className="flex items-center justify-between">
                  <div className="text-lg font-bold text-primary">
                    {formatCurrency(product.price).replace('€', '')} <span className="text-sm text-gray-400">Z-Coins</span>
                  </div>
                  <button className="btn-primary text-sm py-1 px-3">
                    Canjear
                  </button>
                </div>
              </div>
            </div>
          ))}
          
          {filteredItems.length === 0 && (
            <div className="col-span-full py-12 text-center text-gray-400">
              <AlertCircle size={48} className="mx-auto mb-4 text-gray-600" />
              <h3 className="text-xl font-bold mb-2">No se encontraron productos</h3>
              <p>No hay productos que coincidan con tu búsqueda. Prueba con otros términos o categorías.</p>
            </div>
          )}
        </div>
        
        <div className="mt-12">
          <div className="bg-dark-light border border-gray-800 rounded-lg p-6">
            <div className="flex items-start mb-6">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mr-4 flex-shrink-0">
                <AlertCircle size={24} className="text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Información importante</h3>
                <p className="text-gray-300">
                  Todos los productos en la tienda virtual se adquieren con Z-Coins, la moneda virtual de La Virtual Zone.
                  Los Z-Coins se obtienen participando en torneos, ganando partidos y siendo activo en la comunidad.
                  Los productos son elementos cosméticos y no afectan el rendimiento competitivo.
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-dark p-4 rounded-lg">
                <h4 className="font-bold mb-2">Cómo obtener Z-Coins</h4>
                <ul className="space-y-1 text-sm text-gray-300">
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-primary rounded-full mr-2"></span>
                    Ganar partidos: 50 Z-Coins
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-primary rounded-full mr-2"></span>
                    Participar en torneos: 200 Z-Coins
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-primary rounded-full mr-2"></span>
                    Subir de nivel: 100 Z-Coins
                  </li>
                </ul>
              </div>
              
              <div className="bg-dark p-4 rounded-lg">
                <h4 className="font-bold mb-2">Niveles de acceso</h4>
                <ul className="space-y-1 text-sm text-gray-300">
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-primary rounded-full mr-2"></span>
                    Nivel 1-5: Productos básicos
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-primary rounded-full mr-2"></span>
                    Nivel 6-15: Productos intermedios
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-primary rounded-full mr-2"></span>
                    Nivel 16+: Productos premium
                  </li>
                </ul>
              </div>
              
              <div className="bg-dark p-4 rounded-lg">
                <h4 className="font-bold mb-2">Uso de productos</h4>
                <ul className="space-y-1 text-sm text-gray-300">
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-primary rounded-full mr-2"></span>
                    Productos de club: visual de tu equipo
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-primary rounded-full mr-2"></span>
                    Productos de usuario: perfil personal
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-primary rounded-full mr-2"></span>
                    Potenciadores: límite de 1 por temporada
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Store;
 
import { Link } from 'react-router-dom';
import { Users, TrendingUp, Trophy } from 'lucide-react';

const HeroSection = () => {
  return (
    <div className="relative min-h-[80vh] flex items-center bg-gray-900 overflow-hidden">
      {/* Background image with overlay */}
      <div 
        className="absolute inset-0 z-0 bg-black"
        style={{
          backgroundImage: `linear-gradient(rgba(26, 26, 36, 0.4), rgba(17, 24, 39, 0.9)), url(https://images.unsplash.com/photo-1511447333015-45b65e60f6d5?w=1600&auto=format&fit=crop&fm=webp&ixid=M3w3MjUzNDh8MHwxfHNlYXJjaHw2fHxlc3BvcnRzJTIwZ2FtaW5nJTIwdG91cm5hbWVudCUyMGRhcmslMjBuZW9ufGVufDB8fHx8MTc0NzE3MzUxNHww&ixlib=rb-4.1.0)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        {/* Animated overlay */}
        <div className="absolute inset-0 animated-bg opacity-50"></div>
      </div>
      
      {/* Content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl">
          <div className="mb-4">
            <span className="inline-block text-primary border border-primary rounded-full px-3 py-1 text-sm font-medium">
              PES 2021 Season Update
            </span>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 font-display neon-text-blue">
            LA VIRTUAL ZONE
          </h1>
          
          <h2 className="text-2xl md:text-3xl font-medium mb-6 text-gray-100">
            La Premier League virtual del gaming competitivo
          </h2>
          
          <p className="text-gray-300 text-lg mb-8">
            Gestiona tu club en la Liga Master, ficha jugadores estrella, 
            compite en torneos, y conviértete en una leyenda del fútbol virtual.
          </p>
          
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <Link to="/registro" className="btn-primary">
              Crear Cuenta
            </Link>
            <Link to="/liga-master" className="btn-secondary">
              Explorar Liga Master
            </Link>
          </div>
          
          {/* Key features */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center">
              <div className="bg-gray-800 p-3 rounded-full mr-4">
                <Trophy size={24} className="text-neon-yellow" />
              </div>
              <div>
                <h3 className="font-bold">Torneos Oficiales</h3>
                <p className="text-gray-400">Liga, Copa y eventos especiales</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <div className="bg-gray-800 p-3 rounded-full mr-4">
                <TrendingUp size={24} className="text-neon-green" />
              </div>
              <div>
                <h3 className="font-bold">Mercado Dinámico</h3>
                <p className="text-gray-400">Ficha, vende y negocia jugadores</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <div className="bg-gray-800 p-3 rounded-full mr-4">
                <Users size={24} className="text-neon-blue" />
              </div>
              <div>
                <h3 className="font-bold">Comunidad Activa</h3>
                <p className="text-gray-400">Más de 10 clubes por temporada</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
 
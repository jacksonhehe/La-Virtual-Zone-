import  HeroSection from '../components/Home/HeroSection';
import LeagueStandings from '../components/Home/LeagueStandings';
import FeaturedTournaments from '../components/Home/FeaturedTournaments';
import LatestNews from '../components/Home/LatestNews';
import UpcomingMatches from '../components/Home/UpcomingMatches';
import { Link } from 'react-router-dom';
import { Users, ShoppingCart, Trophy, HelpCircle } from 'lucide-react';

const Home = () => {
  return (
    <div>
      <HeroSection />
      
      <div className="container mx-auto px-4 py-12 md:py-20">
        <FeaturedTournaments />
      </div>
      
      <div className="bg-dark py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold mb-6">Liga Master 2025</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="card p-6">
                  <h3 className="text-lg font-bold mb-4">Sobre la Liga</h3>
                  <p className="text-gray-300 mb-4">
                    La Liga Master es el núcleo de La Virtual Zone. Una competición cerrada con 10 clubes ficticios, cada uno dirigido por un usuario con rol de DT. Compite por el título, gestiona tu presupuesto y construye tu legado.
                  </p>
                  <Link to="/liga-master" className="btn-primary">
                    Explorar Liga Master
                  </Link>
                </div>
                
                <div className="card p-6">
                  <h3 className="text-lg font-bold mb-4">Mercado de Fichajes</h3>
                  <p className="text-gray-300 mb-4">
                    El mercado está abierto. Refuerza tu plantilla con nuevos talentos, vende jugadores para generar ingresos y compite por los mejores jugadores disponibles.
                  </p>
                  <div className="flex space-x-2">
                    <span className="inline-flex items-center px-2 py-1 rounded bg-green-500/20 text-green-400 text-xs">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                      Mercado Abierto
                    </span>
                    <span className="inline-flex items-center px-2 py-1 rounded bg-yellow-500/20 text-yellow-400 text-xs">
                      <span className="w-2 h-2 bg-yellow-500 rounded-full mr-1"></span>
                      20 Jugadores Disponibles
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <LatestNews />
                <UpcomingMatches />
              </div>
            </div>
            
            <div>
              <LeagueStandings />
              
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
                <Link to="/usuarios" className="card card-hover p-5 flex items-center">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 mr-4">
                    <Users size={20} />
                  </div>
                  <div>
                    <h3 className="font-medium">Comunidad</h3>
                    <p className="text-gray-400 text-sm">Explora perfiles de DTs y usuarios</p>
                  </div>
                </Link>
                
                <Link to="/tienda" className="card card-hover p-5 flex items-center">
                  <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 mr-4">
                    <ShoppingCart size={20} />
                  </div>
                  <div>
                    <h3 className="font-medium">Tienda</h3>
                    <p className="text-gray-400 text-sm">Personaliza tu club y perfil</p>
                  </div>
                </Link>
                
                <Link to="/torneos" className="card card-hover p-5 flex items-center">
                  <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-400 mr-4">
                    <Trophy size={20} />
                  </div>
                  <div>
                    <h3 className="font-medium">Torneos</h3>
                    <p className="text-gray-400 text-sm">Competiciones y eventos especiales</p>
                  </div>
                </Link>
                
                <Link to="/ayuda" className="card card-hover p-5 flex items-center">
                  <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 mr-4">
                    <HelpCircle size={20} />
                  </div>
                  <div>
                    <h3 className="font-medium">Centro de Ayuda</h3>
                    <p className="text-gray-400 text-sm">Preguntas frecuentes y soporte</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-12 md:py-20">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">¿Listo para comenzar tu carrera como DT?</h2>
          <p className="text-gray-300 mb-8">
            Regístrate para acceder a todas las funciones, solicitar un club y comenzar a competir en la Liga Master y torneos exclusivos.
          </p>
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-center">
            <Link to="/registro" className="btn-primary">
              Crear Cuenta
            </Link>
            <Link to="/ayuda" className="btn-secondary">
              Saber Más
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
 
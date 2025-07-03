import { Link } from 'react-router-dom';
import { 
  Trophy, 
  Mail, 
  HelpCircle, 
  Github, 
  Twitter, 
  Instagram, 
  Facebook 
} from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 border-t border-gray-800">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Link to="/" className="flex items-center mb-4">
              <div className="bg-primary h-8 w-8 rounded flex items-center justify-center mr-2">
                <Trophy size={20} className="text-white" />
              </div>
              <span className="text-white font-bold text-xl font-display">La Virtual Zone</span>
            </Link>
            <p className="text-gray-400 mb-4">
              La plataforma líder para torneos y ligas de PES 2021.
              Gestiona tu club, ficha jugadores, y compite en ligas y torneos.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://github.com/jacksonhehe/La-Virtual-Zone-"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white"
              >
                <Github size={20} />
              </a>
              <a
                href="https://twitter.com/lavirtualzone"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white"
              >
                <Twitter size={20} />
              </a>
              <a
                href="https://instagram.com/lavirtualzone"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white"
              >
                <Instagram size={20} />
              </a>
              <a
                href="https://facebook.com/lavirtualzone"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white"
              >
                <Facebook size={20} />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-white font-bold mb-4">Liga Master</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/liga-master" className="text-gray-400 hover:text-white">
                  Vista General
                </Link>
              </li>
              <li>
                <Link to="/liga-master/fixture" className="text-gray-400 hover:text-white">
                  Fixture y Resultados
                </Link>
              </li>
              <li>
                <Link to="/liga-master/rankings" className="text-gray-400 hover:text-white">
                  Rankings
                </Link>
              </li>
              <li>
                <Link to="/liga-master/hall-of-fame" className="text-gray-400 hover:text-white">
                  Hall of Fame
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-white font-bold mb-4">Navegar</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/torneos" className="text-gray-400 hover:text-white">
                  Torneos
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-gray-400 hover:text-white">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/galeria" className="text-gray-400 hover:text-white">
                  Galería
                </Link>
              </li>
              <li>
                <Link to="/tienda" className="text-gray-400 hover:text-white">
                  Tienda
                </Link>
              </li>
              <li>
                <Link to="/ayuda" className="text-gray-400 hover:text-white">
                  Ayuda
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-white font-bold mb-4">Contacto</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <Mail size={20} className="text-gray-400 mr-2 mt-1 flex-shrink-0" />
                <span className="text-gray-400">
                  support@lavirtualzone.com
                </span>
              </li>
              <li className="flex items-start">
                <HelpCircle size={20} className="text-gray-400 mr-2 mt-1 flex-shrink-0" />
                <span className="text-gray-400">
                  Soporte disponible: 9:00 - 21:00 (CET)
                </span>
              </li>
            </ul>
            
            <div className="mt-6">
              <Link to="/ayuda" className="btn-secondary text-sm">
                Centro de Ayuda
              </Link>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between">
          <p className="text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} La Virtual Zone. Todos los derechos reservados.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a
              href="/terminos"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white text-sm"
            >
              Términos de Servicio
            </a>
            <a
              href="/privacidad"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white text-sm"
            >
              Política de Privacidad
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
 
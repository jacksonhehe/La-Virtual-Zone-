import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <div className="max-w-md w-full text-center">
        <h1 className="text-6xl font-bold mb-6 text-primary">404</h1>
        <h2 className="text-2xl font-bold mb-4">Página no encontrada</h2>
        <p className="text-gray-400 mb-8">
          La página que buscas no existe o ha sido eliminada.
        </p>
        <Link
          to="/"
          className="btn-primary inline-flex items-center"
        >
          <Home size={18} className="mr-2" />
          <span>Volver al inicio</span>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
 
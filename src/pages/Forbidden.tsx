import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

const Forbidden = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-[#18181f] text-white p-6 text-center space-y-6">
    <AlertTriangle size={64} className="text-red-500" aria-label="Icono acceso denegado" />
    <h1 className="text-4xl font-bold">403 – Acceso denegado</h1>
    <p className="text-gray-400 max-w-md">No tienes permisos para acceder a esta página. Si crees que se trata de un error, contacta con un administrador.</p>
    <Link to="/" className="btn-primary" aria-label="Volver al inicio">Volver al inicio</Link>
  </div>
);

export default Forbidden; 
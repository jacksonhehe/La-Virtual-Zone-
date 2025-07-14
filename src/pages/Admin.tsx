import '../adminPanel/index.css';
import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import AdminApp from '../adminPanel/App';

export default function Admin() {
  const { user } = useContext(AuthContext);
  if (user?.role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }
  return <AdminApp />;
}

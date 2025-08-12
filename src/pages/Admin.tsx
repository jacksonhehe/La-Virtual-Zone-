import '../adminPanel/index.css';
import React from 'react';
import { AdminGuard } from '../components/guards/AdminGuard';
import AdminApp from '../adminPanel/App';

export default function Admin() {
  return (
    <AdminGuard>
      <AdminApp />
    </AdminGuard>
  );
}

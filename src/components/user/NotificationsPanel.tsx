import { useState, useEffect } from 'react';
import { Bell, Check, Trash2, Settings, X } from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  date: string;
  read: boolean;
}

/**
 * Panel de notificaciones para gestionar todas las notificaciones del usuario
 */
const NotificationsPanel = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [loading, setLoading] = useState(true);
  
  // Cargar notificaciones (simulado)
  useEffect(() => {
    // Simular carga de datos
    const timer = setTimeout(() => {
      // Datos de ejemplo
      const mockNotifications: Notification[] = [
        {
          id: '1',
          title: 'Nuevo logro desbloqueado',
          message: 'Has desbloqueado el logro "Primera Victoria"',
          type: 'success',
          date: '2025-07-20T10:30:00',
          read: false
        },
        {
          id: '2',
          title: 'Partido programado',
          message: 'Tu próximo partido contra Atlético Pixelado será mañana a las 20:00',
          type: 'info',
          date: '2025-07-19T15:45:00',
          read: true
        },
        {
          id: '3',
          title: 'Oferta de transferencia',
          message: 'Has recibido una oferta por tu jugador Carlos Píxel',
          type: 'warning',
          date: '2025-07-18T09:15:00',
          read: false
        },
        {
          id: '4',
          title: 'Error en transacción',
          message: 'No se pudo completar la compra del ítem "Escudo Premium"',
          type: 'error',
          date: '2025-07-17T14:20:00',
          read: true
        }
      ];
      
      setNotifications(mockNotifications);
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Filtrar notificaciones según el filtro seleccionado
  const filteredNotifications = filter === 'all' 
    ? notifications 
    : notifications.filter(n => !n.read);
  
  // Marcar como leída
  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };
  
  // Eliminar notificación
  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };
  
  // Marcar todas como leídas
  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    );
  };
  
  // Obtener el icono según el tipo de notificación
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-400"><Check size={20} /></div>;
      case 'warning':
        return <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-400"><Bell size={20} /></div>;
      case 'error':
        return <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center text-red-400"><X size={20} /></div>;
      default:
        return <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400"><Bell size={20} /></div>;
    }
  };
  
  // Formatear fecha
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'short', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="bg-dark-lighter/30 rounded-lg overflow-hidden">
      <div className="p-4 border-b border-gray-800 flex justify-between items-center">
        <h3 className="text-xl font-semibold flex items-center">
          <Bell size={20} className="mr-2 text-primary" />
          Notificaciones
          {filteredNotifications.filter(n => !n.read).length > 0 && (
            <span className="ml-2 px-2 py-0.5 text-xs bg-primary text-white rounded-full">
              {filteredNotifications.filter(n => !n.read).length}
            </span>
          )}
        </h3>
        <div className="flex items-center space-x-2">
          <button 
            className={`px-3 py-1 text-sm rounded-full transition-colors ${
              filter === 'all' 
                ? 'bg-primary/20 text-primary' 
                : 'text-gray-400 hover:text-white'
            }`}
            onClick={() => setFilter('all')}
          >
            Todas
          </button>
          <button 
            className={`px-3 py-1 text-sm rounded-full transition-colors ${
              filter === 'unread' 
                ? 'bg-primary/20 text-primary' 
                : 'text-gray-400 hover:text-white'
            }`}
            onClick={() => setFilter('unread')}
          >
            No leídas
          </button>
          <button 
            className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-gray-700/30 transition-colors"
            onClick={markAllAsRead}
            title="Marcar todas como leídas"
          >
            <Check size={16} />
          </button>
          <button 
            className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-gray-700/30 transition-colors"
            title="Configuración de notificaciones"
          >
            <Settings size={16} />
          </button>
        </div>
      </div>
      
      <div className="max-h-96 overflow-y-auto">
        {loading ? (
          <div className="p-4 space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-start space-x-4 animate-pulse">
                <div className="w-10 h-10 rounded-full bg-gray-700/70" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-700/70 rounded w-3/4" />
                  <div className="h-3 bg-gray-700/70 rounded w-full" />
                  <div className="h-3 bg-gray-700/70 rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredNotifications.length > 0 ? (
          <div className="divide-y divide-gray-800/50">
            {filteredNotifications.map(notification => (
              <div 
                key={notification.id} 
                className={`p-4 flex items-start hover:bg-dark/50 transition-colors ${
                  !notification.read ? 'bg-dark-lighter/50' : ''
                }`}
              >
                {getNotificationIcon(notification.type)}
                <div className="ml-4 flex-1">
                  <div className="flex justify-between items-start">
                    <h4 className={`font-medium ${!notification.read ? 'text-white' : 'text-gray-300'}`}>
                      {notification.title}
                    </h4>
                    <span className="text-xs text-gray-400">
                      {formatDate(notification.date)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mt-1">{notification.message}</p>
                  <div className="flex mt-2 space-x-2">
                    {!notification.read && (
                      <button 
                        className="text-xs text-primary hover:text-primary-light"
                        onClick={() => markAsRead(notification.id)}
                      >
                        Marcar como leída
                      </button>
                    )}
                    <button 
                      className="text-xs text-gray-400 hover:text-gray-300"
                      onClick={() => deleteNotification(notification.id)}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <Bell size={40} className="mx-auto mb-4 text-gray-500" />
            <p className="text-gray-400">No tienes notificaciones {filter === 'unread' ? 'no leídas' : ''}</p>
          </div>
        )}
      </div>
      
      <div className="p-3 border-t border-gray-800 bg-dark/30 flex justify-between items-center">
        <span className="text-xs text-gray-400">
          {notifications.length} notificaciones totales
        </span>
        <button className="text-xs text-primary hover:text-primary-light">
          Configurar preferencias
        </button>
      </div>
    </div>
  );
};

export default NotificationsPanel;
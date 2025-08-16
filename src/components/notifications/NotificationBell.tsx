import { useState, useRef, useEffect } from 'react';
import { Bell, X, Check, Trash2 } from 'lucide-react';
import { useNotificationStore, Notification } from '../../store/notificationStore';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import NotificationList from './NotificationList';

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotification } = useNotificationStore();

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    setIsOpen(false);
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'offer_received':
        return '💰';
      case 'offer_accepted':
        return '✅';
      case 'offer_rejected':
        return '❌';
      case 'offer_expired':
        return '⏰';
      case 'market_opened':
        return '🟢';
      case 'market_closed':
        return '🔴';
      default:
        return '📢';
    }
  };

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'offer_received':
        return 'border-blue-500/20 bg-blue-500/10';
      case 'offer_accepted':
        return 'border-green-500/20 bg-green-500/10';
      case 'offer_rejected':
        return 'border-red-500/20 bg-red-500/10';
      case 'offer_expired':
        return 'border-yellow-500/20 bg-yellow-500/10';
      case 'market_opened':
        return 'border-green-500/20 bg-green-500/10';
      case 'market_closed':
        return 'border-red-500/20 bg-red-500/10';
      default:
        return 'border-gray-500/20 bg-gray-500/10';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Botón de la campanita */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-400 hover:text-white transition-colors duration-200"
        aria-label="Notificaciones"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown de notificaciones */}
      {isOpen && (
        <NotificationList onClose={() => setIsOpen(false)} />
      )}
    </div>
  );
}


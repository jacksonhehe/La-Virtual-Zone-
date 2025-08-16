import { Bell, Trash2 } from 'lucide-react';
import { useNotificationStore } from '../../store/notificationStore';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface NotificationListProps {
  onClose?: () => void;
}

export default function NotificationList({ onClose }: NotificationListProps) {
  const { notifications, unreadCount, markAllAsRead, removeNotification } = useNotificationStore();

  return (
    <div className="absolute right-0 mt-2 w-80 bg-dark border border-white/10 rounded-xl shadow-2xl z-50 max-h-96 overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <h3 className="font-semibold text-white">Notificaciones</h3>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-xs text-primary hover:text-primary-light transition-colors"
            >
              Marcar todas como leídas
            </button>
          )}
          {onClose && (
            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">✕</button>
          )}
        </div>
      </div>
      <div className="max-h-80 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-6 text-center text-gray-400">
            <Bell size={24} className="mx-auto mb-2 opacity-50" />
            <p>No hay notificaciones</p>
          </div>
        ) : (
          <div className="divide-y divide-white/10">
            {notifications.map((n) => (
              <div key={n.id} className={`p-4 ${!n.read ? 'bg-white/5' : ''}`}>
                <div className="flex items-start gap-3">
                  <span className="text-lg">
                    {n.type === 'offer_received' ? '💰' :
                     n.type === 'offer_accepted' ? '✅' :
                     n.type === 'offer_rejected' ? '❌' :
                     n.type === 'offer_expired' ? '⏰' :
                     n.type === 'market_opened' ? '🟢' : '🔴'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className={`font-medium text-sm ${!n.read ? 'text-white' : 'text-gray-300'}`}>{n.title}</h4>
                      <button
                        onClick={() => removeNotification(n.id)}
                        className="text-gray-500 hover:text-red-400 transition-colors p-1"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                    <p className="text-xs text-gray-400 mt-1 line-clamp-2">{n.message}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      {formatDistanceToNow(new Date(n.timestamp), { addSuffix: true, locale: es })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

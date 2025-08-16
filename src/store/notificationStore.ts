import { create } from 'zustand';

export interface Notification {
  id: string;
  type: 'offer_received' | 'offer_accepted' | 'offer_rejected' | 'offer_expired' | 'market_opened' | 'market_closed';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  data?: {
    offerId?: string;
    playerName?: string;
    clubName?: string;
    amount?: number;
  };
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,

  addNotification: (notificationData) => {
    const newNotification: Notification = {
      ...notificationData,
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      read: false,
    };

    set((state) => {
      const updatedNotifications = [newNotification, ...state.notifications];
      const unreadCount = updatedNotifications.filter(n => !n.read).length;
      
      // Mantener solo las últimas 50 notificaciones
      if (updatedNotifications.length > 50) {
        updatedNotifications.splice(50);
      }
      
      return {
        notifications: updatedNotifications,
        unreadCount,
      };
    });

    // Persistir en localStorage
    const { notifications } = get();
    localStorage.setItem('vz_notifications', JSON.stringify(notifications));
  },

  markAsRead: (id: string) => {
    set((state) => {
      const updatedNotifications = state.notifications.map(n =>
        n.id === id ? { ...n, read: true } : n
      );
      const unreadCount = updatedNotifications.filter(n => !n.read).length;
      
      return {
        notifications: updatedNotifications,
        unreadCount,
      };
    });

    // Persistir en localStorage
    const { notifications } = get();
    localStorage.setItem('vz_notifications', JSON.stringify(notifications));
  },

  markAllAsRead: () => {
    set((state) => {
      const updatedNotifications = state.notifications.map(n => ({ ...n, read: true }));
      
      return {
        notifications: updatedNotifications,
        unreadCount: 0,
      };
    });

    // Persistir en localStorage
    const { notifications } = get();
    localStorage.setItem('vz_notifications', JSON.stringify(notifications));
  },

  removeNotification: (id: string) => {
    set((state) => {
      const updatedNotifications = state.notifications.filter(n => n.id !== id);
      const unreadCount = updatedNotifications.filter(n => !n.read).length;
      
      return {
        notifications: updatedNotifications,
        unreadCount,
      };
    });

    // Persistir en localStorage
    const { notifications } = get();
    localStorage.setItem('vz_notifications', JSON.stringify(notifications));
  },

  clearAll: () => {
    set({
      notifications: [],
      unreadCount: 0,
    });
    
    localStorage.removeItem('vz_notifications');
  },
}));

// Cargar notificaciones del localStorage al inicializar
const loadStoredNotifications = () => {
  try {
    const stored = localStorage.getItem('vz_notifications');
    if (stored) {
      const notifications = JSON.parse(stored);
      const unreadCount = notifications.filter((n: Notification) => !n.read).length;
      
      useNotificationStore.setState({
        notifications,
        unreadCount,
      });
    }
  } catch (error) {
    console.warn('Error loading notifications from localStorage:', error);
  }
};

// Cargar notificaciones al inicializar
if (typeof window !== 'undefined') {
  loadStoredNotifications();
}

// Función helper para crear notificaciones comunes
export const createNotification = {
  offerReceived: (playerName: string, clubName: string, amount: number) => {
    useNotificationStore.getState().addNotification({
      type: 'offer_received',
      title: 'Nueva oferta recibida',
      message: `${clubName} ha ofertado ${amount.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })} por ${playerName}`,
      data: { playerName, clubName, amount },
    });
  },

  offerAccepted: (playerName: string, clubName: string, amount: number) => {
    useNotificationStore.getState().addNotification({
      type: 'offer_accepted',
      title: 'Oferta aceptada',
      message: `Tu oferta por ${playerName} ha sido aceptada por ${clubName}`,
      data: { playerName, clubName, amount },
    });
  },

  offerRejected: (playerName: string, clubName: string, amount: number) => {
    useNotificationStore.getState().addNotification({
      type: 'offer_rejected',
      title: 'Oferta rechazada',
      message: `Tu oferta por ${playerName} ha sido rechazada por ${clubName}`,
      data: { playerName, clubName, amount },
    });
  },

  offerExpired: (playerName: string, clubName: string) => {
    useNotificationStore.getState().addNotification({
      type: 'offer_expired',
      title: 'Oferta expirada',
      message: `Tu oferta por ${playerName} ha expirado`,
      data: { playerName, clubName },
    });
  },

  marketOpened: () => {
    useNotificationStore.getState().addNotification({
      type: 'market_opened',
      title: 'Mercado abierto',
      message: 'El mercado de fichajes está ahora abierto',
    });
  },

  marketClosed: () => {
    useNotificationStore.getState().addNotification({
      type: 'market_closed',
      title: 'Mercado cerrado',
      message: 'El mercado de fichajes ha sido cerrado',
    });
  },
};


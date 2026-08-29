export interface NotificationItem {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

type NotificationListener = (notifications: NotificationItem[]) => void;

class NotificationManager {
  private notifications: NotificationItem[] = [];
  private listeners: Set<NotificationListener> = new Set();

  notify(title: string, message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') {
    const item: NotificationItem = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      type,
      title,
      message,
      timestamp: new Date().toISOString(),
      read: false
    };

    this.notifications = [item, ...this.notifications.slice(0, 49)];
    this.broadcast();
  }

  getNotifications(): NotificationItem[] {
    return this.notifications;
  }

  markAllAsRead() {
    this.notifications = this.notifications.map(n => ({ ...n, read: true }));
    this.broadcast();
  }

  subscribe(listener: NotificationListener): () => void {
    this.listeners.add(listener);
    listener(this.notifications);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private broadcast() {
    this.listeners.forEach(l => l(this.notifications));
  }
}

export const notificationService = new NotificationManager();

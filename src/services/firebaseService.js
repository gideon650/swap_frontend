import { messaging } from '../firebase/firebase-config';
import { getToken, onMessage } from 'firebase/messaging';
import axios from 'axios';

class FirebaseService {
  constructor() {
    this.vapidKey = process.env.REACT_APP_FIREBASE_VAPID_KEY;
  }

  // Request notification permission
  async requestPermission() {
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        if (process.env.NODE_ENV !== 'production') {
          console.log('Notification permission granted.');
        }
        return true;
      } else {
        if (process.env.NODE_ENV !== 'production') {
          console.log('Notification permission denied.');
        }
        return false;
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  // Get FCM token
  async getFCMToken() {
    try {
      const token = await getToken(messaging, {
        vapidKey: this.vapidKey
      });
      if (token) {
        if (process.env.NODE_ENV !== 'production') {
          console.log('FCM Token obtained successfully');
        }
        return token;
      } else {
        if (process.env.NODE_ENV !== 'production') {
          console.log('No registration token available.');
        }
        return null;
      }
    } catch (error) {
      console.error('An error occurred while retrieving token:', error);
      return null;
    }
  }

  // Register FCM token with backend
  async registerTokenWithBackend(token) {
    try {
      const authToken = localStorage.getItem('token');
      if (!authToken) {
        console.error('No auth token found');
        return false;
      }

      await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/fcm/register/`,
        {
          token: token,
          device_type: 'web'
        },
        {
          headers: {
            'Authorization': `Token ${authToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (process.env.NODE_ENV !== 'production') {
        console.log('Token registered with backend successfully');
      }
      return true;
    } catch (error) {
      console.error('Error registering token with backend:', error);
      return false;
    }
  }

  // Unregister FCM token from backend
  async unregisterTokenFromBackend(token) {
    try {
      const authToken = localStorage.getItem('token');
      if (!authToken) {
        console.error('No auth token found');
        return false;
      }

      await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/fcm/unregister/`,
        {
          token: token
        },
        {
          headers: {
            'Authorization': `Token ${authToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (process.env.NODE_ENV !== 'production') {
        console.log('Token unregistered from backend successfully');
      }
      return true;
    } catch (error) {
      console.error('Error unregistering token from backend:', error);
      return false;
    }
  }

  // Initialize FCM
  async initializeFCM() {
    try {
      // Request permission
      const permissionGranted = await this.requestPermission();
      if (!permissionGranted) {
        return false;
      }

      // Get FCM token
      const token = await this.getFCMToken();
      if (!token) {
        return false;
      }

      // Register token with backend
      const registered = await this.registerTokenWithBackend(token);
      if (!registered) {
        return false;
      }

      // Store token locally
      localStorage.setItem('fcm_token', token);

      // Set up foreground message handler
      this.setupForegroundMessageHandler();

      return true;
    } catch (error) {
      console.error('Error initializing FCM:', error);
      return false;
    }
  }

  // Setup foreground message handler
  setupForegroundMessageHandler() {
    onMessage(messaging, (payload) => {
      if (process.env.NODE_ENV !== 'production') {
        console.log('Message received in foreground:', payload);
      }
      // Show notification when app is in foreground
      this.showForegroundNotification(payload);
    });
  }

  // Show notification when app is in foreground
  showForegroundNotification(payload) {
    const { title, body } = payload.notification || {};
    const data = payload.data || {};
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.showNotification(title || 'Notification', {
          body: body || 'You have a new notification',
          icon: '/firebase-logo.png',
          badge: '/badge-icon.png',
          data: data,
          actions: this.getNotificationActions(data),
          tag: data.type || 'general',
          requireInteraction: data.type === 'deposit_approval' || data.type === 'withdrawal_confirmation'
        });
      });
    }
  }

  // Get notification actions based on type
  getNotificationActions(data) {
    const actions = [];
    if (data.type === 'deposit_approval') {
      actions.push(
        { action: 'approve', title: 'Approve' },
        { action: 'decline', title: 'Decline' }
      );
    } else if (data.type === 'withdrawal_confirmation') {
      actions.push(
        { action: 'confirm', title: 'Confirm' },
        { action: 'decline', title: 'Decline' }
      );
    }

    actions.push({ action: 'view', title: 'View' });

    return actions;
  }

  // Cleanup FCM token
  async cleanup() {
    try {
      const token = localStorage.getItem('fcm_token');
      if (token) {
        await this.unregisterTokenFromBackend(token);
        localStorage.removeItem('fcm_token');
      }
    } catch (error) {
      console.error('Error during FCM cleanup:', error);
    }
  }
}

const firebaseServiceInstance = new FirebaseService();
export default firebaseServiceInstance;
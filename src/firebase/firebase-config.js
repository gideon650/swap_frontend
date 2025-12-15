import { initializeApp } from 'firebase/app';
import { getMessaging } from 'firebase/messaging';

// Firebase configuration - NO hardcoded values
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

// Validate configuration
const validateConfig = (config) => {
  const requiredFields = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
  const missingFields = requiredFields.filter(field => !config[field]);
  
  if (missingFields.length > 0) {
    console.error('Missing Firebase configuration fields:', missingFields);
    throw new Error(`Missing Firebase configuration: ${missingFields.join(', ')}`);
  }
  
  if (process.env.NODE_ENV !== 'production') {
    console.log('Firebase configuration validated successfully');
  }
  return true;
};

// Validate before initializing
validateConfig(firebaseConfig);

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Cloud Messaging and get a reference to the service
let messaging = null;

try {
  messaging = getMessaging(app);
  if (process.env.NODE_ENV !== 'production') {
    console.log('Firebase messaging initialized successfully');
  }
} catch (error) {
  console.error('Error initializing Firebase messaging:', error);
}

export { messaging, firebaseConfig };
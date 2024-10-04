import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

console.log('Initializing Firebase with config:', {
  ...firebaseConfig,
  apiKey: firebaseConfig.apiKey ? '[REDACTED]' : undefined,
});

const app = initializeApp(firebaseConfig);
console.log('Firebase app initialized successfully.');

export const db = getFirestore(app);
console.log('Firestore initialized successfully.');

export const auth = getAuth(app);
console.log('Auth initialized successfully.');

export { firebaseConfig };
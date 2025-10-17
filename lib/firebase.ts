import type { FirebaseApp, FirebaseOptions } from 'firebase/app';
import { getApp, getApps, initializeApp } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import { GoogleAuthProvider, getAuth } from 'firebase/auth';
import type { Messaging } from 'firebase/messaging';
import { getMessaging, isSupported } from 'firebase/messaging';
import type { Firestore } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const REQUIRED_CONFIG_KEYS: (keyof FirebaseOptions)[] = [
  'apiKey',
  'authDomain',
  'projectId',
  'storageBucket',
  'messagingSenderId',
  'appId',
];

const isConfigComplete = REQUIRED_CONFIG_KEYS.every(key => {
  const value = firebaseConfig[key];
  return typeof value === 'string' && value.trim().length > 0;
});

let cachedApp: FirebaseApp | undefined;
let messagingPromise: Promise<Messaging | undefined> | null = null;

export const firebaseClientConfig = firebaseConfig;
export const isFirebaseConfigured = isConfigComplete;
export const firebaseVapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export const googleAuthProvider = googleProvider;

function initializeFirebaseApp(): FirebaseApp | undefined {
  if (!isFirebaseConfigured) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('Firebase environment variables are not fully configured.');
    }
    return undefined;
  }

  if (cachedApp) {
    return cachedApp;
  }

  try {
    const apps = getApps();
    cachedApp = apps.length > 0 ? getApp() : initializeApp(firebaseConfig);
  } catch (error) {
    console.error('Failed to initialize Firebase app', error);
    cachedApp = undefined;
  }

  return cachedApp;
}

export function getFirebaseApp(): FirebaseApp | undefined {
  return initializeFirebaseApp();
}

export function getFirebaseAuth(): Auth | undefined {
  const app = initializeFirebaseApp();
  if (!app) {
    return undefined;
  }

  try {
    return getAuth(app);
  } catch (error) {
    console.error('Failed to initialize Firebase auth', error);
    return undefined;
  }
}

export function getFirebaseFirestore(): Firestore | undefined {
  const app = initializeFirebaseApp();
  if (!app) {
    return undefined;
  }

  try {
    return getFirestore(app);
  } catch (error) {
    console.error('Failed to initialize Firebase firestore', error);
    return undefined;
  }
}

export function getFirebaseMessaging(): Promise<Messaging | undefined> {
  if (messagingPromise) {
    return messagingPromise;
  }

  messagingPromise = (async () => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const app = initializeFirebaseApp();
    if (!app) {
      return undefined;
    }

    const supported = await isSupported().catch(() => false);
    if (!supported) {
      return undefined;
    }

    try {
      return getMessaging(app);
    } catch (error) {
      console.error('Failed to initialize Firebase messaging', error);
      return undefined;
    }
  })();

  return messagingPromise;
}

import { initializeApp, getApps, getApp } from 'firebase/app';
import type { FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithRedirect, 
  getRedirectResult,
  signOut, 
  onAuthStateChanged
} from 'firebase/auth';
import type { User, Auth } from 'firebase/auth';
import { 
  getFirestore, 
  Firestore, 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager 
} from 'firebase/firestore';

export interface FirebaseConfigType {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId: string;
}

export function getStoredFirebaseConfig(): FirebaseConfigType | null {
  try {
    const raw = localStorage.getItem('eva_firebase_config');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.apiKey && parsed.projectId) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed reading custom firebase config', e);
  }

  const envConfig: FirebaseConfigType = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
  };

  if (envConfig.apiKey && envConfig.projectId) {
    return envConfig;
  }

  return null;
}

export function saveStoredFirebaseConfig(config: FirebaseConfigType): void {
  localStorage.setItem('eva_firebase_config', JSON.stringify(config));
  window.location.reload();
}

export function removeStoredFirebaseConfig(): void {
  localStorage.removeItem('eva_firebase_config');
  window.location.reload();
}

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

const config = getStoredFirebaseConfig();

if (config && config.apiKey && config.projectId) {
  try {
    if (!getApps().length) {
      app = initializeApp(config);
      db = initializeFirestore(app, {
        localCache: persistentLocalCache({
          tabManager: persistentMultipleTabManager()
        })
      });
    } else {
      app = getApp();
      db = getFirestore(app);
    }
    auth = getAuth(app);
  } catch (err) {
    console.warn('Firebase initialization error, fallback to memory', err);
    if (app) {
      db = getFirestore(app);
      auth = getAuth(app);
    }
  }
}

export { app, auth, db };

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export async function loginWithGoogle(): Promise<User | null> {
  if (!auth) {
    throw new Error('Firebase не настроен. Пожалуйста, укажите конфигурацию Firebase в настройках.');
  }

  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    if (error.code === 'auth/popup-blocked' || error.code === 'auth/cancelled-popup-request') {
      console.log('Popup blocked, attempting signInWithRedirect...');
      await signInWithRedirect(auth, googleProvider);
      return null;
    }
    throw error;
  }
}

export async function checkRedirectAuth(): Promise<User | null> {
  if (!auth) return null;
  try {
    const result = await getRedirectResult(auth);
    return result?.user || null;
  } catch (err) {
    console.error('Redirect auth error', err);
    return null;
  }
}

export async function logoutUser(): Promise<void> {
  if (!auth) return;
  await signOut(auth);
}

export function subscribeToAuth(callback: (user: User | null) => void): () => void {
  if (!auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}

export function isFirebaseConfigured(): boolean {
  return Boolean(config && config.apiKey && config.projectId);
}

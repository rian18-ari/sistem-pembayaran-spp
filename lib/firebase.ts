import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore, setLogLevel } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import configJson from '../firebase-applet-config.json';

// Suppress internal gRPC idle stream disconnection info logs from polluting the console
try {
  setLogLevel('error');
} catch {
  // ignore in environments where setLogLevel might already be configured
}

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || configJson.apiKey,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || configJson.authDomain,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || configJson.projectId,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || configJson.storageBucket,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || configJson.messagingSenderId,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || configJson.appId,
};

const app: FirebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const firestoreDatabaseId = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_ID || configJson.firestoreDatabaseId;

export const db: Firestore = firestoreDatabaseId && firestoreDatabaseId !== '(default)'
  ? getFirestore(app, firestoreDatabaseId)
  : getFirestore(app);

export const auth: Auth = getAuth(app);
export default app;

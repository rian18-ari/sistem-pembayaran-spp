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
  apiKey: configJson.apiKey,
  authDomain: configJson.authDomain,
  projectId: configJson.projectId,
  storageBucket: configJson.storageBucket,
  messagingSenderId: configJson.messagingSenderId,
  appId: configJson.appId,
};

const app: FirebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const db: Firestore = configJson.firestoreDatabaseId && configJson.firestoreDatabaseId !== '(default)'
  ? getFirestore(app, configJson.firestoreDatabaseId)
  : getFirestore(app);

export const auth: Auth = getAuth(app);
export default app;

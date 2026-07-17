import { getApp, getApps, initializeApp } from 'firebase/app';
import {
  browserLocalPersistence,
  getAuth,
  GoogleAuthProvider,
  setPersistence,
} from 'firebase/auth';
import { publicConfig } from '../config/publicConfig';

const app = getApps().length
  ? getApp()
  : initializeApp(publicConfig.firebase);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

void setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error('Gagal mengaktifkan persistence Firebase:', error);
});

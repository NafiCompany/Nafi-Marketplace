import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKeyRaw = process.env.FIREBASE_PRIVATE_KEY;

if (!projectId || !clientEmail || !privateKeyRaw) {
  console.warn('Firebase Admin belum dikonfigurasi lengkap. Endpoint autentikasi akan gagal sampai secret diisi.');
}

const app = getApps().length
  ? getApps()[0]
  : initializeApp({
      credential: cert({
        projectId: projectId || 'missing-project-id',
        clientEmail: clientEmail || 'missing@example.com',
        privateKey: (privateKeyRaw || 'missing').replace(/\\n/g, '\n'),
      }),
    });

export const adminAuth = getAuth(app);

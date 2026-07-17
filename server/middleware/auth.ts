import type { NextFunction, Request, Response } from 'express';
import { adminAuth } from '../lib/firebaseAdmin';
import { supabaseAdmin } from '../lib/supabaseAdmin';

export type AuthenticatedRequest = Request & {
  authUser?: { uid: string; email: string | null; name: string | null; picture: string | null; role: 'customer' | 'admin' };
};

export async function optionalAuth(req: AuthenticatedRequest, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return next();
  try {
    const decoded = await adminAuth.verifyIdToken(header.slice(7));
    const adminUids = (process.env.ADMIN_FIREBASE_UIDS || '').split(',').map((v)=>v.trim()).filter(Boolean);
    req.authUser = {
      uid: decoded.uid,
      email: decoded.email || null,
      name: decoded.name || null,
      picture: decoded.picture || null,
      role: adminUids.includes(decoded.uid) ? 'admin' : 'customer',
    };
  } catch {
    // Anonymous use is allowed on routes using optionalAuth.
  }
  next();
}

export async function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return res.status(401).json({ message: 'Silakan login terlebih dahulu.' });
  try {
    const decoded = await adminAuth.verifyIdToken(header.slice(7));
    const adminUids = (process.env.ADMIN_FIREBASE_UIDS || '').split(',').map((v)=>v.trim()).filter(Boolean);
    const role: 'customer' | 'admin' = adminUids.includes(decoded.uid) ? 'admin' : 'customer';
    req.authUser = { uid: decoded.uid, email: decoded.email || null, name: decoded.name || null, picture: decoded.picture || null, role };
    next();
  } catch {
    return res.status(401).json({ message: 'Sesi login tidak valid. Silakan masuk kembali.' });
  }
}

export async function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  await requireAuth(req, res, async () => {
    if (req.authUser?.role !== 'admin') return res.status(403).json({ message: 'Akses admin diperlukan.' });
    next();
  });
}

export async function upsertProfile(user: NonNullable<AuthenticatedRequest['authUser']>) {
  const { data, error } = await supabaseAdmin.from('profiles').upsert({
    firebase_uid: user.uid,
    email: user.email,
    full_name: user.name,
    avatar_url: user.picture,
    role: user.role,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'firebase_uid' }).select('firebase_uid,email,full_name,avatar_url,role').single();
  if (error) throw error;
  return data;
}

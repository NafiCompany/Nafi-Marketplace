import { Router } from 'express';
import type { AuthenticatedRequest } from '../middleware/auth';
import { requireAuth, upsertProfile } from '../middleware/auth';

export const authRouter = Router();

authRouter.post('/bootstrap', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const profile = await upsertProfile(req.authUser!);
    res.json({ success: true, profile });
  } catch (error) {
    console.error('Bootstrap profile failed:', error);
    res.status(500).json({ message: 'Profil pengguna gagal disiapkan.' });
  }
});

authRouter.get('/profile', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const profile = await upsertProfile(req.authUser!);
    res.json({ data: profile });
  } catch {
    res.status(500).json({ message: 'Profil gagal dimuat.' });
  }
});

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type User,
} from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { api } from '../services/api';
import type { Profile } from '../types';

type AuthContextValue = {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  register: (name: string, email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function bootstrapUser(user: User): Promise<Profile> {
  const token = await user.getIdToken(false);
  const response = await fetch('/api/auth/bootstrap', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({}),
  });

  const raw = await response.text();
  let data: { success?: boolean; profile?: Profile; message?: string } = {};
  try {
    data = JSON.parse(raw) as typeof data;
  } catch {
    throw new Error('Server autentikasi belum tersambung dengan benar.');
  }

  if (!response.ok || !data.success || !data.profile) {
    throw new Error(data.message || 'Gagal menyiapkan akun.');
  }

  return data.profile;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
      setUser(nextUser);
      if (!nextUser) {
        setProfile(null);
        setLoading(false);
        return;
      }

      try {
        const nextProfile = await bootstrapUser(nextUser);
        setProfile(nextProfile);
      } catch (error) {
        console.error(error);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const refreshProfile = async () => {
    if (!auth.currentUser) return;
    const nextProfile = await api.get<Profile>('/api/account/profile');
    setProfile(nextProfile);
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      profile,
      loading,
      register: async (name, email, password) => {
        const credential = await createUserWithEmailAndPassword(
          auth,
          email,
          password,
        );
        await updateProfile(credential.user, { displayName: name });
        const nextProfile = await bootstrapUser(credential.user);
        setProfile(nextProfile);
      },
      login: async (email, password) => {
        const credential = await signInWithEmailAndPassword(
          auth,
          email,
          password,
        );
        const nextProfile = await bootstrapUser(credential.user);
        setProfile(nextProfile);
      },
      loginWithGoogle: async () => {
        const credential = await signInWithPopup(auth, googleProvider);
        const nextProfile = await bootstrapUser(credential.user);
        setProfile(nextProfile);
      },
      logout: async () => {
        await signOut(auth);
      },
      resetPassword: async (email) => {
        await sendPasswordResetEmail(auth, email);
      },
      refreshProfile,
    }),
    [loading, profile, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth harus dipakai di dalam AuthProvider.');
  return value;
}

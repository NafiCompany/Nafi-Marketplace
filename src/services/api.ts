import { auth } from '../lib/firebase';

type ApiOptions = RequestInit & {
  auth?: boolean;
};

async function request<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const headers = new Headers(options.headers);
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }

  if (options.auth !== false) {
    const user = auth.currentUser;
    if (!user) throw new Error('Silakan login terlebih dahulu.');
    const token = await user.getIdToken(false);
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(path, { ...options, headers });
  const raw = await response.text();
  let parsed: unknown = null;

  if (raw) {
    try {
      parsed = JSON.parse(raw);
    } catch {
      throw new Error('Server mengembalikan respons yang tidak valid.');
    }
  }

  const body = parsed as { message?: string; data?: T } | T;
  if (!response.ok) {
    const message =
      typeof body === 'object' && body && 'message' in body
        ? String((body as { message?: string }).message || 'Permintaan gagal.')
        : 'Permintaan gagal.';
    throw new Error(message);
  }

  if (typeof body === 'object' && body && 'data' in body) {
    return (body as { data: T }).data;
  }
  return body as T;
}

export const api = {
  get: <T>(path: string, authRequired = true) =>
    request<T>(path, { method: 'GET', auth: authRequired }),
  post: <T>(path: string, body?: unknown, authRequired = true) =>
    request<T>(path, {
      method: 'POST',
      body: body === undefined ? undefined : JSON.stringify(body),
      auth: authRequired,
    }),
  patch: <T>(path: string, body?: unknown, authRequired = true) =>
    request<T>(path, {
      method: 'PATCH',
      body: body === undefined ? undefined : JSON.stringify(body),
      auth: authRequired,
    }),
  delete: <T>(path: string, authRequired = true) =>
    request<T>(path, { method: 'DELETE', auth: authRequired }),
};

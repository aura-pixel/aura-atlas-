import 'server-only';
import { cookies } from 'next/headers';
import { backendUrl, requireSession } from './server-auth';

export async function get<T>(path: string): Promise<T> {
  await requireSession(true);
  const session = (await cookies()).get('atlas_session');
  const response = await fetch(`${backendUrl()}${path}`, {
    headers: { Cookie: `atlas_session=${encodeURIComponent(session?.value || '')}` },
    cache: 'no-store',
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) throw new Error('No se pudo cargar el recurso.');
  return response.json() as Promise<T>;
}

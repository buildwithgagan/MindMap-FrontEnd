export type AppEnv = 'development' | 'staging' | 'production';

function normalizeAppEnv(value: string | undefined | null): AppEnv | null {
  const v = (value || '').trim().toLowerCase();
  if (v === 'development' || v === 'staging' || v === 'production') return v;
  return null;
}

/**
 * Single source of truth for "which environment is this build running in?"
 *
 * NOTE: Next.js `NODE_ENV` is NOT a 3-way environment flag; it is typically just
 * `development` vs `production`. We use `NEXT_PUBLIC_APP_ENV` for 3-way envs.
 */
export const appEnv: AppEnv =
  normalizeAppEnv(process.env.NEXT_PUBLIC_APP_ENV) ??
  (process.env.NODE_ENV === 'development' ? 'development' : 'production');

export const isDev = appEnv === 'development';
export const isStaging = appEnv === 'staging';
export const isProd = appEnv === 'production';

export type ChatTransport = 'socket' | 'polling' | 'rest_only';

export const config = {
  appEnv,
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000',
  wsBaseUrl:
    process.env.NEXT_PUBLIC_WS_BASE_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    'http://localhost:3000',
  chatTransport: ((): ChatTransport => {
    if (isDev) return 'socket';
    if (isStaging) return 'polling';
    return 'rest_only';
  })(),
} as const;



import 'server-only'

// Centralized environment variable access. Importing this module forces a
// validation pass at module load — missing required vars throw immediately
// with a clear message instead of producing cryptic Supabase errors at the
// first DB call.
//
// IMPORTANT: This module is server-only. Do not import it from client
// components. NEXT_PUBLIC_* values that need to be readable on the client
// should still be referenced as `process.env.NEXT_PUBLIC_*` in those files
// (Next.js inlines them at build time).

function required(name: string): string {
  const value = process.env[name]
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(
      `Missing required environment variable: ${name}. ` +
      `See .env.example for the full list of variables this app needs to run.`
    )
  }
  return value
}

function optional(name: string): string | undefined {
  const value = process.env[name]
  return typeof value === 'string' && value.trim() !== '' ? value : undefined
}

export const env = {
  // Supabase project URL.
  SUPABASE_URL: required('SUPABASE_URL'),

  // Supabase anon (public) key — read-only, safe to use in user-facing
  // auth flows. Subject to RLS.
  SUPABASE_ANON_KEY: required('SUPABASE_ANON_KEY'),

  // Supabase service role key — bypasses RLS. NEVER expose to the browser.
  // Only used by server actions and the admin client.
  SUPABASE_KEY: required('SUPABASE_KEY'),

  // Email of the bootstrap super-admin. Optional, but if missing the only
  // way to grant admin access is by inserting directly into the app_admins
  // table. Surfaced as `undefined` rather than throwing so dev environments
  // without an admin can still boot.
  ADMIN_EMAIL: optional('ADMIN_EMAIL'),

  // Public site URL used for password-reset / OAuth redirect callbacks.
  // Trailing slash stripped once at boot so callers can concat paths.
  // Falls back to localhost in development.
  SITE_URL: (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, ''),
} as const

// One-off password reset via Supabase service role.
// Usage: node --env-file=.env.local scripts/reset-password.mjs <email> <newPassword>

import { createClient } from '@supabase/supabase-js'

const [, , email, newPassword] = process.argv
if (!email || !newPassword) {
  console.error('Usage: node --env-file=.env.local scripts/reset-password.mjs <email> <newPassword>')
  process.exit(1)
}

const url = process.env.SUPABASE_URL
const key = process.env.SUPABASE_KEY
if (!url || !key) {
  console.error('Missing SUPABASE_URL or SUPABASE_KEY in env')
  process.exit(1)
}

const admin = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })

// Find user by email (listUsers is paginated; this app has one user, first page is enough)
const { data: list, error: listErr } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 })
if (listErr) { console.error('listUsers failed:', listErr.message); process.exit(1) }

const user = list.users.find(u => u.email?.toLowerCase() === email.toLowerCase())
if (!user) { console.error(`No user found with email: ${email}`); process.exit(1) }

const { error: updErr } = await admin.auth.admin.updateUserById(user.id, { password: newPassword })
if (updErr) { console.error('updateUserById failed:', updErr.message); process.exit(1) }

console.log(`✓ Password updated for ${email} (id: ${user.id})`)

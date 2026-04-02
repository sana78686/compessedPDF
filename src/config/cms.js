/**
 * Laravel CMS public API — one place for how this React app reaches the backend.
 *
 * Env files live next to `package.json` / `vite.config.js` (project root), not under `src/`:
 *   `.env`              — local dev (optional)
 *   `.env.local`        — overrides, gitignored
 *   `.env.production`   — used when you run `npm run build` (live API + domain)
 *
 * Repo layout: `src/` = this React app; `app.apimstec.com/` = Laravel CMS + admin UI.
 */

export function normalizeSiteDomain(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/:\d+$/, '')
    .split('/')[0]
}

const API_FALLBACK_DEV = 'http://localhost:8000'
const API_FALLBACK_PROD = 'https://app.apimstec.com'

/** Base URL of Laravel (no trailing slash). Same as VITE_API_URL when set. */
export const CMS_API_BASE = String(
  import.meta.env.VITE_API_URL ||
    (import.meta.env.DEV ? API_FALLBACK_DEV : API_FALLBACK_PROD),
).replace(/\/$/, '')

/**
 * Fallback site host when `window` is unavailable (e.g. Vite SEO inject at build).
 * In the browser, API URLs use `window.location.hostname` so one build serves every domain.
 * Must match CMS → Domains → `domain` for the tenant DB.
 */
export const CMS_SITE_DOMAIN = normalizeSiteDomain(
  import.meta.env.VITE_SITE_DOMAIN || 'compresspdf.id',
)

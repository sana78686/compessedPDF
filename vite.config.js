import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

function normalizeSiteDomain(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/:\d+$/, '')
    .split('/')[0]
}

/** Inject modulepreload for entry script so browser starts loading it earlier (LCP) */
function modulepreloadPlugin() {
  return {
    name: 'modulepreload',
    transformIndexHtml: {
      order: 'post',
      handler(html) {
        const match = html.match(/<script[^>]+type\s*=\s*["']module["'][^>]+src\s*=\s*["']([^"']+)["']/i)
        if (!match) return html
        const src = match[1].replace(/^\//, '')
        const link = `    <link rel="modulepreload" href="/${src}" />`
        return html.replace('</head>', `${link}\n  </head>`)
      },
    },
  }
}

/**
 * Fetches home-page SEO from the CMS and bakes it into index.html so
 * non-JS crawlers (Facebook, Twitter, Bing, etc.) see the real meta tags.
 * Works in both dev (cached after first fetch) and build modes.
 * React's SeoHead still overrides these at runtime for regular users.
 */
function cmsSeoInjectPlugin(viteEnv) {
  // Cache only during a build run (single pass). In dev mode we always fetch
  // fresh data so changes saved in the CMS are visible on the next page reload
  // without restarting the dev server.
  let buildCache = null

  return {
    name: 'cms-seo-inject',
    transformIndexHtml: {
      order: 'pre',
      async handler(html, ctx) {
        const SITE_NAME = 'Compress PDF'
        const DEFAULT_OG_IMAGE = 'https://compresspdf.id/logos/compresspdf.png'

        // ctx.server is only defined when running the Vite dev server.
        const isDevServer = !!ctx?.server

        try {
          // In dev: fetch fresh on every page load (no cache).
          // In build: fetch once and reuse (buildCache).
          let data = isDevServer ? null : buildCache

          if (!data) {
            const apiBase = (
              viteEnv.VITE_API_URL ||
              (isDevServer ? 'http://localhost:8000' : 'https://app.apimstec.com')
            ).replace(/\/$/, '')
            const siteDomain = normalizeSiteDomain(viteEnv.VITE_SITE_DOMAIN || 'compresspdf.id')
            const res = await fetch(`${apiBase}/${siteDomain}/api/public/home-content`, {
              headers: {
                Accept: 'application/json',
              },
            })
            if (!res.ok) throw new Error(`HTTP ${res.status}`)
            data = await res.json()
            if (!isDevServer) buildCache = data  // cache only for build pass
          }

          const esc = (s) =>
            String(s ?? '')
              .replace(/&/g, '&amp;')
              .replace(/"/g, '&quot;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')

          const rawTitle  = data.meta_title      || SITE_NAME
          const title     = rawTitle === SITE_NAME ? SITE_NAME : `${rawTitle} | ${SITE_NAME}`
          const desc      = data.meta_description || ''
          const keywords  = data.meta_keywords    || ''
          const ogTitle   = data.og_title         || rawTitle
          const ogDesc    = data.og_description   || desc
          const ogImage   = data.og_image         || DEFAULT_OG_IMAGE
          const robots    = data.meta_robots      || 'index,follow'
          const canonical = data.canonical_url    || ''

          // Update <title> and the existing robots meta in-place (avoid duplicates)
          let out = html
            .replace(/<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`)
            .replace(
              /<meta name="robots" content="[^"]*" \/>/,
              `<meta name="robots" content="${esc(robots)}" />`,
            )

          // Inject remaining tags before </head>
          const tags = [
            desc      && `    <meta name="description" content="${esc(desc)}" />`,
            keywords  && `    <meta name="keywords" content="${esc(keywords)}" />`,
            canonical && `    <link rel="canonical" href="${esc(canonical)}" />`,
            `    <meta property="og:title" content="${esc(ogTitle)}" />`,
            ogDesc    && `    <meta property="og:description" content="${esc(ogDesc)}" />`,
            `    <meta property="og:image" content="${esc(ogImage)}" />`,
            `    <meta name="twitter:title" content="${esc(ogTitle)}" />`,
            ogDesc    && `    <meta name="twitter:description" content="${esc(ogDesc)}" />`,
            `    <meta name="twitter:image" content="${esc(ogImage)}" />`,
          ].filter(Boolean).join('\n')

          out = out.replace('</head>', `${tags}\n  </head>`)
          console.log('[cms-seo-inject] Home SEO injected from CMS ✓')
          return out
        } catch (e) {
          console.warn(`[cms-seo-inject] Could not fetch CMS SEO — keeping static fallbacks (${e.message})`)
          return html
        }
      },
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const viteEnv = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react(), cmsSeoInjectPlugin(viteEnv), modulepreloadPlugin()],
    server: {
      port: 5000,
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            if (id.includes('node_modules')) {
              if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) return 'vendor'
              return 'vendor-misc'
            }
          },
        },
      },
    },
  }
})

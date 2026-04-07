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

function encodePathSegments(rel) {
  return String(rel || '')
    .replace(/^\/+/, '')
    .split('/')
    .filter(Boolean)
    .map((p) => encodeURIComponent(p))
    .join('/')
}

/** Meta URLs in static HTML: site images use the public frontend origin (/uploads → proxied to CMS). */
function absoluteUrlForBuild(href, apiOrigin, siteOrigin) {
  const s = String(href ?? '').trim()
  if (!s) return ''
  if (/^https?:\/\//i.test(s)) return s
  if (s.startsWith('//')) return `https:${s}`
  const api = String(apiOrigin).replace(/\/$/, '')
  const site = String(siteOrigin).replace(/\/$/, '')
  if (s.startsWith('/storage/')) {
    const tail = s.replace(/^\/storage\//, '')
    return `${site}/${encodePathSegments(tail)}`
  }
  if (s.startsWith('/media/')) {
    return `${api}${s}`
  }
  if (s.startsWith('/')) {
    return `${site}${s}`
  }
  return s
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

          const apiBase = (
            viteEnv.VITE_API_URL ||
            (isDevServer ? 'http://localhost:3000' : 'https://app.apimstec.com')
          ).replace(/\/$/, '')
          const siteDomain = normalizeSiteDomain(
            viteEnv.VITE_SITE_DOMAIN || (isDevServer ? 'compresspdf.local' : 'compresspdf.id'),
          )

          if (!data) {
            const useDomainPath = viteEnv.VITE_API_DOMAIN_PATH !== 'false'
            // Baked into index.html for crawlers without JS. Set VITE_BUILD_SEO_LOCALE to match the CMS home content you want in the initial HTML (e.g. en, id).
            const buildSeoLocale = String(viteEnv.VITE_BUILD_SEO_LOCALE || 'en').trim().toLowerCase() || 'en'
            const homeQuery = `?locale=${encodeURIComponent(buildSeoLocale)}`
            const tryUrls = useDomainPath
              ? [
                  { url: `${apiBase}/${siteDomain}/api/public/home-content${homeQuery}`, headers: { Accept: 'application/json' } },
                  { url: `${apiBase}/api/public/home-content${homeQuery}`, headers: { Accept: 'application/json', 'X-Domain': siteDomain } },
                ]
              : [
                  { url: `${apiBase}/api/public/home-content${homeQuery}`, headers: { Accept: 'application/json', 'X-Domain': siteDomain } },
                ]
            let res = null
            for (let u = 0; u < tryUrls.length; u++) {
              const { url, headers } = tryUrls[u]
              res = await fetch(url, { headers })
              if (res.ok) break
              const retry =
                useDomainPath &&
                u === 0 &&
                tryUrls.length > 1 &&
                (res.status === 404 || res.status === 403)
              if (!retry) break
            }
            if (!res || !res.ok) throw new Error(`HTTP ${res?.status ?? '?'}`)
            data = await res.json()
            if (!isDevServer) buildCache = data  // cache only for build pass
          }

          let apiOrigin = 'https://app.apimstec.com'
          try {
            apiOrigin = new URL(apiBase).origin
          } catch {
            /* keep default */
          }
          const siteOrigin = siteDomain.includes('localhost') || siteDomain === '127.0.0.1'
            ? `http://${siteDomain}`
            : `https://${siteDomain}`

          const esc = (s) =>
            String(s ?? '')
              .replace(/&/g, '&amp;')
              .replace(/"/g, '&quot;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')

          const rawTitle  = data.meta_title      || SITE_NAME
          const title     = rawTitle.trim() ? rawTitle.trim() : SITE_NAME
          const desc      = data.meta_description || ''
          const keywords  = data.meta_keywords    || ''
          const ogTitle   = data.og_title         || rawTitle
          const ogDesc    = data.og_description   || desc
          const ogImageRaw = (data.og_image && String(data.og_image).trim()) || DEFAULT_OG_IMAGE
          const ogImage = absoluteUrlForBuild(ogImageRaw, apiOrigin, siteOrigin)
          const robots    = data.meta_robots      || 'index,follow'
          const canonicalRaw = data.canonical_url ? String(data.canonical_url).trim() : ''
          const canonical = canonicalRaw ? absoluteUrlForBuild(canonicalRaw, apiOrigin, siteOrigin) : ''
          const headSnippet = String(data.head_snippet || '').trim()
          const gaIdRaw = String(data.ga_measurement_id || viteEnv.VITE_GA_MEASUREMENT_ID || '').trim()
          const gaIdOk = /^G-[A-Z0-9]+$/i.test(gaIdRaw)
          // If the CMS already has a custom head HTML block, use it only (avoids two different GA IDs).
          const injectGaBuild =
            !headSnippet && gaIdOk
              ? `\n    <script async src="https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaIdRaw)}"></script>\n    <script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${gaIdRaw.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}');</script>\n`
              : ''
          const injectSnippetBuild = headSnippet ? `\n${headSnippet}\n` : ''

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

          out = out.replace(
            '</head>',
            `${tags}${injectSnippetBuild}${injectGaBuild}\n  </head>`,
          )
          console.log('[cms-seo-inject] Home SEO + head snippet injected from CMS ✓')
          return out
        } catch (e) {
          console.warn(`[cms-seo-inject] Could not fetch CMS SEO — keeping static fallbacks (${e.message})`)
          return html
        }
      },
    },
  }
}

/**
 * After production build, download sitemap.xml + robots.txt from CMS (per-domain routes)
 * into dist/ so the static host can serve them at the site root (same domain as the React app).
 */
function fetchSeoStaticPlugin(viteEnv) {
  return {
    name: 'fetch-seo-static',
    apply: 'build',
    async closeBundle() {
      if (String(viteEnv.VITE_FETCH_SEO_FILES || 'true').toLowerCase() === 'false') {
        return
      }
      const fs = await import('node:fs')
      const path = await import('node:path')
      const distDir = path.resolve(process.cwd(), 'dist')
      if (!fs.existsSync(distDir)) {
        return
      }
      const apiBase = (viteEnv.VITE_API_URL || 'https://app.apimstec.com').replace(/\/$/, '')
      const siteDomain = normalizeSiteDomain(viteEnv.VITE_SITE_DOMAIN || 'compresspdf.id')
      const files = [
        [`${apiBase}/${siteDomain}/sitemap.xml`, 'sitemap.xml'],
        [`${apiBase}/${siteDomain}/robots.txt`, 'robots.txt'],
      ]
      for (const [url, name] of files) {
        try {
          const res = await fetch(url, { headers: { Accept: '*/*' } })
          if (!res.ok) {
            console.warn(`[fetch-seo-static] ${name}: HTTP ${res.status} (${url})`)
            continue
          }
          fs.writeFileSync(path.join(distDir, name), Buffer.from(await res.arrayBuffer()))
          console.log(`[fetch-seo-static] Wrote dist/${name} from CMS ✓`)
        } catch (e) {
          console.warn(`[fetch-seo-static] ${name}: ${e?.message || e}`)
        }
      }
    },
  }
}

/**
 * Bake public CMS JSON into dist/cms-prefetch.json (per locale). At runtime, prepareCmsClient()
 * loads it when its revision matches GET /content-revision so first paint avoids many API calls.
 */
function cmsPrefetchPlugin(viteEnv) {
  return {
    name: 'cms-prefetch',
    apply: 'build',
    async closeBundle() {
      if (String(viteEnv.VITE_CMS_PREFETCH ?? 'true').toLowerCase() === 'false') {
        return
      }
      const fs = await import('node:fs')
      const path = await import('node:path')
      const distDir = path.resolve(process.cwd(), 'dist')
      if (!fs.existsSync(distDir)) {
        return
      }
      const apiBase = (viteEnv.VITE_API_URL || 'https://app.apimstec.com').replace(/\/$/, '')
      const siteDomain = normalizeSiteDomain(viteEnv.VITE_SITE_DOMAIN || 'compresspdf.id')
      const useDomainPath = viteEnv.VITE_API_DOMAIN_PATH !== 'false'

      function withLocale(p, locale) {
        if (!locale) return p
        const joiner = p.includes('?') ? '&' : '?'
        return `${p}${joiner}locale=${encodeURIComponent(locale)}`
      }

      async function fetchPublicJson(apiPath, locale) {
        const rel = withLocale(apiPath, locale)
        const tryUrls = useDomainPath
          ? [
              { url: `${apiBase}/${siteDomain}/api/public${rel}`, headers: { Accept: 'application/json' } },
              { url: `${apiBase}/api/public${rel}`, headers: { Accept: 'application/json', 'X-Domain': siteDomain } },
            ]
          : [{ url: `${apiBase}/api/public${rel}`, headers: { Accept: 'application/json', 'X-Domain': siteDomain } }]
        for (let u = 0; u < tryUrls.length; u++) {
          const { url, headers } = tryUrls[u]
          const res = await fetch(url, { headers })
          if (res.ok) {
            return res.json()
          }
          const retry =
            useDomainPath &&
            u === 0 &&
            tryUrls.length > 1 &&
            (res.status === 404 || res.status === 403)
          if (retry) {
            continue
          }
          const data = await res.json().catch(() => ({}))
          throw new Error(data.message || `HTTP ${res.status}`)
        }
        throw new Error('Public API request failed')
      }

      let revision = 0
      try {
        const revDoc = await fetchPublicJson('/content-revision', '')
        revision = Number(revDoc?.revision ?? 0)
      } catch (e) {
        console.warn(`[cms-prefetch] content-revision: ${e?.message || e} — skipping cms-prefetch.json`)
        return
      }

      const localesStr = String(viteEnv.VITE_CMS_PREFETCH_LOCALES || 'en,id').trim()
      const locales = localesStr.split(/[\s,]+/).filter(Boolean)
      const paths = ['/home-content', '/faq', '/pages', '/blogs', '/home-cards', '/legal-nav', '/contact']
      const bundle = { revision, locales: {} }

      for (const locale of locales) {
        bundle.locales[locale] = {}
        for (const p of paths) {
          try {
            bundle.locales[locale][p] = await fetchPublicJson(p, locale)
          } catch (e) {
            console.warn(`[cms-prefetch] ${p} (${locale}): ${e?.message || e}`)
          }
        }
      }

      fs.writeFileSync(path.join(distDir, 'cms-prefetch.json'), JSON.stringify(bundle))
      console.log('[cms-prefetch] Wrote dist/cms-prefetch.json ✓')
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const viteEnv = loadEnv(mode, process.cwd(), '')
  const cmsDev = (viteEnv.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '')
  return {
    plugins: [
      react(),
      cmsSeoInjectPlugin(viteEnv),
      modulepreloadPlugin(),
      fetchSeoStaticPlugin(viteEnv),
      cmsPrefetchPlugin(viteEnv),
    ],
    server: {
      host: '127.0.0.1',
      port: 2000,
      strictPort: true,
      proxy: {
        // Local dev: /uploads/... on the React port → Laravel /storage/... (matches production nginx)
        '/uploads': {
          target: cmsDev,
          changeOrigin: true,
          rewrite: (p) => p.replace(/^\/uploads/, '/storage'),
        },
      },
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

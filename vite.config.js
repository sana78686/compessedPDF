import { readFileSync } from 'node:fs'
import { resolve as pathResolve } from 'node:path'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

function readPackageVersion() {
  try {
    const raw = readFileSync(pathResolve(process.cwd(), 'package.json'), 'utf-8')
    return String(JSON.parse(raw).version || '').trim()
  } catch {
    return ''
  }
}

/** Bust browser/CDN caches for favicon after replacing assets (uses VITE_FAVICON_VERSION or package version). */
function faviconCacheBustPlugin(viteEnv) {
  const explicit = String(viteEnv.VITE_FAVICON_VERSION || '').trim()
  const v = explicit || readPackageVersion() || String(Date.now())
  const q = `?v=${encodeURIComponent(v)}`
  return {
    name: 'favicon-cache-bust',
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        return html
          .replace(/href="\/favicon\.svg"/, `href="/favicon.svg${q}"`)
          .replace(/href="\/favicon\.png"/, `href="/favicon.png${q}"`)
          .replace(/href="\/logos\/compresspdf-favicon\.png"/, `href="/favicon.png${q}"`)
      },
    },
  }
}

function normalizeSiteDomain(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/:\d+$/, '')
    .split('/')[0]
}

/** Public marketing origin for sitemap &lt;loc&gt; URLs (https://example.com — no trailing slash). */
function siteOriginFromEnv(viteEnv) {
  const explicit = String(viteEnv.VITE_PUBLIC_SITE_ORIGIN || '').trim().replace(/\/+$/, '')
  if (explicit) return explicit
  const d = normalizeSiteDomain(viteEnv.VITE_SITE_DOMAIN || 'compresspdf.id')
  if (d === 'localhost' || d === '127.0.0.1') return `http://${d}`
  return `https://${d}`
}

function localesForSitemapFallback(viteEnv) {
  const s = String(viteEnv.VITE_CMS_PREFETCH_LOCALES || 'id,en,ms,es,fr,ar,ru').trim()
  const list = s.split(/[\s,]+/).filter(Boolean)
  return list.length ? list : ['id', 'en']
}

function xmlEscape(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/"/g, '&quot;')
}

/** Minimal valid sitemap when CMS download fails (avoids SPA index.html being served as “sitemap”). */
function buildFallbackSitemapXml(origin, locales) {
  const lastmod = new Date().toISOString().slice(0, 10)
  const lines = locales.map(
    (loc) =>
      `  <url>\n    <loc>${xmlEscape(`${origin}/${loc}/`)}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>1.0</priority>\n  </url>`,
  )
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${lines.join('\n')}\n</urlset>\n`
}

function buildFallbackRobotsTxt(origin) {
  return `User-agent: *\nAllow: /\n\nSitemap: ${origin}/sitemap.xml\n`
}

function encodePathSegments(rel) {
  return String(rel || '')
    .replace(/^\/+/, '')
    .split('/')
    .filter(Boolean)
    .map((p) => encodeURIComponent(p))
    .join('/')
}

function escapeHtmlAttr(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
}

/** Origin from VITE_API_URL for dns-prefetch / preconnect (no path). */
function originFromApiUrl(viteEnv) {
  const raw = String(viteEnv.VITE_API_URL || '').trim()
  if (!raw) return ''
  try {
    const u = new URL(/^[a-z]+:\/\//i.test(raw) ? raw : `https://${raw}`)
    return u.origin
  } catch {
    return ''
  }
}

/**
 * Injects first-party shell hints from env: API + site origins, optional flag CDN, theme-color,
 * default robots / og:type / twitter:card, and <html lang>. Home SEO from cms-seo-inject still overrides
 * robots (and adds title/description/OG) when the CMS fetch succeeds.
 */
function indexShellHeadPlugin(viteEnv) {
  return {
    name: 'index-shell-head',
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        const apiOrigin = originFromApiUrl(viteEnv)
        const siteOrigin = siteOriginFromEnv(viteEnv)
        const rawLang = String(viteEnv.VITE_HTML_LANG || viteEnv.VITE_BUILD_SEO_LOCALE || 'en').trim()
        const htmlLang =
          rawLang.split(/[-_]/)[0].replace(/[^a-z]/gi, '').toLowerCase() || 'en'
        const themeColor = String(
          viteEnv.VITE_PUBLIC_THEME_COLOR || viteEnv.VITE_THEME_COLOR || '#ffffff',
        ).trim()
        const robotsDefault = String(viteEnv.VITE_INDEX_ROBOTS || 'index, follow').trim()
        const ogType = String(viteEnv.VITE_INDEX_OG_TYPE || 'website').trim()
        const twitterCard = String(viteEnv.VITE_INDEX_TWITTER_CARD || 'summary_large_image').trim()

        let flagOrigin = String(viteEnv.VITE_FLAG_CDN_ORIGIN ?? 'https://flagcdn.com').trim()
        if (flagOrigin === '0' || flagOrigin.toLowerCase() === 'false') {
          flagOrigin = ''
        } else if (flagOrigin !== '') {
          try {
            flagOrigin = new URL(/^[a-z]+:\/\//i.test(flagOrigin) ? flagOrigin : `https://${flagOrigin}`).origin
          } catch {
            flagOrigin = 'https://flagcdn.com'
          }
        }

        const lines = [
          '    <!-- Shell head: Vite env + optional extras (see .env.example). cms-seo-inject may override robots/meta for home. -->',
        ]
        if (apiOrigin) {
          lines.push(`    <link rel="dns-prefetch" href="${escapeHtmlAttr(apiOrigin)}" />`)
          lines.push(`    <link rel="preconnect" href="${escapeHtmlAttr(apiOrigin)}" crossorigin />`)
        }
        if (siteOrigin && siteOrigin !== apiOrigin) {
          lines.push(`    <link rel="dns-prefetch" href="${escapeHtmlAttr(siteOrigin)}" />`)
          lines.push(`    <link rel="preconnect" href="${escapeHtmlAttr(siteOrigin)}" crossorigin />`)
        }
        const prefetchCmsJson = String(viteEnv.VITE_INDEX_PREFETCH_CMS_JSON ?? 'true').toLowerCase() !== 'false'
        if (prefetchCmsJson) {
          const pathBase = String(viteEnv.VITE_INDEX_ASSET_BASE ?? viteEnv.VITE_BASE ?? '/').trim() || '/'
          const b = pathBase.endsWith('/') ? pathBase : `${pathBase}/`
          const prefetchPath = `${b}cms-prefetch.json`.replace(/\/{2,}/g, '/')
          lines.push(
            `    <link rel="prefetch" href="${escapeHtmlAttr(prefetchPath)}" as="fetch" type="application/json" />`,
          )
        }
        if (flagOrigin) {
          lines.push(`    <link rel="preconnect" href="${escapeHtmlAttr(flagOrigin)}" crossorigin />`)
          lines.push(`    <link rel="dns-prefetch" href="${escapeHtmlAttr(flagOrigin)}" />`)
        }
        const extras = String(viteEnv.VITE_EXTRA_PRECONNECT || '')
          .split(/[\s,]+/)
          .map((s) => s.trim())
          .filter(Boolean)
        for (const e of extras) {
          try {
            const o = new URL(/^[a-z]+:\/\//i.test(e) ? e : `https://${e}`).origin
            lines.push(`    <link rel="dns-prefetch" href="${escapeHtmlAttr(o)}" />`)
            lines.push(`    <link rel="preconnect" href="${escapeHtmlAttr(o)}" crossorigin />`)
          } catch {
            /* skip invalid */
          }
        }
        lines.push(`    <meta name="theme-color" content="${escapeHtmlAttr(themeColor)}" />`)
        lines.push(
          '    <!-- SEO: SPA shell; route-level meta from React. Build injects home meta from CMS when VITE_BUILD_SEO_LOCALE is set. -->',
        )
        lines.push(`    <meta name="robots" content="${escapeHtmlAttr(robotsDefault)}" />`)
        lines.push(`    <meta property="og:type" content="${escapeHtmlAttr(ogType)}" />`)
        lines.push(`    <meta name="twitter:card" content="${escapeHtmlAttr(twitterCard)}" />`)

        const block = lines.join('\n')
        const marker = /<!--\s*@vite-index-shell-head@\s*-->/i
        let out = html
        if (marker.test(out)) {
          out = out.replace(marker, block)
        } else {
          out = out.replace('<title>', `${block}\n    <title>`)
        }
        out = out.replace(/<html\s+lang="[^"]*"/i, `<html lang="${escapeHtmlAttr(htmlLang)}"`)
        return out
      },
    },
  }
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
        const SITE_NAME = String(viteEnv.VITE_PUBLIC_SITE_NAME || '').trim()

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

          const rawTitle = String(data.meta_title ?? '').trim()
          const title = rawTitle
          const desc = String(data.meta_description ?? '').trim()
          const keywords = String(data.meta_keywords ?? '').trim()
          const ogTitleRaw = String(data.og_title ?? '').trim()
          const ogTitle = ogTitleRaw || rawTitle
          const ogDescRaw = String(data.og_description ?? '').trim()
          const ogDesc = ogDescRaw || desc
          const ogImageRaw = data.og_image && String(data.og_image).trim()
          const ogImage = ogImageRaw ? absoluteUrlForBuild(ogImageRaw, apiOrigin, siteOrigin) : ''
          const robots = String(data.meta_robots ?? '').trim() || 'index,follow'
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
            title && `    <meta name="title" content="${esc(title)}" />`,
            desc && `    <meta name="description" content="${esc(desc)}" />`,
            keywords && `    <meta name="keywords" content="${esc(keywords)}" />`,
            canonical && `    <link rel="canonical" href="${esc(canonical)}" />`,
            ogTitle && `    <meta property="og:title" content="${esc(ogTitle)}" />`,
            ogDesc && `    <meta property="og:description" content="${esc(ogDesc)}" />`,
            ogImage && `    <meta property="og:image" content="${esc(ogImage)}" />`,
            SITE_NAME && `    <meta property="og:site_name" content="${esc(SITE_NAME)}" />`,
            ogTitle && `    <meta name="twitter:title" content="${esc(ogTitle)}" />`,
            ogDesc && `    <meta name="twitter:description" content="${esc(ogDesc)}" />`,
            ogImage && `    <meta name="twitter:image" content="${esc(ogImage)}" />`,
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
      const siteOrigin = siteOriginFromEnv(viteEnv)
      const locales = localesForSitemapFallback(viteEnv)

      async function tryWriteFromCms(url, name) {
        const res = await fetch(url, {
          headers: {
            Accept: name === 'sitemap.xml' ? 'application/xml,text/xml,*/*' : '*/*',
            'User-Agent': 'compressedPDF-react-build/fetch-seo-static',
          },
        })
        if (!res.ok) {
          return false
        }
        const buf = Buffer.from(await res.arrayBuffer())
        const head = buf.slice(0, 80).toString('utf8').trimStart()
        if (name === 'sitemap.xml' && /<!doctype html|<html[\s>]/i.test(head)) {
          console.warn(`[fetch-seo-static] ${name}: response looks like HTML, not XML (${url})`)
          return false
        }
        fs.writeFileSync(path.join(distDir, name), buf)
        console.log(`[fetch-seo-static] Wrote dist/${name} from CMS ✓`)
        return true
      }

      const sitemapUrl = `${apiBase}/${siteDomain}/sitemap.xml`
      let sitemapOk = false
      try {
        sitemapOk = await tryWriteFromCms(sitemapUrl, 'sitemap.xml')
      } catch (e) {
        console.warn(`[fetch-seo-static] sitemap.xml: ${e?.message || e} (${sitemapUrl})`)
      }
      if (!sitemapOk) {
        console.warn(`[fetch-seo-static] sitemap.xml: CMS fetch failed or non-XML (${sitemapUrl})`)
        const xml = buildFallbackSitemapXml(siteOrigin, locales)
        fs.writeFileSync(path.join(distDir, 'sitemap.xml'), xml, 'utf8')
        console.warn(
          '[fetch-seo-static] Wrote dist/sitemap.xml minimal fallback (locale home URLs only). Prefer fixing CMS/WAF access and re-building, or proxy /sitemap.xml to the CMS in nginx.',
        )
      }

      const robotsUrl = `${apiBase}/${siteDomain}/robots.txt`
      let robotsOk = false
      try {
        robotsOk = await tryWriteFromCms(robotsUrl, 'robots.txt')
      } catch (e) {
        console.warn(`[fetch-seo-static] robots.txt: ${e?.message || e} (${robotsUrl})`)
      }
      if (!robotsOk) {
        fs.writeFileSync(path.join(distDir, 'robots.txt'), buildFallbackRobotsTxt(siteOrigin), 'utf8')
        console.warn(
          '[fetch-seo-static] robots.txt: CMS fetch failed — wrote minimal file with Sitemap line.',
        )
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
      const paths = ['/home-content', '/faq', '/pages', '/blogs', '/home-cards', '/sections', '/legal-nav', '/contact']
      const bundle = { revision, locales: {} }

      const prefetchLegalBodies =
        String(viteEnv.VITE_CMS_PREFETCH_LEGAL ?? 'true').toLowerCase() !== 'false'
      const detailMode = String(viteEnv.VITE_CMS_PREFETCH_DETAIL || '').trim().toLowerCase()
      const maxPageDetails = Math.min(
        200,
        Math.max(0, Number.parseInt(String(viteEnv.VITE_CMS_PREFETCH_MAX_PAGES ?? '100'), 10) || 100),
      )
      const maxBlogDetails = Math.min(
        200,
        Math.max(0, Number.parseInt(String(viteEnv.VITE_CMS_PREFETCH_MAX_BLOGS ?? '100'), 10) || 100),
      )

      for (const locale of locales) {
        bundle.locales[locale] = {}
        for (const p of paths) {
          try {
            bundle.locales[locale][p] = await fetchPublicJson(p, locale)
          } catch (e) {
            console.warn(`[cms-prefetch] ${p} (${locale}): ${e?.message || e}`)
          }
        }

        const loc = bundle.locales[locale]

        if (prefetchLegalBodies && loc['/legal-nav']?.legal && typeof loc['/legal-nav'].legal === 'object') {
          for (const [slug, hasBody] of Object.entries(loc['/legal-nav'].legal)) {
            if (!hasBody) continue
            const lp = `/legal/${slug}`
            if (loc[lp] !== undefined) continue
            try {
              loc[lp] = await fetchPublicJson(lp, locale)
            } catch (e) {
              console.warn(`[cms-prefetch] ${lp} (${locale}): ${e?.message || e}`)
            }
          }
        }

        if (detailMode === 'pages' || detailMode === 'all') {
          const pagesRes = loc['/pages']
          const pageList = Array.isArray(pagesRes?.pages) ? pagesRes.pages : []
          for (let i = 0; i < Math.min(pageList.length, maxPageDetails); i += 1) {
            const slug = pageList[i]?.slug
            if (!slug) continue
            const pp = `/pages/${encodeURIComponent(String(slug))}`
            if (loc[pp] !== undefined) continue
            try {
              loc[pp] = await fetchPublicJson(pp, locale)
            } catch (e) {
              console.warn(`[cms-prefetch] ${pp} (${locale}): ${e?.message || e}`)
            }
          }
        }

        if (detailMode === 'blogs' || detailMode === 'all') {
          const blogsRes = loc['/blogs']
          const rawBlogs = blogsRes?.blogs ?? blogsRes?.data ?? blogsRes
          const blogList = Array.isArray(rawBlogs) ? rawBlogs : []
          for (let i = 0; i < Math.min(blogList.length, maxBlogDetails); i += 1) {
            const slug = blogList[i]?.slug
            if (!slug) continue
            const bp = `/blogs/${encodeURIComponent(String(slug))}`
            if (loc[bp] !== undefined) continue
            try {
              loc[bp] = await fetchPublicJson(bp, locale)
            } catch (e) {
              console.warn(`[cms-prefetch] ${bp} (${locale}): ${e?.message || e}`)
            }
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
      faviconCacheBustPlugin(viteEnv),
      indexShellHeadPlugin(viteEnv),
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

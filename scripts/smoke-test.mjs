#!/usr/bin/env node

import { access, readFile } from 'node:fs/promises'

const defaultBaseUrl = process.env.SMOKE_BASE_URL || 'http://localhost:3000'
const repoRoot = new URL('../', import.meta.url)

function parseArgs(argv) {
  const options = {
    baseUrl: defaultBaseUrl,
    timeoutMs: Number(process.env.SMOKE_TIMEOUT_MS || 10000),
    json: false,
  }

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]

    if (arg === '--base-url') {
      options.baseUrl = argv[index + 1]
      index += 1
      continue
    }

    if (arg.startsWith('--base-url=')) {
      options.baseUrl = arg.slice('--base-url='.length)
      continue
    }

    if (arg === '--timeout-ms') {
      options.timeoutMs = Number(argv[index + 1])
      index += 1
      continue
    }

    if (arg.startsWith('--timeout-ms=')) {
      options.timeoutMs = Number(arg.slice('--timeout-ms='.length))
      continue
    }

    if (arg === '--json') {
      options.json = true
      continue
    }

    if (arg === '--help' || arg === '-h') {
      printHelp()
      process.exit(0)
    }

    throw new Error(`Unknown argument: ${arg}`)
  }

  if (!options.baseUrl) {
    throw new Error('Missing base URL')
  }

  if (!Number.isInteger(options.timeoutMs) || options.timeoutMs < 1000) {
    throw new Error('--timeout-ms must be an integer >= 1000')
  }

  return options
}

function printHelp() {
  console.log(`Usage: npm run smoke -- --base-url https://dopameme.kr

Options:
  --base-url <url>     Base URL to test. Defaults to SMOKE_BASE_URL or http://localhost:3000
  --timeout-ms <ms>    Per-request timeout. Defaults to SMOKE_TIMEOUT_MS or 10000
  --json               Print machine-readable JSON output
`)
}

function normalizeBaseUrl(baseUrl) {
  const url = new URL(baseUrl)
  url.pathname = url.pathname.replace(/\/+$/, '')
  url.search = ''
  url.hash = ''
  return url.toString().replace(/\/+$/, '')
}

function buildUrl(baseUrl, path) {
  return new URL(path, `${baseUrl}/`).toString()
}

function isHtmlResponse(response) {
  return response.headers.get('content-type')?.includes('text/html')
}

function isJsonResponse(response) {
  const contentType = response.headers.get('content-type') || ''
  return contentType.includes('application/json') || contentType.includes('application/manifest+json')
}

function isTextResponse(response) {
  return response.headers.get('content-type')?.includes('text/plain')
}

function locationMatches(response, expectedLocation) {
  const location = response.headers.get('location')
  if (!location) return false

  if (location === expectedLocation) return true

  try {
    return new URL(location).pathname === expectedLocation
  } catch {
    return false
  }
}

async function readJson(response) {
  const text = await response.text()
  if (!text) return null

  try {
    return JSON.parse(text)
  } catch {
    throw new Error(`Response body is not valid JSON: ${text.slice(0, 120)}`)
  }
}

async function readText(response) {
  return response.text()
}

const checks = [
  {
    name: 'health endpoint reports database ready',
    method: 'GET',
    path: '/api/health',
    redirect: 'manual',
    expectStatus: [200],
    expectHeaders: {
      'cache-control': 'private, no-store, max-age=0, must-revalidate',
      'x-robots-tag': 'noindex, nofollow',
    },
    expectJson: (body) => body?.ok === true && body?.database === 'ok',
  },
  {
    name: 'landing page renders',
    method: 'GET',
    path: '/',
    redirect: 'manual',
    expectStatus: [200],
    expectHtml: true,
    expectHeaders: {
      'cache-control': 'private, no-store, max-age=0, must-revalidate',
      'x-content-type-options': 'nosniff',
      'x-frame-options': 'DENY',
      'referrer-policy': 'strict-origin-when-cross-origin',
      'permissions-policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()',
    },
    expectTextIncludes: [
      '<html lang="ko"',
      '<title>도파밈 - 세상의 모든 이슈 예측하고 즐겨라</title>',
      'application/ld+json',
      '"@type":"WebSite"',
    ],
  },
  {
    name: 'landing page renders English locale',
    method: 'GET',
    path: '/',
    redirect: 'manual',
    headers: { cookie: 'dopameme_locale=en' },
    expectStatus: [200],
    expectHtml: true,
    expectTextIncludes: [
      '<html lang="en"',
      '<title>Dopameme - Predict the issues everyone is watching</title>',
      'Predict real-world events across politics',
      'og:locale" content="en_US"',
      'Predict the issues',
    ],
  },
  {
    name: 'web app manifest renders',
    method: 'GET',
    path: '/manifest.webmanifest',
    redirect: 'manual',
    expectStatus: [200],
    expectHeaders: {
      'cache-control': 'public, max-age=0, must-revalidate',
    },
    expectJson: (body) => body?.name === '도파밈' && body?.display === 'standalone',
  },
  {
    name: 'icon asset renders with public revalidation cache',
    method: 'GET',
    path: '/icon.svg',
    redirect: 'manual',
    expectStatus: [200],
    expectHeaders: {
      'cache-control': 'public, max-age=0, must-revalidate',
    },
    expectTextIncludes: '<svg',
  },
  {
    name: 'about page renders without shared cache',
    method: 'GET',
    path: '/about',
    redirect: 'manual',
    expectStatus: [200],
    expectHtml: true,
    expectHeaders: {
      'cache-control': 'private, no-store, max-age=0, must-revalidate',
    },
    expectTextIncludes: '도파밈 소개',
  },
  {
    name: 'robots.txt exposes sitemap and protects private routes',
    method: 'GET',
    path: '/robots.txt',
    redirect: 'manual',
    expectStatus: [200],
    expectTextIncludes: [
      'Sitemap: https://dopameme.kr/sitemap.xml',
      'Disallow: /admin',
      'Disallow: /api',
      'Allow: /.well-known/security.txt',
    ],
  },
  {
    name: 'security.txt publishes security contact metadata',
    method: 'GET',
    path: '/.well-known/security.txt',
    redirect: 'manual',
    expectStatus: [200],
    expectText: true,
    expectHeaders: {
      'cache-control': 'public, max-age=86400, must-revalidate',
    },
    expectTextIncludes: [
      'Contact: https://dopameme.kr',
      'Expires: 2027-05-11T00:00:00Z',
      'Preferred-Languages: ko, en',
      'Canonical: https://dopameme.kr/.well-known/security.txt',
    ],
  },
  {
    name: 'sitemap.xml exposes public market routes',
    method: 'GET',
    path: '/sitemap.xml',
    redirect: 'manual',
    expectStatus: [200],
    expectTextIncludes: 'https://dopameme.kr/markets',
  },
  {
    name: 'offline fallback page renders',
    method: 'GET',
    path: '/offline',
    redirect: 'manual',
    expectStatus: [200],
    expectHtml: true,
    expectHeaders: {
      'cache-control': 'private, no-store, max-age=0, must-revalidate',
    },
  },
  {
    name: 'terms page renders without shared cache',
    method: 'GET',
    path: '/terms',
    redirect: 'manual',
    expectStatus: [200],
    expectHtml: true,
    expectHeaders: {
      'cache-control': 'private, no-store, max-age=0, must-revalidate',
    },
    expectTextIncludes: '이용약관',
  },
  {
    name: 'privacy page renders without shared cache',
    method: 'GET',
    path: '/privacy',
    redirect: 'manual',
    expectStatus: [200],
    expectHtml: true,
    expectHeaders: {
      'cache-control': 'private, no-store, max-age=0, must-revalidate',
    },
    expectTextIncludes: '개인정보처리방침',
  },
  {
    name: 'service worker script renders',
    method: 'GET',
    path: '/sw.js',
    redirect: 'manual',
    expectStatus: [200],
    expectHeaders: {
      'cache-control': 'public, max-age=0, must-revalidate',
    },
    expectTextIncludes: [
      'dopameme-offline-v3',
      'const PRECACHE_URLS = ["/manifest.webmanifest", "/icon.svg"];',
      'networkOnlyNavigation',
      'createOfflineFallbackResponse',
    ],
    expectTextExcludes: [
      'const PRECACHE_URLS = [...PUBLIC_NAVIGATION_URLS',
      'networkFirstPublicPage',
    ],
  },
  {
    name: 'login page renders',
    method: 'GET',
    path: '/login',
    redirect: 'manual',
    expectStatus: [200],
    expectHtml: true,
    expectHeaders: {
      'cache-control': 'private, no-store, max-age=0, must-revalidate',
      'x-robots-tag': 'noindex, nofollow',
    },
  },
  {
    name: 'login page renders English locale',
    method: 'GET',
    path: '/login',
    redirect: 'manual',
    headers: { cookie: 'dopameme_locale=en' },
    expectStatus: [200],
    expectHtml: true,
    expectTextIncludes: [
      '<title>Log in | Dopameme</title>',
      'Log in to your Dopameme account',
      'Welcome back',
    ],
  },
  {
    name: 'login page renders Japanese locale',
    method: 'GET',
    path: '/login',
    redirect: 'manual',
    headers: { cookie: 'dopameme_locale=ja' },
    expectStatus: [200],
    expectHtml: true,
    expectTextIncludes: [
      '<html lang="ja"',
      '<title>ログイン | Dopameme</title>',
      'おかえりなさい',
    ],
  },
  {
    name: 'signup page renders',
    method: 'GET',
    path: '/signup',
    redirect: 'manual',
    expectStatus: [200],
    expectHtml: true,
  },
  {
    name: 'signup page renders English locale',
    method: 'GET',
    path: '/signup',
    redirect: 'manual',
    headers: { cookie: 'dopameme_locale=en' },
    expectStatus: [200],
    expectHtml: true,
    expectTextIncludes: [
      '<title>Sign up | Dopameme</title>',
      '10,000 DPMM welcome bonus',
      'Start predicting',
    ],
  },
  {
    name: 'signup page renders Japanese locale',
    method: 'GET',
    path: '/signup',
    redirect: 'manual',
    headers: { cookie: 'dopameme_locale=ja' },
    expectStatus: [200],
    expectHtml: true,
    expectTextIncludes: [
      '<title>登録 | Dopameme</title>',
      '予測を始めましょう',
    ],
  },
  {
    name: 'markets page renders',
    method: 'GET',
    path: '/markets',
    redirect: 'manual',
    expectStatus: [200],
    expectHtml: true,
    expectHeaders: {
      'cache-control': 'private, no-store, max-age=0, must-revalidate',
    },
    expectTextIncludes: [
      '전체 지역',
      'application/ld+json',
      '"@type":"ItemList"',
    ],
  },
  {
    name: 'markets page renders timezone labels',
    method: 'GET',
    path: '/markets',
    redirect: 'manual',
    expectStatus: [200],
    expectHtml: true,
    expectTextIncludes: 'KST',
  },
  {
    name: 'markets page renders English locale',
    method: 'GET',
    path: '/markets',
    redirect: 'manual',
    headers: { cookie: 'dopameme_locale=en' },
    expectStatus: [200],
    expectHtml: true,
    expectTextIncludes: [
      '<title>Prediction markets | Dopameme</title>',
      'Browse public prediction markets',
      'og:locale" content="en_US"',
      'Prediction markets',
    ],
  },
  {
    name: 'markets page renders Japanese locale',
    method: 'GET',
    path: '/markets',
    redirect: 'manual',
    headers: { cookie: 'dopameme_locale=ja' },
    expectStatus: [200],
    expectHtml: true,
    expectTextIncludes: [
      '<title>予測マーケット | Dopameme</title>',
      '予測マーケット',
    ],
  },
  {
    name: 'app page requires login',
    method: 'GET',
    path: '/app',
    redirect: 'manual',
    expectStatus: [302, 303, 307, 308],
    expectLocation: '/login',
  },
  {
    name: 'wallet page requires login',
    method: 'GET',
    path: '/app/wallet',
    redirect: 'manual',
    expectStatus: [302, 303, 307, 308],
    expectLocation: '/login',
  },
  {
    name: 'stats page requires login',
    method: 'GET',
    path: '/app/stats',
    redirect: 'manual',
    expectStatus: [302, 303, 307, 308],
    expectLocation: '/login',
  },
  {
    name: 'recommendations page requires login',
    method: 'GET',
    path: '/app/recommendations',
    redirect: 'manual',
    expectStatus: [302, 303, 307, 308],
    expectLocation: '/login',
  },
  {
    name: 'trends page requires login',
    method: 'GET',
    path: '/app/trends',
    redirect: 'manual',
    expectStatus: [302, 303, 307, 308],
    expectLocation: '/login',
  },
  {
    name: 'achievements page requires login',
    method: 'GET',
    path: '/app/achievements',
    redirect: 'manual',
    expectStatus: [302, 303, 307, 308],
    expectLocation: '/login',
  },
  {
    name: 'level page requires login',
    method: 'GET',
    path: '/app/level',
    redirect: 'manual',
    expectStatus: [302, 303, 307, 308],
    expectLocation: '/login',
  },
  {
    name: 'seasons page requires login',
    method: 'GET',
    path: '/app/seasons',
    redirect: 'manual',
    expectStatus: [302, 303, 307, 308],
    expectLocation: '/login',
  },
  {
    name: 'shop page requires login',
    method: 'GET',
    path: '/app/shop',
    redirect: 'manual',
    expectStatus: [302, 303, 307, 308],
    expectLocation: '/login',
  },
  {
    name: 'security page requires login',
    method: 'GET',
    path: '/app/security',
    redirect: 'manual',
    expectStatus: [302, 303, 307, 308],
    expectLocation: '/login',
  },
  {
    name: 'activity feed requires login',
    method: 'GET',
    path: '/feed',
    redirect: 'manual',
    expectStatus: [302, 303, 307, 308],
    expectLocation: '/login',
  },
  {
    name: 'notifications page requires login',
    method: 'GET',
    path: '/notifications',
    redirect: 'manual',
    expectStatus: [302, 303, 307, 308],
    expectLocation: '/login',
  },
  {
    name: 'leaderboard requires login',
    method: 'GET',
    path: '/leaderboard',
    redirect: 'manual',
    expectStatus: [302, 303, 307, 308],
    expectLocation: '/login',
  },
  {
    name: 'user profile requires login',
    method: 'GET',
    path: '/users/smoke-test-user',
    redirect: 'manual',
    expectStatus: [302, 303, 307, 308],
    expectLocation: '/login',
  },
  {
    name: 'admin dashboard requires login',
    method: 'GET',
    path: '/admin',
    redirect: 'manual',
    expectStatus: [302, 303, 307, 308],
    expectLocation: '/login',
  },
  {
    name: 'admin users requires login',
    method: 'GET',
    path: '/admin/users',
    redirect: 'manual',
    expectStatus: [302, 303, 307, 308],
    expectLocation: '/login',
  },
  {
    name: 'admin market stats requires login',
    method: 'GET',
    path: '/admin/stats/markets',
    redirect: 'manual',
    expectStatus: [302, 303, 307, 308],
    expectLocation: '/login',
  },
  {
    name: 'admin trend stats requires login',
    method: 'GET',
    path: '/admin/stats/trends',
    redirect: 'manual',
    expectStatus: [302, 303, 307, 308],
    expectLocation: '/login',
  },
  {
    name: 'admin anomaly stats requires login',
    method: 'GET',
    path: '/admin/stats/anomalies',
    redirect: 'manual',
    expectStatus: [302, 303, 307, 308],
    expectLocation: '/login',
  },
  {
    name: 'admin withdrawals requires login',
    method: 'GET',
    path: '/admin/withdrawals',
    redirect: 'manual',
    expectStatus: [302, 303, 307, 308],
    expectLocation: '/login',
  },
  {
    name: 'wallet API rejects anonymous requests',
    method: 'GET',
    path: '/api/wallet/solana',
    redirect: 'manual',
    expectStatus: [401],
    expectHeaders: {
      'cache-control': 'private, no-store, max-age=0, must-revalidate',
      'x-robots-tag': 'noindex, nofollow',
    },
    expectJson: (body) => body?.error?.code === 'auth.required',
  },
  {
    name: 'withdrawal API rejects anonymous requests',
    method: 'GET',
    path: '/api/wallet/solana/withdrawals',
    redirect: 'manual',
    expectStatus: [401],
    expectJson: (body) => body?.error?.code === 'auth.required',
  },
  {
    name: 'B2B analytics API rejects anonymous requests',
    method: 'GET',
    path: '/api/b2b/analytics',
    redirect: 'manual',
    expectStatus: [401],
    expectJson: (body) => body?.error?.code === 'auth.required',
  },
  {
    name: 'push subscription API rejects anonymous requests',
    method: 'POST',
    path: '/api/push/subscriptions',
    redirect: 'manual',
    expectStatus: [401],
    expectJson: (body) => body?.error?.code === 'auth.required',
  },
  {
    name: 'passkey registration API rejects anonymous requests',
    method: 'POST',
    path: '/api/webauthn/register/options',
    redirect: 'manual',
    expectStatus: [401],
    expectJson: (body) => body?.error?.code === 'auth.required',
  },
]

async function runMarketDetailCheck(baseUrl, timeoutMs) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)
  const startedAt = performance.now()

  try {
    const response = await fetch(buildUrl(baseUrl, '/markets'), {
      method: 'GET',
      redirect: 'manual',
      signal: controller.signal,
      headers: { accept: 'text/html' },
    })

    if (response.status !== 200 || !isHtmlResponse(response)) {
      const durationMs = Math.round(performance.now() - startedAt)
      return {
        ok: false,
        name: 'market detail page renders',
        path: '/markets/[id]',
        status: response.status,
        durationMs,
        error: `Could not discover market detail link from /markets: ${response.status}`,
      }
    }

    const html = await readText(response)
    const match = html.match(/href=["'](\/markets\/[^"'?#]+)["']/)
    const detailPath = match?.[1]
    if (!detailPath) {
      const durationMs = Math.round(performance.now() - startedAt)
      return {
        ok: false,
        name: 'market detail page renders',
        path: '/markets/[id]',
        status: 200,
        durationMs,
        error: 'Could not find a market detail link on /markets',
      }
    }

    const detailResponse = await fetch(buildUrl(baseUrl, detailPath), {
      method: 'GET',
      redirect: 'manual',
      signal: controller.signal,
      headers: { accept: 'text/html' },
    })
    const durationMs = Math.round(performance.now() - startedAt)

    if (detailResponse.status !== 200) {
      return {
        ok: false,
        name: 'market detail page renders',
        path: detailPath,
        status: detailResponse.status,
        durationMs,
        error: `Expected status 200 but got ${detailResponse.status}`,
      }
    }

    if (!isHtmlResponse(detailResponse)) {
      return {
        ok: false,
        name: 'market detail page renders',
        path: detailPath,
        status: detailResponse.status,
        durationMs,
        error: `Expected HTML content-type but got ${detailResponse.headers.get('content-type') || '-'}`,
      }
    }

    const cacheControl = detailResponse.headers.get('cache-control')
    if (cacheControl !== 'private, no-store, max-age=0, must-revalidate') {
      return {
        ok: false,
        name: 'market detail page renders',
        path: detailPath,
        status: detailResponse.status,
        durationMs,
        error: `Expected cache-control private, no-store, max-age=0, must-revalidate but got ${cacheControl || '-'}`,
      }
    }

    const detailHtml = await readText(detailResponse)
    const missingText = [
      'application/ld+json',
      '"@type":"Question"',
      'og:title',
      'twitter:card',
    ].find((expectedText) => !detailHtml.includes(expectedText))

    if (missingText) {
      return {
        ok: false,
        name: 'market detail page renders',
        path: detailPath,
        status: detailResponse.status,
        durationMs,
        error: `Expected market detail HTML to include ${missingText}`,
      }
    }

    return {
      ok: true,
      name: 'market detail page renders',
      path: detailPath,
      status: detailResponse.status,
      durationMs,
    }
  } catch (error) {
    const durationMs = Math.round(performance.now() - startedAt)
    return {
      ok: false,
      name: 'market detail page renders',
      path: '/markets/[id]',
      status: null,
      durationMs,
      error: error instanceof Error ? error.message : String(error),
    }
  } finally {
    clearTimeout(timeout)
  }
}

async function runMobileScaffoldCheck() {
  const startedAt = performance.now()
  const requiredFiles = [
    'mobile/package.json',
    'mobile/app.json',
    'mobile/App.js',
    'mobile/README.md',
  ]

  try {
    await Promise.all(requiredFiles.map((file) => access(new URL(file, repoRoot))))

    const packageJson = JSON.parse(await readFile(new URL('mobile/package.json', repoRoot), 'utf8'))
    const appJson = JSON.parse(await readFile(new URL('mobile/app.json', repoRoot), 'utf8'))
    const dependencies = packageJson.dependencies || {}

    const hasRuntimeDeps =
      Boolean(dependencies.expo) &&
      Boolean(dependencies['react-native']) &&
      Boolean(dependencies['react-native-webview'])

    const hasProductionOrigin = appJson?.expo?.extra?.siteOrigin === 'https://dopameme.kr'

    const durationMs = Math.round(performance.now() - startedAt)
    if (!hasRuntimeDeps || !hasProductionOrigin) {
      return {
        ok: false,
        name: 'mobile Expo scaffold is configured',
        path: 'mobile/',
        status: null,
        durationMs,
        error: 'Mobile app is missing required runtime dependencies or production origin config',
      }
    }

    return {
      ok: true,
      name: 'mobile Expo scaffold is configured',
      path: 'mobile/',
      status: null,
      durationMs,
    }
  } catch (error) {
    const durationMs = Math.round(performance.now() - startedAt)
    return {
      ok: false,
      name: 'mobile Expo scaffold is configured',
      path: 'mobile/',
      status: null,
      durationMs,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

async function runCheck(baseUrl, timeoutMs, check) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)
  const startedAt = performance.now()

  try {
    const response = await fetch(buildUrl(baseUrl, check.path), {
      method: check.method,
      redirect: check.redirect,
      signal: controller.signal,
      headers: {
        accept: check.expectHtml ? 'text/html' : 'application/json,text/html;q=0.9,*/*;q=0.8',
        ...(check.headers || {}),
      },
    })
    const durationMs = Math.round(performance.now() - startedAt)

    if (!check.expectStatus.includes(response.status)) {
      return {
        ok: false,
        name: check.name,
        path: check.path,
        status: response.status,
        durationMs,
        error: `Expected status ${check.expectStatus.join('/')} but got ${response.status}`,
      }
    }

    if (check.expectLocation && !locationMatches(response, check.expectLocation)) {
      return {
        ok: false,
        name: check.name,
        path: check.path,
        status: response.status,
        durationMs,
        error: `Expected redirect location ${check.expectLocation} but got ${response.headers.get('location') || '-'}`,
      }
    }

    if (check.expectHeaders) {
      const missingHeader = Object.entries(check.expectHeaders).find(([name, expectedValue]) => (
        response.headers.get(name) !== expectedValue
      ))

      if (missingHeader) {
        const [name, expectedValue] = missingHeader
        return {
          ok: false,
          name: check.name,
          path: check.path,
          status: response.status,
          durationMs,
          error: `Expected header ${name}: ${expectedValue} but got ${response.headers.get(name) || '-'}`,
        }
      }
    }

    if (check.expectHtml && !isHtmlResponse(response)) {
      return {
        ok: false,
        name: check.name,
        path: check.path,
        status: response.status,
        durationMs,
        error: `Expected HTML content-type but got ${response.headers.get('content-type') || '-'}`,
      }
    }

    if (check.expectText && !isTextResponse(response)) {
      return {
        ok: false,
        name: check.name,
        path: check.path,
        status: response.status,
        durationMs,
        error: `Expected text content-type but got ${response.headers.get('content-type') || '-'}`,
      }
    }

    if (check.expectJson) {
      if (!isJsonResponse(response)) {
        return {
          ok: false,
          name: check.name,
          path: check.path,
          status: response.status,
          durationMs,
          error: `Expected JSON content-type but got ${response.headers.get('content-type') || '-'}`,
        }
      }

      const body = await readJson(response)
      if (!check.expectJson(body)) {
        return {
          ok: false,
          name: check.name,
          path: check.path,
          status: response.status,
          durationMs,
          error: `JSON assertion failed for ${check.path}`,
          body,
        }
      }
    }

    let responseText = null

    if (check.expectTextIncludes) {
      responseText = await readText(response)
      const expectedTexts = Array.isArray(check.expectTextIncludes)
        ? check.expectTextIncludes
        : [check.expectTextIncludes]
      const missingText = expectedTexts.find((expectedText) => !responseText.includes(expectedText))
      if (missingText) {
        return {
          ok: false,
          name: check.name,
          path: check.path,
          status: response.status,
          durationMs,
          error: `Expected response text to include ${missingText}`,
        }
      }
    }

    if (check.expectTextExcludes) {
      responseText = responseText || await readText(response)
      const excludedTexts = Array.isArray(check.expectTextExcludes)
        ? check.expectTextExcludes
        : [check.expectTextExcludes]
      const presentText = excludedTexts.find((excludedText) => responseText.includes(excludedText))
      if (presentText) {
        return {
          ok: false,
          name: check.name,
          path: check.path,
          status: response.status,
          durationMs,
          error: `Expected response text to exclude ${presentText}`,
        }
      }
    }

    return {
      ok: true,
      name: check.name,
      path: check.path,
      status: response.status,
      durationMs,
    }
  } catch (error) {
    const durationMs = Math.round(performance.now() - startedAt)
    return {
      ok: false,
      name: check.name,
      path: check.path,
      status: null,
      durationMs,
      error: error instanceof Error ? error.message : String(error),
    }
  } finally {
    clearTimeout(timeout)
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2))
  const baseUrl = normalizeBaseUrl(options.baseUrl)
  const results = []

  for (const check of checks) {
    const result = await runCheck(baseUrl, options.timeoutMs, check)
    results.push(result)

    if (!options.json) {
      const marker = result.ok ? 'PASS' : 'FAIL'
      const status = result.status === null ? '-' : result.status
      console.log(`${marker} ${result.name} ${check.method} ${check.path} ${status} ${result.durationMs}ms`)
      if (!result.ok) {
        console.log(`  ${result.error}`)
      }
    }
  }

  const marketDetailResult = await runMarketDetailCheck(baseUrl, options.timeoutMs)
  results.push(marketDetailResult)

  if (!options.json) {
    const marker = marketDetailResult.ok ? 'PASS' : 'FAIL'
    const status = marketDetailResult.status === null ? '-' : marketDetailResult.status
    console.log(`${marker} ${marketDetailResult.name} GET ${marketDetailResult.path} ${status} ${marketDetailResult.durationMs}ms`)
    if (!marketDetailResult.ok) {
      console.log(`  ${marketDetailResult.error}`)
    }
  }

  const mobileScaffoldResult = await runMobileScaffoldCheck()
  results.push(mobileScaffoldResult)

  if (!options.json) {
    const marker = mobileScaffoldResult.ok ? 'PASS' : 'FAIL'
    console.log(`${marker} ${mobileScaffoldResult.name} ${mobileScaffoldResult.path} ${mobileScaffoldResult.durationMs}ms`)
    if (!mobileScaffoldResult.ok) {
      console.log(`  ${mobileScaffoldResult.error}`)
    }
  }

  const failed = results.filter((result) => !result.ok)
  const summary = {
    ok: failed.length === 0,
    baseUrl,
    total: results.length,
    passed: results.length - failed.length,
    failed: failed.length,
    results,
  }

  if (options.json) {
    console.log(JSON.stringify(summary, null, 2))
  } else {
    console.log(`\nSmoke summary: ${summary.passed}/${summary.total} passed (${baseUrl})`)
  }

  if (!summary.ok) {
    process.exitCode = 1
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exitCode = 1
})

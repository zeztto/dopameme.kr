#!/usr/bin/env node

const defaultBaseUrl = process.env.SMOKE_BASE_URL || 'http://localhost:3000'

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
  return response.headers.get('content-type')?.includes('application/json')
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
    expectJson: (body) => body?.ok === true && body?.database === 'ok',
  },
  {
    name: 'landing page renders',
    method: 'GET',
    path: '/',
    redirect: 'manual',
    expectStatus: [200],
    expectHtml: true,
  },
  {
    name: 'login page renders',
    method: 'GET',
    path: '/login',
    redirect: 'manual',
    expectStatus: [200],
    expectHtml: true,
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
    name: 'markets page renders',
    method: 'GET',
    path: '/markets',
    redirect: 'manual',
    expectStatus: [200],
    expectHtml: true,
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
    name: 'leaderboard requires login',
    method: 'GET',
    path: '/leaderboard',
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

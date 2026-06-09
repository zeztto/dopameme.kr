import { createHash, timingSafeEqual } from 'node:crypto'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'

type B2bApiAuthResult =
  | {
      ok: true
      mode: 'api_key' | 'admin_session'
      subject: string
    }
  | {
      ok: false
      status: 401 | 403
      code: string
      message: string
    }

function configuredApiKeys() {
  return (process.env.B2B_API_KEYS || '')
    .split(',')
    .map((key) => key.trim())
    .filter((key) => key.length >= 32)
}

function hashToken(token: string) {
  return createHash('sha256').update(token).digest()
}

function constantTimeTokenMatch(inputToken: string, expectedToken: string) {
  const inputHash = hashToken(inputToken)
  const expectedHash = hashToken(expectedToken)
  return timingSafeEqual(inputHash, expectedHash)
}

function getBearerToken(authorization: string | null) {
  if (!authorization) return null

  const [scheme, token, ...rest] = authorization.trim().split(/\s+/)

  if (rest.length > 0 || scheme?.toLowerCase() !== 'bearer' || !token) {
    return null
  }

  return token
}

function getRequestToken(request: Request) {
  return getBearerToken(request.headers.get('authorization'))
    || request.headers.get('x-api-key')?.trim()
    || null
}

export async function authorizeB2bApiRequest(request: Request): Promise<B2bApiAuthResult> {
  const token = getRequestToken(request)
  const apiKeys = configuredApiKeys()

  if (token) {
    let matched = false

    for (const apiKey of apiKeys) {
      matched = constantTimeTokenMatch(token, apiKey) || matched
    }

    if (!matched) {
      return {
        ok: false,
        status: 401,
        code: 'auth.invalid_api_key',
        message: '유효하지 않은 API key입니다.',
      }
    }

    return {
      ok: true,
      mode: 'api_key',
      subject: 'b2b-api-key',
    }
  }

  const session = await auth()

  if (!session?.user?.id) {
    return {
      ok: false,
      status: 401,
      code: 'auth.required',
      message: 'API key 또는 관리자 로그인이 필요합니다.',
    }
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      role: true,
      status: true,
    },
  })

  if (!user || user.status !== 'active') {
    return {
      ok: false,
      status: 403,
      code: 'auth.inactive',
      message: '이용할 수 없는 계정입니다.',
    }
  }

  if (user.role !== 'admin') {
    return {
      ok: false,
      status: 403,
      code: 'auth.admin_required',
      message: '관리자 권한이 필요합니다.',
    }
  }

  return {
    ok: true,
    mode: 'admin_session',
    subject: user.id,
  }
}

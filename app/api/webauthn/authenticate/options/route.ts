import { getAuthenticationOptions } from '@/lib/webauthn'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

function jsonError(code: string, message: string, status: number, headers?: HeadersInit) {
  return NextResponse.json({ error: { code, message } }, { status, headers })
}

export async function POST(request: NextRequest) {
  let body: { email?: unknown }

  try {
    body = await request.json()
  } catch {
    return jsonError('request.invalid_json', '요청 본문이 올바른 JSON이 아닙니다.', 400)
  }

  const result = await getAuthenticationOptions(body.email)

  if (!result.ok) {
    const headers = 'retryAfterSeconds' in result
      ? { 'Retry-After': String(result.retryAfterSeconds) }
      : undefined
    return jsonError(result.code, result.message, result.status, headers)
  }

  return NextResponse.json({ data: result.options })
}

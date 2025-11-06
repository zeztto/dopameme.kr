import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // /app 또는 /dashboard로 시작하는 경로는 보호
  const isProtectedRoute =
    request.nextUrl.pathname.startsWith('/app') ||
    request.nextUrl.pathname.startsWith('/dashboard')

  if (isProtectedRoute) {
    // 인증 체크는 페이지 레벨에서 수행
    // middleware는 최소한으로 유지
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/app/:path*', '/dashboard/:path*'],
}

import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import Credentials from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/db'
import { checkRateLimit, getRequestIp } from '@/lib/rate-limit'
import { isValidEmail, normalizeEmail } from '@/lib/validation'
import bcrypt from 'bcryptjs'

const oauthWelcomeBonus = 10000

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
    signOut: '/',
    error: '/login',
  },
  trustHost: true,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const email = normalizeEmail(credentials?.email)
        const password =
          typeof credentials?.password === 'string' ? credentials.password : ''

        if (!email || !password) {
          throw new Error('이메일과 비밀번호를 입력해주세요')
        }

        if (!isValidEmail(email) || password.length > 128) {
          throw new Error('이메일 또는 비밀번호가 올바르지 않습니다')
        }

        const ip = await getRequestIp()
        const rateLimit = checkRateLimit(`login:${ip}:${email}`, {
          limit: 10,
          windowMs: 15 * 60 * 1000,
        })

        if (!rateLimit.allowed) {
          throw new Error('로그인 시도가 너무 많습니다. 잠시 후 다시 시도해주세요')
        }

        const user = await prisma.user.findUnique({
          where: { email },
        })

        if (!user) {
          throw new Error('이메일 또는 비밀번호가 올바르지 않습니다')
        }

        if (user.status !== 'active') {
          throw new Error('이 계정은 이용이 제한되었습니다')
        }

        // 비밀번호가 없는 경우 (OAuth로 가입한 사용자)
        if (!user.password) {
          throw new Error('이메일 또는 비밀번호가 올바르지 않습니다')
        }

        // bcrypt로 비밀번호 검증
        const isPasswordValid = await bcrypt.compare(
          password,
          user.password
        )

        if (!isPasswordValid) {
          throw new Error('이메일 또는 비밀번호가 올바르지 않습니다')
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'credentials') {
        return true
      }

      const email = normalizeEmail(user.email)

      if (!email) {
        return true
      }

      const existingUser = await prisma.user.findUnique({
        where: { email },
        select: { status: true },
      })

      return !existingUser || existingUser.status === 'active'
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }

      if (!token.id) {
        return token
      }

      const dbUser = await prisma.user.findUnique({
        where: { id: token.id as string },
        select: {
          status: true,
          sessionVersion: true,
        },
      })

      if (!dbUser || dbUser.status !== 'active') {
        return null
      }

      if (
        typeof token.sessionVersion === 'number' &&
        token.sessionVersion !== dbUser.sessionVersion
      ) {
        return null
      }

      token.sessionVersion = dbUser.sessionVersion

      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
      }
      return session
    },
  },
  events: {
    async createUser({ user }) {
      if (!user.id) return

      await prisma.dpmmLedgerTransaction.create({
        data: {
          userId: user.id,
          type: 'welcome_bonus',
          delta: oauthWelcomeBonus,
          balanceAfter: oauthWelcomeBonus,
          reason: 'OAuth 회원가입 웰컴 보너스',
          sourceType: 'oauth_signup',
          sourceId: user.id,
        },
      })
    },
  },
})

import {
  pgTable,
  text,
  timestamp,
  integer,
  primaryKey,
  boolean,
} from 'drizzle-orm/pg-core'
import type { AdapterAccountType } from 'next-auth/adapters'

export const users = pgTable('users', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text('name').unique(), // 닉네임 (영문 대소문자 + 특수문자 12글자)
  email: text('email').unique(),
  emailVerified: timestamp('emailVerified', { mode: 'date' }),
  image: text('image'),
  password: text('password'), // 크레덴셜 로그인용 (해시화된 비밀번호)
  role: text('role').default('user'), // user, admin, test
  dpmmBalance: integer('dpmm_balance').default(10000), // 웰컴 보너스
  createdAt: timestamp('created_at').defaultNow(),
})

export const accounts = pgTable(
  'accounts',
  {
    userId: text('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: text('type').$type<AdapterAccountType>().notNull(),
    provider: text('provider').notNull(),
    providerAccountId: text('providerAccountId').notNull(),
    refresh_token: text('refresh_token'),
    access_token: text('access_token'),
    expires_at: integer('expires_at'),
    token_type: text('token_type'),
    scope: text('scope'),
    id_token: text('id_token'),
    session_state: text('session_state'),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  })
)

export const sessions = pgTable('sessions', {
  sessionToken: text('sessionToken').primaryKey(),
  userId: text('userId')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
})

export const verificationTokens = pgTable(
  'verification_tokens',
  {
    identifier: text('identifier').notNull(),
    token: text('token').notNull(),
    expires: timestamp('expires', { mode: 'date' }).notNull(),
  },
  (verificationToken) => ({
    compositePk: primaryKey({
      columns: [verificationToken.identifier, verificationToken.token],
    }),
  })
)

// 예측 마켓 테이블
export const markets = pgTable('markets', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  title: text('title').notNull(),
  description: text('description').notNull(),
  category: text('category').notNull(), // 정치, 경제, 스포츠, 엔터테인먼트 등
  imageUrl: text('image_url'),
  status: text('status').notNull().default('active'), // active, closed, resolved
  hidden: boolean('hidden').default(false).notNull(), // 관리자가 가린 예측
  creatorId: text('creator_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  endsAt: timestamp('ends_at').notNull(), // 예측 마감 시간
  resolvedAt: timestamp('resolved_at'), // 결과 확정 시간
  winningOptionId: text('winning_option_id'), // 승리한 선택지 ID
})

// 마켓의 선택지 (Yes/No, 후보1/후보2 등)
export const marketOptions = pgTable('market_options', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  marketId: text('market_id')
    .notNull()
    .references(() => markets.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  totalPredictions: integer('total_predictions').default(0).notNull(),
  totalAmount: integer('total_amount').default(0).notNull(), // 이 선택지에 걸린 총 DPMM
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// 사용자의 예측 참여
export const predictions = pgTable('predictions', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  marketId: text('market_id')
    .notNull()
    .references(() => markets.id, { onDelete: 'cascade' }),
  optionId: text('option_id')
    .notNull()
    .references(() => marketOptions.id, { onDelete: 'cascade' }),
  amount: integer('amount').notNull(), // 베팅한 DPMM 양
  createdAt: timestamp('created_at').defaultNow().notNull(),
  resolved: integer('resolved').default(0).notNull(), // 0: 대기, 1: 승리, -1: 패배
  payout: integer('payout').default(0).notNull(), // 지급받은 DPMM
})

export const SUPPORTED_LOCALES = ['ko', 'en', 'ja'] as const

export type Locale = (typeof SUPPORTED_LOCALES)[number]

export const DEFAULT_LOCALE: Locale = 'ko'
export const LOCALE_COOKIE = 'dopameme_locale'

export const LOCALE_LABELS: Record<Locale, string> = {
  ko: '한국어',
  en: 'English',
  ja: '日本語',
}

export const LOCALE_SHORT_LABELS: Record<Locale, string> = {
  ko: 'KO',
  en: 'EN',
  ja: 'JA',
}

export const DATE_LOCALES: Record<Locale, string> = {
  ko: 'ko-KR',
  en: 'en-US',
  ja: 'ja-JP',
}

export const HTML_LANGUAGES: Record<Locale, string> = {
  ko: 'ko',
  en: 'en',
  ja: 'ja',
}

export const OPEN_GRAPH_LOCALES: Record<Locale, string> = {
  ko: 'ko_KR',
  en: 'en_US',
  ja: 'ja_JP',
}

export const publicMetadataCopy: Record<Locale, {
  landing: {
    title: string
    description: string
    imageAlt: string
  }
  markets: {
    title: string
    description: string
    imageAlt: string
  }
  login: {
    title: string
    description: string
  }
  signup: {
    title: string
    description: string
  }
}> = {
  ko: {
    landing: {
      title: '도파밈 - 세상의 모든 이슈 예측하고 즐겨라',
      description: '정치, 경제, 스포츠, 연예 등 실세계 이벤트를 예측하고 도파밈(DPMM) 포인트를 획득하세요. 게임처럼 즐기는 대한민국 No.1 예측 플랫폼입니다.',
      imageAlt: '도파밈 - 세상의 모든 이슈 예측하고 즐겨라',
    },
    markets: {
      title: '예측 마켓 | 도파밈',
      description: '도파밈에서 현재 참여 가능한 공개 예측 마켓과 종료된 예측 결과를 확인하세요.',
      imageAlt: '도파밈 예측 마켓',
    },
    login: {
      title: '로그인 | 도파밈',
      description: '도파밈 계정으로 로그인하고 예측 활동을 이어가세요.',
    },
    signup: {
      title: '회원가입 | 도파밈',
      description: '도파밈에 가입하고 10,000 DPMM 웰컴 보너스로 예측을 시작하세요.',
    },
  },
  en: {
    landing: {
      title: 'Dopameme - Predict the issues everyone is watching',
      description: 'Predict real-world events across politics, markets, sports, and entertainment. Earn Dopameme (DPMM) points in a social prediction game.',
      imageAlt: 'Dopameme - Predict the issues everyone is watching',
    },
    markets: {
      title: 'Prediction markets | Dopameme',
      description: 'Browse public prediction markets, follow live participation, and review resolved outcomes on Dopameme.',
      imageAlt: 'Dopameme prediction markets',
    },
    login: {
      title: 'Log in | Dopameme',
      description: 'Log in to your Dopameme account and continue your prediction activity.',
    },
    signup: {
      title: 'Sign up | Dopameme',
      description: 'Create a Dopameme account and start predicting with your 10,000 DPMM welcome bonus.',
    },
  },
  ja: {
    landing: {
      title: 'Dopameme - 世界の話題を予測して楽しもう',
      description: '政治、経済、スポーツ、エンタメなど現実世界のイベントを予測し、Dopameme (DPMM) ポイントを獲得しましょう。',
      imageAlt: 'Dopameme - 世界の話題を予測して楽しもう',
    },
    markets: {
      title: '予測マーケット | Dopameme',
      description: 'Dopamemeで公開中の予測マーケット、参加状況、確定した結果を確認しましょう。',
      imageAlt: 'Dopameme 予測マーケット',
    },
    login: {
      title: 'ログイン | Dopameme',
      description: 'Dopamemeアカウントでログインし、予測活動を続けましょう。',
    },
    signup: {
      title: '登録 | Dopameme',
      description: 'Dopamemeに登録し、10,000 DPMMのウェルカムボーナスで予測を始めましょう。',
    },
  },
}

export function normalizeLocale(value: FormDataEntryValue | string | null | undefined): Locale {
  if (typeof value !== 'string') return DEFAULT_LOCALE
  return SUPPORTED_LOCALES.includes(value as Locale) ? value as Locale : DEFAULT_LOCALE
}

export const headerCopy: Record<Locale, {
  backToMarkets: string
  myActivity: string
  feed: string
  recommendations: string
  trends: string
  stats: string
  achievements: string
  level: string
  seasons: string
  shop: string
  notifications: string
  wallet: string
  login: string
  signup: string
}> = {
  ko: {
    backToMarkets: '← 마켓 목록',
    myActivity: '내 활동',
    feed: '피드',
    recommendations: '추천',
    trends: '트렌드',
    stats: '통계',
    achievements: '업적',
    level: '레벨',
    seasons: '시즌',
    shop: '샵',
    notifications: '알림',
    wallet: '출금',
    login: '로그인',
    signup: '회원가입',
  },
  en: {
    backToMarkets: '← Markets',
    myActivity: 'Activity',
    feed: 'Feed',
    recommendations: 'Picks',
    trends: 'Trends',
    stats: 'Stats',
    achievements: 'Badges',
    level: 'Level',
    seasons: 'Seasons',
    shop: 'Shop',
    notifications: 'Alerts',
    wallet: 'Withdraw',
    login: 'Log in',
    signup: 'Sign up',
  },
  ja: {
    backToMarkets: '← マーケット',
    myActivity: '活動',
    feed: 'フィード',
    recommendations: 'おすすめ',
    trends: 'トレンド',
    stats: '統計',
    achievements: '実績',
    level: 'レベル',
    seasons: 'シーズン',
    shop: 'ショップ',
    notifications: '通知',
    wallet: '出金',
    login: 'ログイン',
    signup: '登録',
  },
}

export const authEntryCopy: Record<Locale, {
  common: {
    backHome: string
    emailLabel: string
    passwordLabel: string
    orLabel: string
    termsLabel: string
    privacyLabel: string
  }
  login: {
    badge: string
    title: string
    subtitle: string
    submit: string
    submitting: string
    passkeySubmit: string
    passkeyStartError: string
    passkeyFailError: string
    googleSubmit: string
    signupPrompt: string
    signupLink: string
    agreementPrefix: string
    agreementMiddle: string
    agreementSuffix: string
  }
  signup: {
    badge: string
    title: string
    subtitlePrefix: string
    subtitleSuffix: string
    nicknameLabel: string
    nicknamePlaceholder: string
    nicknameHelp: string
    passwordPlaceholder: string
    passwordConfirmLabel: string
    passwordConfirmPlaceholder: string
    submit: string
    submitting: string
    passwordMismatchError: string
    passwordTooShortError: string
    genericError: string
    googleSubmit: string
    loginPrompt: string
    loginLink: string
    agreementPrefix: string
    agreementMiddle: string
    agreementSuffix: string
    successTitle: string
    successBodyPrefix: string
    successBodySuffix: string
    successLogin: string
  }
}> = {
  ko: {
    common: {
      backHome: '← 홈으로',
      emailLabel: '이메일',
      passwordLabel: '비밀번호',
      orLabel: '또는',
      termsLabel: '이용약관',
      privacyLabel: '개인정보처리방침',
    },
    login: {
      badge: '🔐 로그인',
      title: '환영합니다!',
      subtitle: '도파밈 계정으로 로그인하세요',
      submit: '로그인',
      submitting: '로그인 중...',
      passkeySubmit: '패스키로 로그인',
      passkeyStartError: '패스키 로그인을 시작하지 못했습니다',
      passkeyFailError: '패스키 로그인에 실패했습니다',
      googleSubmit: '🔍 Google로 계속하기',
      signupPrompt: '계정이 없으신가요?',
      signupLink: '회원가입',
      agreementPrefix: '로그인하면 도파밈의',
      agreementMiddle: '및',
      agreementSuffix: '에 동의하는 것으로 간주됩니다.',
    },
    signup: {
      badge: '✨ 회원가입',
      title: '시작하세요!',
      subtitlePrefix: '무료로 가입하고',
      subtitleSuffix: '받기',
      nicknameLabel: '닉네임',
      nicknamePlaceholder: '무작위 닉네임이 자동으로 입력됩니다',
      nicknameHelp: '무작위 닉네임이 자동 생성되었습니다. 원하시면 수정 가능합니다 (최대 12자)',
      passwordPlaceholder: '8자 이상',
      passwordConfirmLabel: '비밀번호 확인',
      passwordConfirmPlaceholder: '비밀번호 재입력',
      submit: '회원가입',
      submitting: '가입 중...',
      passwordMismatchError: '비밀번호가 일치하지 않습니다',
      passwordTooShortError: '비밀번호는 최소 8자 이상이어야 합니다',
      genericError: '회원가입 중 오류가 발생했습니다',
      googleSubmit: '🔍 Google로 시작하기',
      loginPrompt: '이미 계정이 있으신가요?',
      loginLink: '로그인',
      agreementPrefix: '가입하면 도파밈의',
      agreementMiddle: '및',
      agreementSuffix: '에 동의하는 것으로 간주됩니다.',
      successTitle: '회원가입 완료!',
      successBodyPrefix: '웰컴 보너스가 지급되었습니다!',
      successBodySuffix: '잠시 후 로그인 페이지로 이동합니다...',
      successLogin: '로그인하기',
    },
  },
  en: {
    common: {
      backHome: '← Home',
      emailLabel: 'Email',
      passwordLabel: 'Password',
      orLabel: 'or',
      termsLabel: 'Terms',
      privacyLabel: 'Privacy Policy',
    },
    login: {
      badge: '🔐 Log in',
      title: 'Welcome back',
      subtitle: 'Log in with your Dopameme account',
      submit: 'Log in',
      submitting: 'Logging in...',
      passkeySubmit: 'Log in with passkey',
      passkeyStartError: 'Could not start passkey login',
      passkeyFailError: 'Passkey login failed',
      googleSubmit: '🔍 Continue with Google',
      signupPrompt: 'No account yet?',
      signupLink: 'Sign up',
      agreementPrefix: 'By logging in, you agree to Dopameme',
      agreementMiddle: 'and',
      agreementSuffix: '.',
    },
    signup: {
      badge: '✨ Sign up',
      title: 'Start predicting',
      subtitlePrefix: 'Join for free and claim',
      subtitleSuffix: '',
      nicknameLabel: 'Nickname',
      nicknamePlaceholder: 'A random nickname is filled in automatically',
      nicknameHelp: 'A random nickname was generated. You can edit it before signing up. Max 12 characters.',
      passwordPlaceholder: 'At least 8 characters',
      passwordConfirmLabel: 'Confirm password',
      passwordConfirmPlaceholder: 'Re-enter password',
      submit: 'Sign up',
      submitting: 'Signing up...',
      passwordMismatchError: 'Passwords do not match',
      passwordTooShortError: 'Password must be at least 8 characters',
      genericError: 'Something went wrong during signup',
      googleSubmit: '🔍 Start with Google',
      loginPrompt: 'Already have an account?',
      loginLink: 'Log in',
      agreementPrefix: 'By signing up, you agree to Dopameme',
      agreementMiddle: 'and',
      agreementSuffix: '.',
      successTitle: 'Signup complete',
      successBodyPrefix: 'welcome bonus has been credited.',
      successBodySuffix: 'You will be moved to the login page shortly.',
      successLogin: 'Go to login',
    },
  },
  ja: {
    common: {
      backHome: '← ホーム',
      emailLabel: 'メールアドレス',
      passwordLabel: 'パスワード',
      orLabel: 'または',
      termsLabel: '利用規約',
      privacyLabel: 'プライバシーポリシー',
    },
    login: {
      badge: '🔐 ログイン',
      title: 'おかえりなさい',
      subtitle: 'Dopamemeアカウントでログインしてください',
      submit: 'ログイン',
      submitting: 'ログイン中...',
      passkeySubmit: 'パスキーでログイン',
      passkeyStartError: 'パスキーログインを開始できませんでした',
      passkeyFailError: 'パスキーログインに失敗しました',
      googleSubmit: '🔍 Googleで続ける',
      signupPrompt: 'アカウントをお持ちでないですか？',
      signupLink: '登録',
      agreementPrefix: 'ログインすると、Dopamemeの',
      agreementMiddle: 'および',
      agreementSuffix: 'に同意したものとみなされます。',
    },
    signup: {
      badge: '✨ 登録',
      title: '予測を始めましょう',
      subtitlePrefix: '無料登録で',
      subtitleSuffix: 'を受け取れます',
      nicknameLabel: 'ニックネーム',
      nicknamePlaceholder: 'ランダムなニックネームが自動入力されます',
      nicknameHelp: 'ランダムなニックネームを生成しました。登録前に編集できます（最大12文字）。',
      passwordPlaceholder: '8文字以上',
      passwordConfirmLabel: 'パスワード確認',
      passwordConfirmPlaceholder: 'パスワードを再入力',
      submit: '登録',
      submitting: '登録中...',
      passwordMismatchError: 'パスワードが一致しません',
      passwordTooShortError: 'パスワードは8文字以上で入力してください',
      genericError: '登録中にエラーが発生しました',
      googleSubmit: '🔍 Googleで始める',
      loginPrompt: 'すでにアカウントをお持ちですか？',
      loginLink: 'ログイン',
      agreementPrefix: '登録すると、Dopamemeの',
      agreementMiddle: 'および',
      agreementSuffix: 'に同意したものとみなされます。',
      successTitle: '登録完了',
      successBodyPrefix: 'ウェルカムボーナスが付与されました。',
      successBodySuffix: 'まもなくログインページへ移動します。',
      successLogin: 'ログインへ',
    },
  },
}

export const landingCopy: Record<Locale, {
  heroBadge: string
  heroLine1: string
  heroLine2: string
  subtitleLine1: string
  subtitleLine2Prefix: string
  subtitleLine2Suffix: string
  startCta: string
  stats: Array<{ value: string; label: string }>
  features: Array<{ icon: string; title: string; body: string }>
  activeMarketsTitle: string
  activeMarketsSubtitle: string
  totalPrefix: string
  endsAtSuffix: string
  allMarketsCta: string
  futureTitle: string
  futureSubtitle: string
  news: Array<{ badge: string; date: string; title: string; body: string; footer: string }>
  marketStats: Array<{ value: string; label: string }>
  howTitle: string
  steps: Array<{ title: string; body: string }>
  ctaTitle: string
  ctaBodyPrefix: string
  ctaBodySuffix: string
  ctaButton: string
  footerTagline: string
  serviceTitle: string
  infoTitle: string
  footerLinks: {
    activity: string
    markets: string
    leaderboard: string
    about: string
    terms: string
    privacy: string
  }
}> = {
  ko: {
    heroBadge: '🎮 게임처럼 즐기는 예측 플랫폼',
    heroLine1: '세상의 모든 이슈',
    heroLine2: '예측하고 즐겨라',
    subtitleLine1: '정치, 경제, 스포츠, 연예까지!',
    subtitleLine2Prefix: '당신의 예측으로',
    subtitleLine2Suffix: '을 획득하세요',
    startCta: '지금 시작하기 →',
    stats: [
      { value: '10,000+', label: '활성 사용자' },
      { value: '500+', label: '예측 마켓' },
      { value: '95%', label: '만족도' },
    ],
    features: [
      { icon: '🎮', title: '게임처럼 즐기는 예측', body: '게임용 포인트 시스템으로 부담 없이 예측 게임을 즐기세요' },
      { icon: '💰', title: '도파밈(DPMM) 획득', body: '출석, 예측 참여, 성공 보상 등 다양한 방법으로 포인트를 얻으세요' },
      { icon: '🏆', title: '명예와 보상', body: '예측 실력을 증명하고 순위표 상위권에 도전해 특별한 보상을 획득하세요' },
    ],
    activeMarketsTitle: '지금 진행중인 예측',
    activeMarketsSubtitle: '실시간으로 참여하고 있는 핫한 예측들',
    totalPrefix: '총',
    endsAtSuffix: '마감',
    allMarketsCta: '모든 예측 보기 →',
    futureTitle: '예측 시장의 미래',
    futureSubtitle: '글로벌 예측 시장은 빠르게 성장하고 있으며, 첨단 기술로 더욱 정교해지고 있습니다',
    news: [
      {
        badge: 'MARKET INSIGHT',
        date: '2024.12',
        title: '글로벌 예측 시장 규모 580억 달러 돌파',
        body: '블룸버그 리서치에 따르면, 2024년 글로벌 예측 시장 규모는 580억 달러를 넘어섰으며, 2030년까지 연평균 23.4% 성장이 예상됩니다.',
        footer: '📈 연평균 23.4% 성장 전망',
      },
      {
        badge: 'TECHNOLOGY',
        date: '2024.11',
        title: 'AI 기반 예측 알고리즘의 혁신',
        body: 'MIT 연구진이 개발한 베이지안 추론과 머신러닝을 결합한 LMSR 알고리즘은 예측 정확도를 87%까지 향상시켰습니다.',
        footer: '🤖 정확도 87% 달성',
      },
      {
        badge: 'INDUSTRY',
        date: '2024.10',
        title: '한국, 예측 시장 규제 완화 논의',
        body: '금융위원회는 게임형 예측 플랫폼에 대한 규제 샌드박스를 검토 중입니다. 포인트 기반 시스템은 사행성 규제에서 제외될 전망입니다.',
        footer: '🇰🇷 규제 샌드박스 추진',
      },
    ],
    marketStats: [
      { value: '$580B', label: '글로벌 시장 규모' },
      { value: '23.4%', label: '연평균 성장률' },
      { value: '87%', label: 'AI 예측 정확도' },
      { value: '150M+', label: '전세계 사용자' },
    ],
    howTitle: '도파밈, 이렇게 즐기세요!',
    steps: [
      { title: '회원가입', body: '간편하게 가입하고 웰컴 보너스 받기' },
      { title: '마켓 선택', body: '관심있는 이슈의 예측 마켓 찾기' },
      { title: '예측 참여', body: 'DPMM으로 Yes/No 지분 구매하기' },
      { title: '보상 획득', body: '예측 성공 시 DPMM 보상 받기' },
    ],
    ctaTitle: '지금 바로 시작하세요!',
    ctaBodyPrefix: '무료 가입하고',
    ctaBodySuffix: '웰컴 보너스를 받아가세요',
    ctaButton: '무료로 시작하기 →',
    footerTagline: '게임처럼 즐기는 예측 플랫폼',
    serviceTitle: '서비스',
    infoTitle: '정보',
    footerLinks: {
      activity: '내 활동',
      markets: '예측 시장',
      leaderboard: '순위표',
      about: '도파밈 소개',
      terms: '이용약관',
      privacy: '개인정보처리방침',
    },
  },
  en: {
    heroBadge: '🎮 Prediction gaming for real-world events',
    heroLine1: 'Predict the issues',
    heroLine2: 'everyone is watching',
    subtitleLine1: 'Politics, markets, sports, entertainment, and more.',
    subtitleLine2Prefix: 'Earn',
    subtitleLine2Suffix: 'with your calls',
    startCta: 'Start now →',
    stats: [
      { value: '10,000+', label: 'Active users' },
      { value: '500+', label: 'Prediction markets' },
      { value: '95%', label: 'Satisfaction' },
    ],
    features: [
      { icon: '🎮', title: 'Predictions that play like a game', body: 'Use game points to join markets without financial risk.' },
      { icon: '💰', title: 'Earn Dopameme (DPMM)', body: 'Collect points through check-ins, predictions, and successful outcomes.' },
      { icon: '🏆', title: 'Status and rewards', body: 'Prove your forecasting skill and climb the leaderboard.' },
    ],
    activeMarketsTitle: 'Live predictions now',
    activeMarketsSubtitle: 'Hot markets people are joining in real time',
    totalPrefix: 'Total',
    endsAtSuffix: 'ends',
    allMarketsCta: 'View all markets →',
    futureTitle: 'The future of prediction markets',
    futureSubtitle: 'Global prediction markets are growing fast and becoming more precise with modern technology.',
    news: [
      {
        badge: 'MARKET INSIGHT',
        date: '2024.12',
        title: 'Global prediction market passes $580B',
        body: 'Bloomberg Research estimates the global prediction market exceeded $580B in 2024, with 23.4% CAGR expected through 2030.',
        footer: '📈 23.4% CAGR outlook',
      },
      {
        badge: 'TECHNOLOGY',
        date: '2024.11',
        title: 'AI forecasting algorithms advance',
        body: 'Bayesian inference and LMSR-style machine learning models are improving forecasting accuracy across event markets.',
        footer: '🤖 87% accuracy benchmark',
      },
      {
        badge: 'INDUSTRY',
        date: '2024.10',
        title: 'Korea discusses prediction-market sandbox',
        body: 'Regulators are reviewing sandbox models for game-style prediction platforms where points are not cash equivalents.',
        footer: '🇰🇷 Sandbox momentum',
      },
    ],
    marketStats: [
      { value: '$580B', label: 'Global market size' },
      { value: '23.4%', label: 'CAGR' },
      { value: '87%', label: 'AI forecast accuracy' },
      { value: '150M+', label: 'Users worldwide' },
    ],
    howTitle: 'How Dopameme works',
    steps: [
      { title: 'Sign up', body: 'Create an account and receive a welcome bonus.' },
      { title: 'Pick a market', body: 'Find a prediction market for the issue you care about.' },
      { title: 'Make a prediction', body: 'Use DPMM to buy Yes/No positions.' },
      { title: 'Earn rewards', body: 'Get DPMM rewards when your prediction wins.' },
    ],
    ctaTitle: 'Start predicting today',
    ctaBodyPrefix: 'Join for free and claim',
    ctaBodySuffix: 'as your welcome bonus',
    ctaButton: 'Start free →',
    footerTagline: 'Prediction gaming for real-world events',
    serviceTitle: 'Service',
    infoTitle: 'Info',
    footerLinks: {
      activity: 'My activity',
      markets: 'Prediction markets',
      leaderboard: 'Leaderboard',
      about: 'About Dopameme',
      terms: 'Terms',
      privacy: 'Privacy',
    },
  },
  ja: {
    heroBadge: '🎮 ゲーム感覚の予測プラットフォーム',
    heroLine1: '世界の話題を',
    heroLine2: '予測して楽しもう',
    subtitleLine1: '政治、経済、スポーツ、エンタメまで。',
    subtitleLine2Prefix: 'あなたの予測で',
    subtitleLine2Suffix: 'を獲得しましょう',
    startCta: '今すぐ始める →',
    stats: [
      { value: '10,000+', label: 'アクティブユーザー' },
      { value: '500+', label: '予測マーケット' },
      { value: '95%', label: '満足度' },
    ],
    features: [
      { icon: '🎮', title: 'ゲームのように楽しむ予測', body: 'ゲーム用ポイントで、気軽に予測マーケットへ参加できます。' },
      { icon: '💰', title: 'Dopameme (DPMM) を獲得', body: 'ログイン、予測参加、的中報酬などでポイントを獲得できます。' },
      { icon: '🏆', title: '名誉とリワード', body: '予測力を証明し、ランキング上位を目指しましょう。' },
    ],
    activeMarketsTitle: '進行中の予測',
    activeMarketsSubtitle: 'リアルタイムで参加されている注目マーケット',
    totalPrefix: '合計',
    endsAtSuffix: '締切',
    allMarketsCta: 'すべての予測を見る →',
    futureTitle: '予測市場の未来',
    futureSubtitle: 'グローバルな予測市場は急速に成長し、テクノロジーによってさらに精密になっています。',
    news: [
      {
        badge: 'MARKET INSIGHT',
        date: '2024.12',
        title: '世界の予測市場が5800億ドル規模に',
        body: '調査によると、2024年の世界予測市場は5800億ドルを超え、2030年まで年平均23.4%の成長が見込まれています。',
        footer: '📈 年平均23.4%成長見通し',
      },
      {
        badge: 'TECHNOLOGY',
        date: '2024.11',
        title: 'AI予測アルゴリズムの進化',
        body: 'ベイズ推論とLMSR型モデルを組み合わせた機械学習により、イベント予測の精度が向上しています。',
        footer: '🤖 87%精度ベンチマーク',
      },
      {
        badge: 'INDUSTRY',
        date: '2024.10',
        title: '韓国で予測市場サンドボックスを議論',
        body: 'ポイント型のゲーム予測プラットフォームに対する規制サンドボックスが検討されています。',
        footer: '🇰🇷 サンドボックス推進',
      },
    ],
    marketStats: [
      { value: '$580B', label: '世界市場規模' },
      { value: '23.4%', label: '年平均成長率' },
      { value: '87%', label: 'AI予測精度' },
      { value: '150M+', label: '世界のユーザー' },
    ],
    howTitle: 'Dopamemeの楽しみ方',
    steps: [
      { title: '登録', body: '簡単に登録してウェルカムボーナスを受け取ります。' },
      { title: 'マーケット選択', body: '関心のある話題の予測マーケットを探します。' },
      { title: '予測参加', body: 'DPMMでYes/Noポジションを購入します。' },
      { title: '報酬獲得', body: '予測が当たるとDPMM報酬を獲得できます。' },
    ],
    ctaTitle: '今すぐ始めましょう',
    ctaBodyPrefix: '無料登録で',
    ctaBodySuffix: 'ウェルカムボーナスを受け取れます',
    ctaButton: '無料で始める →',
    footerTagline: 'ゲーム感覚の予測プラットフォーム',
    serviceTitle: 'サービス',
    infoTitle: '情報',
    footerLinks: {
      activity: 'マイ活動',
      markets: '予測マーケット',
      leaderboard: 'ランキング',
      about: 'Dopamemeについて',
      terms: '利用規約',
      privacy: 'プライバシー',
    },
  },
}

export const marketsCopy: Record<Locale, {
  heroBadge: string
  title: string
  subtitle: string
  adminCreate: string
  allCategory: string
  allRegion: string
  emptyTitle: string
  emptyBody: string
  overseasBadge: string
  resolvedBadge: string
  endedBadge: string
  hiddenBadge: string
  totalPrefix: string
  endsAtSuffix: string
  participantsLabel: string
  participantUnit: string
  totalAmountLabel: string
  closesAtLabel: string
}> = {
  ko: {
    heroBadge: '🎯 예측 시장',
    title: '다양한 이슈에 예측하세요',
    subtitle: '국내와 해외 이슈를 넘나드는 예측 시장에서 DPMM을 획득하세요',
    adminCreate: '+ 새 예측 시장 생성',
    allCategory: '전체',
    allRegion: '전체 지역',
    emptyTitle: '조건에 맞는 예측 시장이 없습니다',
    emptyBody: '다른 카테고리나 지역 필터를 선택해보세요.',
    overseasBadge: '해외 이슈',
    resolvedBadge: '결과 확정',
    endedBadge: '마감됨',
    hiddenBadge: '가려짐',
    totalPrefix: '총',
    endsAtSuffix: '마감',
    participantsLabel: '총 참여자',
    participantUnit: '명',
    totalAmountLabel: '총 베팅액',
    closesAtLabel: '마감',
  },
  en: {
    heroBadge: '🎯 Prediction markets',
    title: 'Predict across global issues',
    subtitle: 'Join Korean and overseas markets, then earn DPMM with your calls.',
    adminCreate: '+ Create market',
    allCategory: 'All',
    allRegion: 'All regions',
    emptyTitle: 'No markets match these filters',
    emptyBody: 'Try another category or region filter.',
    overseasBadge: 'Overseas issue',
    resolvedBadge: 'Resolved',
    endedBadge: 'Ended',
    hiddenBadge: 'Hidden',
    totalPrefix: 'Total',
    endsAtSuffix: 'ends',
    participantsLabel: 'Participants',
    participantUnit: '',
    totalAmountLabel: 'Total volume',
    closesAtLabel: 'Closes',
  },
  ja: {
    heroBadge: '🎯 予測マーケット',
    title: '世界の話題を予測しましょう',
    subtitle: '韓国と海外のマーケットに参加し、予測でDPMMを獲得しましょう。',
    adminCreate: '+ マーケット作成',
    allCategory: 'すべて',
    allRegion: 'すべての地域',
    emptyTitle: '条件に合う予測マーケットがありません',
    emptyBody: '別のカテゴリまたは地域フィルターを選択してください。',
    overseasBadge: '海外トピック',
    resolvedBadge: '結果確定',
    endedBadge: '締切済み',
    hiddenBadge: '非表示',
    totalPrefix: '合計',
    endsAtSuffix: '締切',
    participantsLabel: '参加者',
    participantUnit: '人',
    totalAmountLabel: '総ベット額',
    closesAtLabel: '締切',
  },
}

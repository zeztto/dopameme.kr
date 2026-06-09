import { config } from 'dotenv'
import { resolve } from 'path'

// 직접 실행 시 DATABASE_URL이 없으면 로컬 개발 환경 변수를 보조로 로드합니다.
if (!process.env.DATABASE_URL) {
  config({ path: resolve(process.cwd(), '.env.local') })
}

import { prisma } from '@/lib/db'
import {
  DEFAULT_MARKET_REGION,
  getDefaultLanguageForRegion,
  getDefaultTimeZoneForRegion,
} from '@/lib/markets/regions'

type MarketSeed = {
  category: string
  title: string
  description: string
  options: string[]
  daysUntilEnd: number
  region?: string
  languageCode?: string
  timeZone?: string
}

// 예측 시장 데이터
export const marketData: MarketSeed[] = [
  // 정치 (10개)
  {
    category: '정치',
    title: '2025년 국회의원 재보궐선거, 여당이 과반 획득할까?',
    description: '2025년 상반기 예정된 국회의원 재보궐선거에서 여당이 과반 이상의 의석을 차지할 것인지 예측하는 시장입니다.',
    options: ['예', '아니오'],
    daysUntilEnd: 45,
  },
  {
    category: '정치',
    title: '미국 대선, 트럼프가 재선에 성공할까?',
    description: '2024년 미국 대선에서 도널드 트럼프가 재선에 성공할지 예측합니다.',
    options: ['트럼프 승리', '민주당 승리'],
    daysUntilEnd: 120,
  },
  {
    category: '정치',
    title: '다음 총선에서 제3당이 캐스팅보트를 쥘까?',
    description: '차기 총선에서 제3당이 의회에서 결정적 역할을 할지 예측합니다.',
    options: ['예', '아니오'],
    daysUntilEnd: 180,
  },
  {
    category: '정치',
    title: '2025년 내 개헌 논의가 본격화될까?',
    description: '올해 안에 개헌 논의가 국회에서 본격적으로 시작될지 예측합니다.',
    options: ['예', '아니오'],
    daysUntilEnd: 90,
  },
  {
    category: '정치',
    title: '북미 정상회담이 올해 열릴까?',
    description: '2025년 내에 북한과 미국 간 정상회담이 개최될지 예측합니다.',
    options: ['예', '아니오'],
    daysUntilEnd: 150,
  },
  {
    category: '정치',
    title: '다음 서울시장은?',
    description: '차기 서울시장 선거 결과를 예측합니다.',
    options: ['여당 후보', '야당 후보', '무소속 후보'],
    daysUntilEnd: 200,
  },
  {
    category: '정치',
    title: '2025년 지방선거, 수도권에서 야당이 우세할까?',
    description: '올해 지방선거에서 수도권 지역의 승자를 예측합니다.',
    options: ['예', '아니오'],
    daysUntilEnd: 100,
  },
  {
    category: '정치',
    title: '일본 총선, 자민당이 과반 유지할까?',
    description: '차기 일본 중의원 선거에서 자민당의 과반 유지 여부를 예측합니다.',
    options: ['과반 유지', '과반 상실'],
    daysUntilEnd: 80,
  },
  {
    category: '정치',
    title: '영국 총선, 노동당이 집권할까?',
    description: '차기 영국 총선에서 노동당의 집권 가능성을 예측합니다.',
    options: ['노동당 승리', '보수당 승리', '기타 정당'],
    daysUntilEnd: 60,
  },
  {
    category: '정치',
    title: '프랑스 대선, 마크롱 후계자는?',
    description: '차기 프랑스 대선에서 승리할 정치인을 예측합니다.',
    options: ['중도 진영', '우파 진영', '좌파 진영'],
    daysUntilEnd: 250,
  },

  // 경제 (10개)
  {
    category: '경제',
    title: '비트코인이 2025년 내 10만 달러를 돌파할까?',
    description: '2025년 안에 비트코인 가격이 10만 달러를 넘을지 예측합니다.',
    options: ['예', '아니오'],
    daysUntilEnd: 180,
  },
  {
    category: '경제',
    title: '한국은행 기준금리, 2025년 말 수준은?',
    description: '2025년 12월 한국은행 기준금리 수준을 예측합니다.',
    options: ['3.0% 이상', '2.5~2.99%', '2.5% 미만'],
    daysUntilEnd: 365,
  },
  {
    category: '경제',
    title: '삼성전자 주가, 연말까지 10만원 돌파할까?',
    description: '2025년 말까지 삼성전자 주가가 10만원을 넘을지 예측합니다.',
    options: ['예', '아니오'],
    daysUntilEnd: 300,
  },
  {
    category: '경제',
    title: '원달러 환율, 올해 1,400원 돌파할까?',
    description: '2025년 내 원달러 환율이 1,400원을 넘을지 예측합니다.',
    options: ['예', '아니오'],
    daysUntilEnd: 200,
  },
  {
    category: '경제',
    title: '테슬라 시가총액, 애플을 추월할까?',
    description: '2025년 내 테슬라의 시가총액이 애플을 넘어설지 예측합니다.',
    options: ['예', '아니오'],
    daysUntilEnd: 270,
  },
  {
    category: '경제',
    title: '국내 소비자물가 상승률, 연말까지 2% 이하로 안정될까?',
    description: '2025년 12월 소비자물가 상승률이 2% 이하가 될지 예측합니다.',
    options: ['예', '아니오'],
    daysUntilEnd: 330,
  },
  {
    category: '경제',
    title: '부동산 시장, 올해 회복세를 보일까?',
    description: '2025년 국내 부동산 시장이 회복세로 전환될지 예측합니다.',
    options: ['예', '아니오'],
    daysUntilEnd: 150,
  },
  {
    category: '경제',
    title: '넷플릭스가 디즈니+ 구독자 수를 추월할까?',
    description: '2025년 내 넷플릭스의 전세계 구독자 수가 디즈니+를 넘어설지 예측합니다.',
    options: ['예', '아니오'],
    daysUntilEnd: 240,
  },
  {
    category: '경제',
    title: '애플이 자체 검색엔진을 출시할까?',
    description: '2025년 내 애플이 구글을 대체할 자체 검색엔진을 발표할지 예측합니다.',
    options: ['예', '아니오'],
    daysUntilEnd: 280,
  },
  {
    category: '경제',
    title: '국내 최저임금, 1만원 시대 돌입할까?',
    description: '2026년 적용 최저임금이 시간당 1만원 이상으로 결정될지 예측합니다.',
    options: ['예', '아니오'],
    daysUntilEnd: 120,
  },

  // 스포츠 (10개)
  {
    category: '스포츠',
    title: '2026 월드컵 우승팀은?',
    description: '2026 FIFA 월드컵 우승 국가를 예측합니다.',
    options: ['브라질', '아르헨티나', '프랑스', '기타 국가'],
    daysUntilEnd: 450,
  },
  {
    category: '스포츠',
    title: 'KBO 2025 시즌 우승팀은?',
    description: '2025 KBO 리그 우승팀을 예측합니다.',
    options: ['KIA', 'LG', '삼성', '기타 팀'],
    daysUntilEnd: 210,
  },
  {
    category: '스포츠',
    title: '손흥민이 EPL 득점왕을 차지할까?',
    description: '2024-25 시즌 EPL에서 손흥민이 득점왕을 차지할지 예측합니다.',
    options: ['예', '아니오'],
    daysUntilEnd: 90,
  },
  {
    category: '스포츠',
    title: '2025 챔피언스리그 우승팀은?',
    description: '2024-25 시즌 UEFA 챔피언스리그 우승팀을 예측합니다.',
    options: ['맨시티', '레알 마드리드', 'PSG', '기타 팀'],
    daysUntilEnd: 150,
  },
  {
    category: '스포츠',
    title: 'NBA 2025 챔피언은?',
    description: '2024-25 시즌 NBA 챔피언십 우승팀을 예측합니다.',
    options: ['보스턴', 'LA 레이커스', '덴버', '기타 팀'],
    daysUntilEnd: 180,
  },
  {
    category: '스포츠',
    title: '메이저리그, 오타니가 MVP를 또 받을까?',
    description: '2025 시즌 메이저리그에서 오타니 쇼헤이가 MVP를 수상할지 예측합니다.',
    options: ['예', '아니오'],
    daysUntilEnd: 250,
  },
  {
    category: '스포츠',
    title: '2025 전미 오픈 남자 단식 우승자는?',
    description: '2025 US 오픈 테니스 남자 단식 우승자를 예측합니다.',
    options: ['조코비치', '알카라스', '시너', '기타 선수'],
    daysUntilEnd: 220,
  },
  {
    category: '스포츠',
    title: '한국 축구 국가대표팀, 2026 월드컵 본선 진출할까?',
    description: '한국이 2026 FIFA 월드컵 본선에 진출할지 예측합니다.',
    options: ['예', '아니오'],
    daysUntilEnd: 300,
  },
  {
    category: '스포츠',
    title: 'F1 2025 드라이버 챔피언은?',
    description: '2025 시즌 포뮬러 원 드라이버 챔피언을 예측합니다.',
    options: ['페르스타펜', '해밀턴', '르클레르', '기타 드라이버'],
    daysUntilEnd: 280,
  },
  {
    category: '스포츠',
    title: '2025 윔블던 여자 단식 우승자는?',
    description: '2025 윔블던 테니스 여자 단식 우승자를 예측합니다.',
    options: ['스비아텍', '사발렌카', '가우프', '기타 선수'],
    daysUntilEnd: 160,
  },

  // 연예 (10개)
  {
    category: '연예',
    title: '2025 아카데미 작품상 수상작은?',
    description: '제97회 아카데미 시상식 작품상 수상작을 예측합니다.',
    options: ['오펜하이머', '킬러스 오브 더 플라워 문', '바비', '기타 작품'],
    daysUntilEnd: 60,
  },
  {
    category: '연예',
    title: 'BTS 완전체 컴백이 2025년에 이뤄질까?',
    description: 'BTS 멤버 전원의 군 복무 완료 후 완전체 컴백이 올해 이뤄질지 예측합니다.',
    options: ['예', '아니오'],
    daysUntilEnd: 200,
  },
  {
    category: '연예',
    title: '넷플릭스 오리지널 한국 드라마가 에미상을 받을까?',
    description: '2025년 에미상에서 넷플릭스 한국 오리지널이 수상할지 예측합니다.',
    options: ['예', '아니오'],
    daysUntilEnd: 250,
  },
  {
    category: '연예',
    title: '2025 그래미 올해의 앨범은?',
    description: '제67회 그래미 어워드 올해의 앨범 수상작을 예측합니다.',
    options: ['테일러 스위프트', '비욘세', 'SZA', '기타 아티스트'],
    daysUntilEnd: 45,
  },
  {
    category: '연예',
    title: '마블 시네마틱 유니버스 Phase 6, 흥행에 성공할까?',
    description: 'MCU Phase 6 첫 작품들의 박스오피스 성공 여부를 예측합니다.',
    options: ['예', '아니오'],
    daysUntilEnd: 180,
  },
  {
    category: '연예',
    title: '2025 칸 영화제 황금종려상은 한국 영화가 받을까?',
    description: '제78회 칸 영화제에서 한국 영화가 황금종려상을 수상할지 예측합니다.',
    options: ['예', '아니오'],
    daysUntilEnd: 130,
  },
  {
    category: '연예',
    title: '디즈니+가 국내 OTT 점유율 1위를 차지할까?',
    description: '2025년 말 기준 디즈니+가 국내 OTT 시장 점유율 1위가 될지 예측합니다.',
    options: ['예', '아니오'],
    daysUntilEnd: 300,
  },
  {
    category: '연예',
    title: '뉴진스가 빌보드 핫100 1위를 달성할까?',
    description: '2025년 내 뉴진스가 빌보드 핫100 차트 1위를 기록할지 예측합니다.',
    options: ['예', '아니오'],
    daysUntilEnd: 220,
  },
  {
    category: '연예',
    title: '블랙핑크 재계약이 성사될까?',
    description: '블랙핑크 멤버 전원의 YG와 재계약 성사 여부를 예측합니다.',
    options: ['전원 재계약', '일부 재계약', '전원 불발'],
    daysUntilEnd: 90,
  },
  {
    category: '연예',
    title: '2025 골든글로브 드라마 부문 작품상은?',
    description: '제82회 골든글로브 시상식 드라마 부문 작품상 수상작을 예측합니다.',
    options: ['succession', 'The Last of Us', 'The Crown', '기타 작품'],
    daysUntilEnd: 30,
  },

  // 기술 (10개)
  {
    category: '기술',
    title: 'GPT-5가 2025년 내 출시될까?',
    description: 'OpenAI가 2025년 안에 GPT-5를 정식 출시할지 예측합니다.',
    options: ['예', '아니오'],
    daysUntilEnd: 270,
  },
  {
    category: '기술',
    title: '애플 비전 프로가 국내 출시될까?',
    description: 'Apple Vision Pro가 2025년 내 한국에 정식 출시될지 예측합니다.',
    options: ['예', '아니오'],
    daysUntilEnd: 200,
  },
  {
    category: '기술',
    title: '삼성전자가 3나노 공정 양산에 성공할까?',
    description: '삼성전자가 2025년 내 3나노 반도체 공정 대량 양산에 성공할지 예측합니다.',
    options: ['예', '아니오'],
    daysUntilEnd: 240,
  },
  {
    category: '기술',
    title: '테슬라 완전자율주행이 레벨5를 달성할까?',
    description: '테슬라 FSD가 2025년 내 레벨5 자율주행을 인증받을지 예측합니다.',
    options: ['예', '아니오'],
    daysUntilEnd: 300,
  },
  {
    category: '기술',
    title: '메타가 AR 글래스를 상용화할까?',
    description: 'Meta가 2025년 내 증강현실 안경을 일반 소비자용으로 출시할지 예측합니다.',
    options: ['예', '아니오'],
    daysUntilEnd: 280,
  },
  {
    category: '기술',
    title: 'SpaceX 스타십이 달 착륙에 성공할까?',
    description: 'SpaceX의 스타십이 2025년 내 달 표면 착륙에 성공할지 예측합니다.',
    options: ['예', '아니오'],
    daysUntilEnd: 320,
  },
  {
    category: '기술',
    title: '양자컴퓨터가 실용화 단계에 진입할까?',
    description: '2025년 내 상용 양자컴퓨터가 실제 업무에 활용되기 시작할지 예측합니다.',
    options: ['예', '아니오'],
    daysUntilEnd: 260,
  },
  {
    category: '기술',
    title: '국내 AI 반도체 기업이 글로벌 TOP10에 진입할까?',
    description: '한국 AI 반도체 기업이 2025년 내 세계 시장점유율 10위 안에 들지 예측합니다.',
    options: ['예', '아니오'],
    daysUntilEnd: 330,
  },
  {
    category: '기술',
    title: '6G 통신 기술이 상용화될까?',
    description: '2025년 내 6세대 이동통신 기술이 일부 지역에서 상용화될지 예측합니다.',
    options: ['예', '아니오'],
    daysUntilEnd: 310,
  },
  {
    category: '기술',
    title: '휴머노이드 로봇이 가정용으로 출시될까?',
    description: '2025년 내 휴머노이드 로봇이 일반 가정용으로 판매되기 시작할지 예측합니다.',
    options: ['예', '아니오'],
    daysUntilEnd: 290,
  },
  {
    category: '국제',
    region: 'US',
    languageCode: 'en',
    title: 'Will the U.S. Fed cut rates at least twice this year?',
    description: 'A market for forecasting whether the Federal Reserve will announce two or more benchmark rate cuts before year-end.',
    options: ['Yes', 'No'],
    daysUntilEnd: 210,
  },
  {
    category: '국제',
    region: 'US',
    languageCode: 'en',
    title: 'Will a major U.S. AI regulation bill pass this year?',
    description: 'Predict whether a federal AI regulation package will pass both chambers of Congress before year-end.',
    options: ['Passes', 'Does not pass'],
    daysUntilEnd: 260,
  },
  {
    category: '국제',
    region: 'JP',
    languageCode: 'ja',
    title: '日本銀行は年内に追加利上げを行うか？',
    description: '日本銀行が年内に追加利上げを発表するかを予測するマーケットです。',
    options: ['行う', '行わない'],
    daysUntilEnd: 230,
  },
  {
    category: '국제',
    region: 'JP',
    languageCode: 'ja',
    title: '日本の次期総選挙で与党が過半数を維持するか？',
    description: '次期衆議院選挙で与党が単独または連立で過半数を維持できるかを予測します。',
    options: ['維持する', '維持しない'],
    daysUntilEnd: 320,
  },
  {
    category: '국제',
    region: 'EU',
    languageCode: 'en',
    title: 'Will the EU approve a new digital market fine over €1B?',
    description: 'Forecast whether EU regulators will announce a digital market enforcement fine exceeding €1B this year.',
    options: ['Yes', 'No'],
    daysUntilEnd: 275,
  },
  {
    category: '국제',
    region: 'GLOBAL',
    languageCode: 'en',
    title: 'Will a global top-10 crypto asset double from its January open?',
    description: 'Predict whether any cryptocurrency ranked in the global top 10 by market cap doubles from its January opening price this year.',
    options: ['Yes', 'No'],
    daysUntilEnd: 300,
  },
]

export async function seedMockMarkets(adminId: string) {
  let createdCount = 0
  let existingCount = 0

  for (const data of marketData) {
    // 마감 시간 계산
    const endsAt = new Date()
    endsAt.setDate(endsAt.getDate() + data.daysUntilEnd)

    const existingMarket = await prisma.market.findFirst({
      where: {
        title: data.title,
        source: 'mock',
      },
      include: { options: true },
    })

    if (existingMarket) {
      const region = data.region || DEFAULT_MARKET_REGION

      await prisma.market.update({
        where: { id: existingMarket.id },
        data: {
          description: data.description,
          category: data.category,
          region,
          languageCode: data.languageCode || getDefaultLanguageForRegion(region),
          timeZone: data.timeZone || getDefaultTimeZoneForRegion(region),
        },
      })

      const existingOptionTitles = new Set(
        existingMarket.options.map((option) => option.title)
      )

      for (const optionTitle of data.options) {
        if (existingOptionTitles.has(optionTitle)) continue

        await prisma.marketOption.create({
          data: {
            marketId: existingMarket.id,
            title: optionTitle,
            totalPredictions: 0,
            totalAmount: 0,
          },
        })
      }

      existingCount++
      continue
    }

    // 마켓 생성
    const market = await prisma.market.create({
      data: {
        title: data.title,
        description: data.description,
        category: data.category,
        region: data.region || DEFAULT_MARKET_REGION,
        languageCode: data.languageCode || getDefaultLanguageForRegion(data.region),
        timeZone: data.timeZone || getDefaultTimeZoneForRegion(data.region),
        status: 'active',
        source: 'mock',
        hidden: false,
        creatorId: adminId,
        endsAt,
      },
    })

    console.log(`생성됨: ${market.title}`)

    // 옵션 생성
    for (const optionTitle of data.options) {
      await prisma.marketOption.create({
        data: {
          marketId: market.id,
          title: optionTitle,
          totalPredictions: 0,
          totalAmount: 0,
        },
      })
    }

    createdCount++
  }

  return { createdCount, existingCount, totalCount: marketData.length }
}

async function generateMarkets() {
  try {
    console.log('예측 시장 생성 시작...')
    console.log('DATABASE_URL:', process.env.DATABASE_URL ? '설정됨' : '미설정')

    // Admin 계정 찾기
    const adminUser = await prisma.user.findFirst({
      where: { role: 'admin' },
      select: { id: true },
    })

    if (!adminUser) {
      console.error('Admin 계정을 찾을 수 없습니다.')
      process.exit(1)
    }

    const adminId = adminUser.id
    console.log(`Admin ID: ${adminId}`)

    const { createdCount, existingCount } = await seedMockMarkets(adminId)

    console.log(`\n생성 ${createdCount}개, 기존 ${existingCount}개 확인 완료.`)
    process.exit(0)
  } catch (error) {
    console.error('에러 발생:', error)
    process.exit(1)
  }
}

if (require.main === module) {
  generateMarkets()
}

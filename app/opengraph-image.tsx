import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = '도파밈 - 세상의 모든 이슈 예측하고 즐겨라'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 128,
          background: 'linear-gradient(135deg, #FFFFFF 0%, #F3F4F6 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        {/* Background Decorative Circles */}
        <div
          style={{
            position: 'absolute',
            top: '-100px',
            left: '-100px',
            width: '400px',
            height: '400px',
            background: '#2563EB',
            borderRadius: '50%',
            opacity: 0.1,
            display: 'flex',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-150px',
            right: '-150px',
            width: '500px',
            height: '500px',
            background: '#DC2626',
            borderRadius: '50%',
            opacity: 0.1,
            display: 'flex',
          }}
        />

        {/* Badge */}
        <div
          style={{
            fontSize: 18,
            fontWeight: 900,
            color: '#FFFFFF',
            background: '#2563EB',
            padding: '12px 32px',
            borderRadius: 50,
            marginBottom: 40,
            display: 'flex',
          }}
        >
          🎮 게임처럼 즐기는 예측 플랫폼
        </div>

        {/* Logo */}
        <div style={{ fontSize: 100, fontWeight: 900, marginBottom: 30, display: 'flex' }}>
          <span style={{ color: '#2563EB' }}>도</span>
          <span style={{ color: '#DC2626' }}>파</span>
          <span style={{ color: '#2563EB' }}>밈</span>
        </div>

        {/* Tagline */}
        <div style={{ fontSize: 36, fontWeight: 700, color: '#1F2937', marginBottom: 50, display: 'flex' }}>
          세상의 모든 이슈 예측하고 즐겨라
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: 40 }}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '20px 30px',
              background: '#FFFFFF',
              borderRadius: 20,
              border: '3px solid #2563EB',
            }}
          >
            <div style={{ fontSize: 32, fontWeight: 900, color: '#2563EB', marginBottom: 5 }}>
              10,000+
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#6B7280' }}>
              활성 사용자
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '20px 30px',
              background: '#FFFFFF',
              borderRadius: 20,
              border: '3px solid #10B981',
            }}
          >
            <div style={{ fontSize: 32, fontWeight: 900, color: '#10B981', marginBottom: 5 }}>
              500+
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#6B7280' }}>
              예측 마켓
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '20px 30px',
              background: '#FFFFFF',
              borderRadius: 20,
              border: '3px solid #DC2626',
            }}
          >
            <div style={{ fontSize: 32, fontWeight: 900, color: '#DC2626', marginBottom: 5 }}>
              95%
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#6B7280' }}>
              만족도
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}

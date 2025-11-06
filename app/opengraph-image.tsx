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
          background: '#DC2626',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ fontSize: 80, fontWeight: 900, marginBottom: 20, display: 'flex' }}>
          <span style={{ color: '#2563EB' }}>도</span>
          <span style={{ color: '#FFFFFF' }}>파</span>
          <span style={{ color: '#2563EB' }}>밈</span>
        </div>
        <div style={{ fontSize: 40, fontWeight: 600, opacity: 0.9 }}>
          세상의 모든 이슈 예측하고 즐겨라
        </div>
        <div
          style={{
            fontSize: 24,
            marginTop: 40,
            padding: '15px 40px',
            background: '#2563EB',
            borderRadius: 50,
          }}
        >
          🎮 게임처럼 즐기는 예측 플랫폼
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}

type MarketPriceChartPoint = {
  createdAt: string
  probabilityBps: number
}

type MarketPriceChartSeries = {
  optionId: string
  title: string
  currentBps: number
  points: MarketPriceChartPoint[]
}

type MarketPriceChartProps = {
  series: MarketPriceChartSeries[]
}

const CHART_WIDTH = 640
const CHART_HEIGHT = 220
const PADDING = {
  top: 18,
  right: 18,
  bottom: 32,
  left: 42,
}
const COLORS = ['#6c5ce7', '#ff7675', '#00b894', '#fdcb6e', '#0984e3', '#e84393']

function formatPercent(probabilityBps: number) {
  return `${(probabilityBps / 100).toFixed(probabilityBps % 100 === 0 ? 0 : 1)}%`
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat('ko-KR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

export default function MarketPriceChart({ series }: MarketPriceChartProps) {
  if (series.length === 0) {
    return null
  }

  const allPoints = series.flatMap((item) => item.points)
  const timestamps = allPoints.map((point) => new Date(point.createdAt).getTime())
  const minTime = Math.min(...timestamps)
  const maxTime = Math.max(...timestamps)
  const plotWidth = CHART_WIDTH - PADDING.left - PADDING.right
  const plotHeight = CHART_HEIGHT - PADDING.top - PADDING.bottom

  const xFor = (createdAt: string) => {
    const timestamp = new Date(createdAt).getTime()

    if (minTime === maxTime) {
      return PADDING.left + plotWidth / 2
    }

    return PADDING.left + ((timestamp - minTime) / (maxTime - minTime)) * plotWidth
  }

  const yFor = (probabilityBps: number) => (
    PADDING.top + (1 - probabilityBps / 10_000) * plotHeight
  )

  return (
    <section className="mb-8 overflow-hidden rounded-dopameme-xl border-3 border-light-border bg-white shadow-token-md">
      <div className="border-b-3 border-light-border bg-light-bg-alt px-5 py-4">
        <h3 className="text-xl font-black text-text-primary">가격 차트</h3>
        <p className="mt-1 text-sm font-semibold text-text-tertiary">
          예측 참여와 부분 청산 이후 기록된 옵션 확률 흐름
        </p>
      </div>

      <div className="p-5">
        <div className="overflow-x-auto">
          <svg
            viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
            role="img"
            aria-label="옵션별 가격 확률 차트"
            className="h-auto min-w-[640px] max-w-full"
          >
            {[0, 2500, 5000, 7500, 10000].map((bps) => {
              const y = yFor(bps)

              return (
                <g key={bps}>
                  <line
                    x1={PADDING.left}
                    x2={CHART_WIDTH - PADDING.right}
                    y1={y}
                    y2={y}
                    stroke="#edf0f5"
                    strokeWidth="1"
                  />
                  <text
                    x={PADDING.left - 10}
                    y={y + 4}
                    textAnchor="end"
                    className="fill-text-tertiary text-[10px] font-bold"
                  >
                    {formatPercent(bps)}
                  </text>
                </g>
              )
            })}

            {series.map((item, index) => {
              const color = COLORS[index % COLORS.length]
              const points = item.points.map((point) => `${xFor(point.createdAt)},${yFor(point.probabilityBps)}`)

              return (
                <g key={item.optionId}>
                  {points.length > 1 && (
                    <polyline
                      points={points.join(' ')}
                      fill="none"
                      stroke={color}
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  )}
                  {item.points.map((point) => (
                    <circle
                      key={`${item.optionId}-${point.createdAt}-${point.probabilityBps}`}
                      cx={xFor(point.createdAt)}
                      cy={yFor(point.probabilityBps)}
                      r="4"
                      fill={color}
                      stroke="#fff"
                      strokeWidth="2"
                    />
                  ))}
                </g>
              )
            })}

            <line
              x1={PADDING.left}
              x2={CHART_WIDTH - PADDING.right}
              y1={CHART_HEIGHT - PADDING.bottom}
              y2={CHART_HEIGHT - PADDING.bottom}
              stroke="#d8dee9"
              strokeWidth="2"
            />
            <text
              x={PADDING.left}
              y={CHART_HEIGHT - 8}
              className="fill-text-tertiary text-[10px] font-bold"
            >
              {formatTime(new Date(minTime).toISOString())}
            </text>
            <text
              x={CHART_WIDTH - PADDING.right}
              y={CHART_HEIGHT - 8}
              textAnchor="end"
              className="fill-text-tertiary text-[10px] font-bold"
            >
              {formatTime(new Date(maxTime).toISOString())}
            </text>
          </svg>
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {series.map((item, index) => (
            <div
              key={item.optionId}
              className="flex items-center justify-between gap-3 rounded-dopameme-md bg-light-bg-alt px-3 py-2 text-sm"
            >
              <div className="flex min-w-0 items-center gap-2">
                <span
                  className="h-3 w-3 shrink-0 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="truncate font-bold text-text-primary">{item.title}</span>
              </div>
              <span className="font-black text-primary">{formatPercent(item.currentBps)}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

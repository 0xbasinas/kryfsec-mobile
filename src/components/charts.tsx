import { useState } from 'react'
import { View, type LayoutChangeEvent } from 'react-native'
import Svg, { Circle, Line, Rect, Text as SvgText } from 'react-native-svg'
import { useTheme, mix } from '@/theme'

/** Small bar chart of study hours per day (react-native-svg, MIT). */
export function StudyBars({ data, height = 120 }: { data: { label: string; hours: number }[]; height?: number }) {
  const t = useTheme()
  const [w, setW] = useState(0)
  const onLayout = (e: LayoutChangeEvent) => setW(e.nativeEvent.layout.width)
  const max = Math.max(1, ...data.map((d) => d.hours))
  const chartH = height - 20
  const gap = 5
  const barW = w > 0 ? (w - gap * (data.length - 1)) / data.length : 0
  return (
    <View onLayout={onLayout} style={{ height }}>
      {w > 0 && (
        <Svg width={w} height={height}>
          {[0.5, 1].map((f) => (
            <Line key={f} x1={0} x2={w} y1={chartH - chartH * f + 1} y2={chartH - chartH * f + 1} stroke={t.border} strokeWidth={1} strokeDasharray="3 4" />
          ))}
          {data.map((d, i) => {
            const h = d.hours > 0 ? Math.max(4, (d.hours / max) * (chartH - 4)) : 3
            const isToday = i === data.length - 1
            return (
              <Rect
                key={i}
                x={i * (barW + gap)}
                y={chartH - h}
                width={barW}
                height={h}
                rx={Math.min(5, barW / 2)}
                fill={d.hours > 0 ? (isToday ? t.accent : mix(t.accent, t.card, 0.62)) : t.card2}
              />
            )
          })}
          {data.map((d, i) =>
            i % 3 === data.length % 3 || i === data.length - 1 ? (
              <SvgText
                key={`l${i}`}
                x={i === data.length - 1 ? w : i * (barW + gap) + barW / 2}
                y={height - 3}
                fontSize={10}
                fill={t.faint}
                textAnchor={i === data.length - 1 ? 'end' : 'middle'}>
                {i === data.length - 1 ? 'Today' : d.label}
              </SvgText>
            ) : null
          )}
        </Svg>
      )}
    </View>
  )
}

/** Activity heatmap, one column per week (Mon→Sun). */
export function Heatmap({ cols }: { cols: { date: string; minutes: number; future: boolean }[][] }) {
  const t = useTheme()
  const [w, setW] = useState(0)
  const gap = 3
  const cell = w > 0 ? (w - gap * (cols.length - 1)) / cols.length : 0
  const h = cell * 7 + gap * 6
  const level = (m: number): string => {
    if (m <= 0) return t.card2
    if (m < 30) return mix(t.accent, t.card, 0.3)
    if (m < 60) return mix(t.accent, t.card, 0.52)
    if (m < 90) return mix(t.accent, t.card, 0.75)
    return t.accent
  }
  return (
    <View onLayout={(e) => setW(e.nativeEvent.layout.width)} style={{ minHeight: 60 }}>
      {w > 0 && (
        <Svg width={w} height={h}>
          {cols.map((col, x) =>
            col.map((c, y) =>
              c.future ? null : (
                <Rect key={c.date} x={x * (cell + gap)} y={y * (cell + gap)} width={cell} height={cell} rx={Math.min(3, cell / 3)} fill={level(c.minutes)} />
              )
            )
          )}
        </Svg>
      )}
    </View>
  )
}

/** Small progress ring. */
export function Ring({ value, size = 64, stroke = 6, color }: { value: number; size?: number; stroke?: number; color?: string }) {
  const t = useTheme()
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const v = Math.max(0, Math.min(1, value))
  return (
    <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
      <Circle cx={size / 2} cy={size / 2} r={r} stroke={t.card2} strokeWidth={stroke} fill="none" />
      {v > 0 && (
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color ?? t.accent}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${c * v} ${c}`}
        />
      )}
    </Svg>
  )
}

import { useContext, useEffect, useRef } from 'react'
import type { VisualizationSpec } from 'vega-embed'
import { ThemeContext } from '../theme'

export const CARS_URL = `${import.meta.env.BASE_URL}data/cars.json`

function cssVar(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

// 차트 색은 CSS 토큰에서 읽어 라이트/다크를 따라간다.
function themeConfig() {
  const ink = cssVar('--text-2')
  const grid = cssVar('--grid')
  const axis = cssVar('--axis')
  const font = 'Pretendard Variable, Pretendard, system-ui, sans-serif'
  return {
    background: null,
    font,
    view: { stroke: null },
    axis: {
      labelColor: ink, titleColor: ink, gridColor: grid, domainColor: axis, tickColor: axis,
      labelFontSize: 12, titleFontSize: 12, titleFontWeight: 500,
    },
    legend: { labelColor: ink, titleColor: ink, labelFontSize: 12, titleFontSize: 12 },
    header: { labelColor: ink, titleColor: ink, labelFontSize: 12 },
    range: { category: [cssVar('--series-1'), cssVar('--series-2'), cssVar('--series-3')] },
    bar: { fill: cssVar('--series-1'), cornerRadiusEnd: 4 },
    rect: { fill: cssVar('--series-1') },
    point: { color: cssVar('--series-1'), size: 40, filled: true, opacity: 0.75 },
    tick: { color: cssVar('--series-1'), thickness: 2 },
  }
}

type Props = { spec: VisualizationSpec; label: string }

export function VegaChart({ spec, label }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const theme = useContext(ThemeContext)

  useEffect(() => {
    if (!ref.current) return
    let finalize: (() => void) | undefined
    let cancelled = false
    const full = { width: 'container', ...spec, config: themeConfig() } as VisualizationSpec
    const el = ref.current
    // vega 번들(약 1MB)은 첫 차트가 필요할 때 따로 불러온다
    import('vega-embed').then(({ default: embed }) => embed(el, full, { actions: false, renderer: 'svg' })).then((res) => {
      if (cancelled) res.finalize()
      else finalize = res.finalize
    }).catch((err) => console.error(err))
    return () => {
      cancelled = true
      finalize?.()
    }
  }, [spec, theme])

  return <div className="vega-chart" ref={ref} role="img" aria-label={label} />
}

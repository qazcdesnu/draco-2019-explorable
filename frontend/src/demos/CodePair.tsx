import { useState } from 'react'
import type { VisualizationSpec } from 'vega-embed'
import { highlight } from '../components/highlight'
import type { Lang } from '../components/highlight'
import { CARS_URL, VegaChart } from '../components/VegaChart'

// 논문 Fig. 2: 같은 막대 차트를 Vega-Lite JSON과 Draco ASP로 표현
type Line = { text: string; key?: string }

const VL: Line[] = [
  { text: '{' },
  { text: '  "data": {"url": "cars.csv"},' },
  { text: '  "mark": "bar",', key: 'mark' },
  { text: '  "encoding": {' },
  { text: '    "x": {', key: 'e0' },
  { text: '      "field": "Cylinders",', key: 'e0f' },
  { text: '      "type": "ordinal"', key: 'e0t' },
  { text: '    },' },
  { text: '    "y": {', key: 'e1' },
  { text: '      "field": "Horsepower",', key: 'e1f' },
  { text: '      "type": "quantitative",', key: 'e1t' },
  { text: '      "aggregate": "mean"', key: 'e1a' },
  { text: '    }' },
  { text: '  }' },
  { text: '}' },
]

const ASP: Line[] = [
  { text: 'mark(bar).', key: 'mark' },
  { text: '' },
  { text: 'encoding(e0).', key: 'e0' },
  { text: 'channel(e0,x).', key: 'e0' },
  { text: 'type(e0,ordinal).', key: 'e0t' },
  { text: 'field(e0,cylinders).', key: 'e0f' },
  { text: '' },
  { text: 'encoding(e1).', key: 'e1' },
  { text: 'channel(e1,y).', key: 'e1' },
  { text: 'type(e1,quant).', key: 'e1t' },
  { text: 'field(e1,horsepower).', key: 'e1f' },
  { text: 'aggregate(e1,mean).', key: 'e1a' },
]

const SPEC: VisualizationSpec = {
  data: { url: CARS_URL },
  mark: { type: 'bar', tooltip: true },
  encoding: {
    x: { field: 'Cylinders', type: 'ordinal', axis: { labelAngle: 0 } },
    y: { field: 'Horsepower', type: 'quantitative', aggregate: 'mean', title: 'Mean of Horsepower' },
  },
  height: 180,
}

function Pane({ title, lines, lang, active, setActive }: {
  title: string; lines: Line[]; lang: Lang; active: string | null; setActive: (k: string | null) => void
}) {
  return (
    <figure className="code linked">
      <figcaption>{title}</figcaption>
      <pre>
        <code>
          {lines.map((l, i) => (
            <span
              key={i}
              className={`code-line${l.key ? ' linkable' : ''}${l.key && l.key === active ? ' hl' : ''}`}
              onMouseEnter={() => l.key && setActive(l.key)}
              onMouseLeave={() => setActive(null)}
              onFocus={() => l.key && setActive(l.key)}
              onBlur={() => setActive(null)}
              tabIndex={l.key ? 0 : undefined}
            >
              {highlight(l.text, lang)}
            </span>
          ))}
        </code>
      </pre>
    </figure>
  )
}

export function CodePair() {
  const [active, setActive] = useState<string | null>(null)
  return (
    <div className="demo">
      <p className="demo-hint">한쪽 코드 줄에 마우스를 올리면 다른 언어에서 같은 의미의 줄이 강조됩니다.</p>
      <div className="compare">
        <Pane title="Vega-Lite (JSON)" lines={VL} lang="json" active={active} setActive={setActive} />
        <Pane title="Draco (ASP facts)" lines={ASP} lang="asp" active={active} setActive={setActive} />
      </div>
      <VegaChart spec={SPEC} label="실린더 수별 평균 마력 막대 차트" />
      <p className="caption">논문 Fig. 2 재구성. 차트는 vega-datasets의 cars 데이터로 현재 버전 Vega-Lite가 그렸습니다(2019 Draco는 Vega-Lite v2 사용).</p>
    </div>
  )
}

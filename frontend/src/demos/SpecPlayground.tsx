import { useState } from 'react'
import type { VisualizationSpec } from 'vega-embed'
import { highlight } from '../components/highlight'
import { CARS_URL, VegaChart } from '../components/VegaChart'

// §2.3: Vega-Lite 명세를 버튼으로 바꾸며 JSON과 차트가 함께 바뀌는 것을 본다.
// 2019 Draco가 쓰던 Vega-Lite v2에도 있던 기능(mark, x/y/color, bin, aggregate)만 쓴다.
type Mark = 'bar' | 'point' | 'tick'
type FieldType = 'nominal' | 'ordinal' | 'quantitative'
type Field = { name: string; type: FieldType }

const MARKS: Mark[] = ['bar', 'point', 'tick']
const X_FIELDS: Field[] = [
  { name: 'Cylinders', type: 'ordinal' },
  { name: 'Origin', type: 'nominal' },
  { name: 'Horsepower', type: 'quantitative' },
]
const Y_FIELDS: Field[] = [
  { name: 'Miles_per_Gallon', type: 'quantitative' },
  { name: 'Horsepower', type: 'quantitative' },
]

type State = { mark: Mark; x: string; y: string; color: boolean }

// 화면에 보여 주는 명세. 막대는 값을 하나로 모아야 하므로 y를 평균내고, x가 연속형이면 구간으로 나눈다.
function toSpec({ mark, x, y, color }: State): Record<string, unknown> {
  const xf = X_FIELDS.find((f) => f.name === x)!
  const enc: Record<string, unknown> = {
    x: { field: xf.name, type: xf.type, ...(mark === 'bar' && xf.type === 'quantitative' ? { bin: true } : {}) },
    y: { field: y, type: 'quantitative', ...(mark === 'bar' ? { aggregate: 'mean' } : {}) },
  }
  if (color) enc.color = { field: 'Origin', type: 'nominal' }
  return { data: { url: 'cars.json' }, mark, encoding: enc }
}

function toLines(spec: Record<string, unknown>): string[] {
  return JSON.stringify(spec, null, 2).split('\n')
}

export function SpecPlayground() {
  const [st, setSt] = useState<{ cur: State; prev: State }>(() => {
    const s: State = { mark: 'bar', x: 'Cylinders', y: 'Miles_per_Gallon', color: false }
    return { cur: s, prev: s }
  })
  const { cur } = st
  const update = (patch: Partial<State>) => setSt(({ cur: c }) => ({ cur: { ...c, ...patch }, prev: c }))

  const spec = toSpec(cur)
  const lines = toLines(spec)
  const before = new Set(toLines(toSpec(st.prev)))
  const encoding = spec.encoding as Record<string, Record<string, unknown>>
  const chart = {
    ...spec,
    encoding: { ...encoding, x: { ...encoding.x, axis: { labelAngle: 0 } } },
    data: { url: CARS_URL },
    mark: { type: cur.mark, tooltip: true },
    height: 200,
  } as VisualizationSpec

  return (
    <div className="demo">
      <p className="demo-hint">버튼으로 mark와 field를 바꿔 보세요. 바뀐 JSON 줄이 강조되고 차트가 다시 그려집니다.</p>
      <div className="spec-controls">
        <Choice label="mark" options={MARKS.map((m) => ({ id: m, text: m }))} value={cur.mark} onChange={(mark) => update({ mark: mark as Mark })} />
        <Choice
          label="x"
          options={X_FIELDS.map((f) => ({ id: f.name, text: f.name, disabled: f.name === cur.y }))}
          value={cur.x}
          onChange={(x) => update({ x })}
        />
        <Choice
          label="y"
          options={Y_FIELDS.map((f) => ({ id: f.name, text: f.name, disabled: f.name === cur.x }))}
          value={cur.y}
          onChange={(y) => update({ y })}
        />
        <Choice
          label="color"
          options={[{ id: 'none', text: '없음' }, { id: 'Origin', text: 'Origin' }]}
          value={cur.color ? 'Origin' : 'none'}
          onChange={(v) => update({ color: v === 'Origin' })}
        />
      </div>
      <div className="compare">
        <figure className="code">
          <figcaption>Vega-Lite 명세 (JSON)</figcaption>
          <pre>
            <code>
              {lines.map((l, i) => (
                <span key={`${i}:${l}`} className={`code-line${before.has(l) ? '' : ' hl'}`}>{highlight(l, 'json')}</span>
              ))}
            </code>
          </pre>
        </figure>
        <figure>
          <figcaption>Vega-Lite가 그린 차트</figcaption>
          <VegaChart spec={chart} label={`${cur.mark} 차트: x ${cur.x}, y ${cur.y}${cur.color ? ', color Origin' : ''}`} />
        </figure>
      </div>
      <p className="caption">
        mark가 bar이면 막대 하나에 값 하나가 되도록 y에 <code>aggregate: mean</code>을 붙이고, x가 연속형이면 <code>bin</code>으로 구간을 나눕니다.
        scale, axis, legend는 적지 않아도 Vega-Lite가 type에 맞는 기본값을 채웁니다. 데이터는 vega-datasets의 cars, 차트는 현재 버전 Vega-Lite로 그렸고 크기·툴팁·축 라벨 각도 설정은 JSON에서 생략했습니다.
      </p>
    </div>
  )
}

type Opt = { id: string; text: string; disabled?: boolean }

function Choice({ label, options, value, onChange }: { label: string; options: Opt[]; value: string; onChange: (id: string) => void }) {
  return (
    <div className="spec-choice">
      <code className="spec-key">{label}</code>
      <div className="stepper" role="radiogroup" aria-label={label}>
        {options.map((o) => (
          <button
            key={o.id}
            role="radio"
            aria-checked={value === o.id}
            className={value === o.id ? 'on' : ''}
            disabled={o.disabled}
            onClick={() => onChange(o.id)}
          >
            {o.text}
          </button>
        ))}
      </div>
    </div>
  )
}

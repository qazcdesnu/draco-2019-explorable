import { useState } from 'react'
import type { VisualizationSpec } from 'vega-embed'
import { CARS_URL, VegaChart } from '../components/VegaChart'

// §5, §6.3.1: 실험 결과 → 순위 쌍 → feature vector.
// 두 차트와 실험 결과는 설명용 예시다. 특징은 RankDemo와 같은 "nominal 필드를 이 채널에 씀" 3개.
const FEATURES = ['color', 'shape', 'row'] as const

const STEPS = [
  { n: '1', text: '실험 응답 (정확도, 응답 시간)' },
  { n: '2', text: '(데이터 스키마, 과업)별로 묶기' },
  { n: '3', text: '묶음 안의 모든 쌍 중 차이가 유의한(p < 0.01) 쌍만 남기기' },
  { n: '4', text: 'Clingo로 soft constraint 위반 횟수를 세어 feature vector로' },
]

const base = {
  data: { url: CARS_URL },
  mark: { type: 'point', tooltip: true },
  width: 'container',
  height: 130,
} as const

const CHARTS = {
  A: {
    title: '차트 A · Origin → color',
    x: [1, 0, 0],
    spec: {
      ...base,
      encoding: {
        x: { field: 'Horsepower', type: 'quantitative' },
        y: { field: 'Miles_per_Gallon', type: 'quantitative' },
        color: { field: 'Origin', type: 'nominal' },
      },
    } as VisualizationSpec,
  },
  B: {
    title: '차트 B · Origin → shape',
    x: [0, 1, 0],
    spec: {
      ...base,
      mark: { type: 'point', tooltip: true, filled: false },
      encoding: {
        x: { field: 'Horsepower', type: 'quantitative' },
        y: { field: 'Miles_per_Gallon', type: 'quantitative' },
        shape: { field: 'Origin', type: 'nominal' },
      },
    } as VisualizationSpec,
  },
}

type Id = keyof typeof CHARTS

const vec = (v: number[]) => `[${v.join(', ')}]`

export function PairHarvest() {
  const [winner, setWinner] = useState<Id>('A')
  const loser: Id = winner === 'A' ? 'B' : 'A'
  const d = CHARTS[winner].x.map((v, k) => v - CHARTS[loser].x[k])

  return (
    <div className="demo">
      <ol className="harvest-steps">
        {STEPS.map((s) => <li key={s.n}><span className="step-n">{s.n}</span>{s.text}</li>)}
      </ol>
      <div className="compare">
        {(['A', 'B'] as Id[]).map((id) => (
          <figure key={id} className={`pair-fig${id === winner ? ' win' : ''}`}>
            <figcaption>{CHARTS[id].title}{id === winner && <b> · 더 정확</b>}</figcaption>
            <VegaChart spec={CHARTS[id].spec} label={CHARTS[id].title} />
            <p className="vec"><code>x_{id} = {vec(CHARTS[id].x)}</code></p>
          </figure>
        ))}
      </div>
      <div className="harvest-result">
        <div className="segmented small" role="radiogroup" aria-label="실험 결과">
          {(['A', 'B'] as Id[]).map((id) => (
            <button key={id} role="radio" aria-checked={winner === id} className={winner === id ? 'on' : ''} onClick={() => setWinner(id)}>
              실험 결과: 차트 {id}가 더 정확
            </button>
          ))}
        </div>
        <p>
          순위 쌍 <code>(v{winner}, v{loser}; y = −1)</code> → 차이 벡터 <code>d = x_{winner} − x_{loser} = {vec(d)}</code>
        </p>
        <p className="small">
          특징 순서는 [{FEATURES.join(', ')}]입니다. 결과가 뒤집히면 쌍의 순서를 바꿔 항상 "선호, 비선호; y = −1" 꼴로 맞춥니다. (v1, v2; y)와 (v2, v1; −y)는 같은 정보이기 때문입니다(§5).
        </p>
      </div>
      <p className="caption">두 차트와 실험 결과는 설명을 위한 예시입니다. 논문은 Kim &amp; Heer와 Saket et al.의 실험에서 이 절차로 순위 쌍을 모았습니다(§6.3.1). 차트는 vega-datasets의 cars 데이터로 현재 버전 Vega-Lite가 그렸습니다.</p>
    </div>
  )
}

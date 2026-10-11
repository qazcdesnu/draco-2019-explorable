import { useMemo, useState } from 'react'
import type { VisualizationSpec } from 'vega-embed'
import { CARS_URL, VegaChart } from '../components/VegaChart'

// 초기 weight: 논문 §6.2 Draco-CQL의 nominal 채널 선호 (y 0, x 1, row 6, color 7, shape 8)
const CHANNELS = ['y', 'x', 'row', 'color', 'shape'] as const
type Channel = (typeof CHANNELS)[number]
const PAPER_W: Record<Channel, number> = { y: 0, x: 1, row: 6, color: 7, shape: 8 }

type Candidate = { id: string; name: string; channel: Channel; spec: VisualizationSpec }

const base = { data: { url: CARS_URL } }
const CANDIDATES: Candidate[] = [
  {
    id: 'A', name: '막대: Origin → x, mean(Horsepower) → y', channel: 'x',
    spec: { ...base, mark: { type: 'bar', tooltip: true }, encoding: { x: { field: 'Origin', type: 'nominal', axis: { labelAngle: 0 } }, y: { field: 'Horsepower', type: 'quantitative', aggregate: 'mean' } }, height: 160 },
  },
  {
    id: 'B', name: '틱: Horsepower → x, Origin → y', channel: 'y',
    spec: { ...base, mark: { type: 'tick', tooltip: true }, encoding: { x: { field: 'Horsepower', type: 'quantitative' }, y: { field: 'Origin', type: 'nominal' } }, height: 120 },
  },
  {
    id: 'C', name: '점: Horsepower → x, Origin → color', channel: 'color',
    spec: { ...base, mark: { type: 'point', tooltip: true }, encoding: { x: { field: 'Horsepower', type: 'quantitative' }, color: { field: 'Origin', type: 'nominal' } }, height: 60 },
  },
  {
    id: 'D', name: '점: Horsepower → x, Origin → shape', channel: 'shape',
    spec: { ...base, mark: { type: 'point', tooltip: true }, encoding: { x: { field: 'Horsepower', type: 'quantitative' }, shape: { field: 'Origin', type: 'nominal' } }, height: 60 },
  },
  {
    id: 'E', name: '틱 + facet: Horsepower → x, Origin → row', channel: 'row',
    spec: { ...base, mark: { type: 'tick', tooltip: true }, encoding: { x: { field: 'Horsepower', type: 'quantitative' }, row: { field: 'Origin', type: 'nominal' } }, height: 30 },
  },
]

export function WeightSliders() {
  const [w, setW] = useState<Record<Channel, number>>(PAPER_W)
  const [picked, setPicked] = useState<string | null>(null)

  const ranked = useMemo(
    () => CANDIDATES.map((c) => ({ ...c, cost: w[c.channel] })).sort((a, b) => a.cost - b.cost),
    [w],
  )
  const bestCost = ranked[0].cost
  const shown = ranked.find((c) => c.id === picked) ?? ranked[0]

  return (
    <div className="demo">
      <p className="demo-hint">질의: "Horsepower(Q)와 Origin(N)을 보여 줘." 각 후보는 nominal 필드를 서로 다른 채널에 둡니다. weight를 바꿔 1위를 바꿔 보세요.</p>
      <div className="compare">
        <div className="sliders">
          {CHANNELS.map((ch) => (
            <label key={ch} className="slider-row">
              <code>{`:~ channel(E,${ch}), type(E,nominal).`}</code>
              <input
                type="range" min={0} max={20} value={w[ch]}
                onChange={(e) => setW({ ...w, [ch]: Number(e.target.value) })}
                aria-label={`${ch} 채널 weight`}
              />
              <span className="slider-val">[{w[ch]}]</span>
            </label>
          ))}
          <button className="ghost" onClick={() => setW(PAPER_W)}>논문 값으로 되돌리기</button>
        </div>
        <ol className="rank-list">
          {ranked.map((c) => (
            <li key={c.id}>
              <button
                className={`rank-item${c.id === shown.id ? ' on' : ''}`}
                onClick={() => setPicked(c.id === picked ? null : c.id)}
                aria-pressed={c.id === shown.id}
              >
                <span className="rank-cost">Cost {c.cost}</span>
                <span>{c.cost === bestCost ? '★ ' : ''}{c.id}. {c.name}</span>
              </button>
            </li>
          ))}
        </ol>
      </div>
      <VegaChart spec={shown.spec} label={`후보 ${shown.id}: ${shown.name}`} />
      <p className="caption">
        weight 초기값은 논문 §6.2(Draco-CQL)의 값입니다. 후보 5개는 설명을 위해 우리가 구성했고, 다른 제약은 모두 빼고 이 제약 하나만 남긴 단순화 버전입니다. ★ 표시는 비용이 가장 낮은 후보(동점 포함)입니다.
      </p>
    </div>
  )
}

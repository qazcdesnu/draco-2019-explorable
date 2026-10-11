import { useMemo, useState } from 'react'
import type { VisualizationSpec } from 'vega-embed'
import { VegaChart } from '../components/VegaChart'

const TILES = [
  { value: '17 / 17', label: 'CompassQL 테스트 질의에서 같은 최적 명세', cite: '§6.2' },
  { value: '180 vs 4,324', label: '제약 수(hard 70 + soft 110) vs CompassQL 코드 줄 수', cite: '§6.2' },
  { value: '< 0.5초', label: '필드 25개 · 인코딩 5개 질의. CompassQL은 몇 분 뒤 메모리 부족(4GB)', cite: '§6.2, Fig. 7' },
  { value: '93% vs 65%', label: '테스트 쌍 순서 정확도: 학습 weight vs hand-tuned', cite: '§6.3.2' },
]

export function StatTiles() {
  return (
    <div className="tiles">
      {TILES.map((t) => (
        <div className="tile" key={t.value}>
          <div className="tile-value">{t.value}</div>
          <div className="tile-label">{t.label}</div>
          <div className="tile-cite">{t.cite}</div>
        </div>
      ))}
    </div>
  )
}

type Task = 'value' | 'summary'

// 합성 데이터: 범주 N(3개), 정량 Q1, Q2
function synth() {
  let s = 42
  const r = () => {
    s = (s * 1664525 + 1013904223) % 4294967296
    return s / 4294967296
  }
  const gauss = () => Math.sqrt(-2 * Math.log(r() + 1e-9)) * Math.cos(2 * Math.PI * r())
  const means: Record<string, number> = { A: 40, B: 55, C: 48 }
  const rows: { N: string; Q1: number; Q2: number }[] = []
  for (const n of ['A', 'B', 'C']) {
    for (let i = 0; i < 40; i++) rows.push({ N: n, Q1: Math.round(means[n] + gauss() * 8), Q2: Math.round(r() * 100) })
  }
  return rows
}

export function TaskToggle() {
  const [task, setTask] = useState<Task>('value')
  const values = useMemo(() => synth(), [])

  const scatter = useMemo<VisualizationSpec>(() => ({
    data: { values },
    mark: { type: 'point', tooltip: true },
    encoding: {
      x: { field: 'Q2', type: 'quantitative' },
      y: { field: 'Q1', type: 'quantitative' },
      color: { field: 'N', type: 'nominal' },
    },
    height: 180,
  }), [values])

  const grouped = useMemo<VisualizationSpec>(() => ({
    data: { values },
    mark: { type: 'point', tooltip: true },
    encoding: {
      x: { field: 'Q2', type: 'quantitative' },
      y: { field: 'Q1', type: 'quantitative' },
      color: { field: 'N', type: 'nominal', legend: null },
      column: { field: 'N', type: 'nominal' },
    },
    width: 90,
    height: 180,
  }), [values])

  return (
    <div className="demo">
      <div className="segmented small" role="radiogroup" aria-label="사용자 과업">
        {(['value', 'summary'] as Task[]).map((t) => (
          <button key={t} role="radio" aria-checked={task === t} className={task === t ? 'on' : ''} onClick={() => setTask(t)}>
            {t === 'value' ? 'Value task · 개별 값 읽기' : 'Summary task · 분포 요약'}
          </button>
        ))}
      </div>
      <div className="compare">
        <figure>
          <figcaption><b>Draco-CQL</b> · hand-tuned weight</figcaption>
          <VegaChart spec={scatter} label="Draco-CQL 결과: 산점도, N은 색" />
          <p className="small">task 관련 weight가 0이라 과업이 바뀌어도 같은 차트입니다.</p>
        </figure>
        <figure>
          <figcaption><b>Draco-Learn</b> · learned weight</figcaption>
          <VegaChart spec={task === 'value' ? scatter : grouped} label={task === 'value' ? 'Draco-Learn 결과: 산점도' : 'Draco-Learn 결과: 범주별로 공간을 나눈 차트'} />
          <p className="small">{task === 'value' ? '개별 값 비교에는 산점도가 잘 맞습니다.' : '범주(N)별로 공간을 나누면 최소, 최대, 평균 같은 분포 특성을 읽기 쉽습니다.'}</p>
        </figure>
      </div>
      <p className="caption">논문 Fig. 8을 합성 데이터로 다시 만든 개념도입니다. Summary task 차트의 정확한 인코딩은 원문 Fig. 8을 참고하세요.</p>
    </div>
  )
}

// 증거 파트의 장치: 숫자 타일 + 과업 토글
export function EvidenceDemo() {
  return (
    <>
      <StatTiles />
      <TaskToggle />
    </>
  )
}

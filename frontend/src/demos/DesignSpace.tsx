import { useMemo, useState } from 'react'

// 논문 Fig. 3의 개념도: 후보 → ill-formed 제거 → non-expressive 제거 → 비용 순 정렬
type Status = 'illformed' | 'nonexpressive' | 'valid'
type Cand = { id: number; x: number; y: number; status: Status; cost: number }

const W = 600
const H = 280
const COLS = 12
const ROWS = 6

// 고정 시드 난수: 새로고침해도 같은 그림
function rng(seed: number) {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296
    return s / 4294967296
  }
}

function makeCandidates(): Cand[] {
  const r = rng(7)
  const out: Cand[] = []
  for (let i = 0; i < COLS * ROWS; i++) {
    const col = i % COLS
    const row = Math.floor(i / COLS)
    const roll = r()
    const status: Status = roll < 0.25 ? 'illformed' : roll < 0.5 ? 'nonexpressive' : 'valid'
    out.push({
      id: i,
      x: 30 + col * ((W - 60) / (COLS - 1)) + (r() - 0.5) * 22,
      y: 30 + row * ((H - 60) / (ROWS - 1)) + (r() - 0.5) * 22,
      status,
      cost: Math.round(r() * 30),
    })
  }
  return out
}

const STEPS = [
  {
    title: '① 설계 공간',
    rule: '1 { mark(bar); mark(line); mark(area); mark(point) } 1.',
    text: 'Aggregate rule이 속성의 도메인을 정합니다. 가능한 조합이 모두 후보가 됩니다.',
  },
  {
    title: '② Well-formedness',
    rule: ':- channel(_,shape), not mark(point).',
    text: '문법적으로 성립하지 않는 명세(ill-formed)를 hard constraint로 제거합니다.',
  },
  {
    title: '③ Expressiveness',
    rule: ':- channel(E,size), type(E,nominal).',
    text: '데이터의 사실을 전부, 그리고 그것만 전달하지 못하는 명세를 제거합니다.',
  },
  {
    title: '④ Soft constraint로 정렬',
    rule: ':~ continuous(E), not zero(E). [5]',
    text: '남은 후보를 위반 비용 합으로 정렬합니다. 위로 갈수록 선호되며, 비용이 가장 낮은 후보가 최적입니다.',
  },
]

export function DesignSpace() {
  const [step, setStep] = useState(0)
  const cands = useMemo(() => makeCandidates(), [])
  const valid = useMemo(() => cands.filter((c) => c.status === 'valid').sort((a, b) => a.cost - b.cost), [cands])
  const best = valid[0]
  const maxCost = valid[valid.length - 1].cost

  function pos(c: Cand): { x: number; y: number; out: boolean } {
    const out = (step >= 1 && c.status === 'illformed') || (step >= 2 && c.status === 'nonexpressive')
    if (step < 3 || c.status !== 'valid') return { x: c.x, y: c.y, out }
    const rank = valid.indexOf(c)
    return {
      x: 40 + (rank % 9) * ((W - 80) / 8) + (rank % 2) * 8,
      y: 24 + (c.cost / maxCost) * (H - 48),
      out,
    }
  }

  const remaining = cands.filter((c) => !pos(c).out).length
  const s = STEPS[step]

  return (
    <div className="demo">
      <div className="stepper" role="tablist" aria-label="설계 공간 단계">
        {STEPS.map((st, i) => (
          <button key={i} role="tab" aria-selected={i === step} className={i === step ? 'on' : ''} onClick={() => setStep(i)}>
            {st.title}
          </button>
        ))}
      </div>
      <svg className="space" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${s.title}: 남은 후보 ${remaining}개`}>
        {step === 3 && (
          <g className="space-axis">
            <text x={4} y={14}>more preferred ↑</text>
            <text x={4} y={H - 4}>less preferred ↓</text>
          </g>
        )}
        {cands.map((c) => {
          const p = pos(c)
          const isBest = step === 3 && c === best
          return (
            <g key={c.id} className="cand" style={{ transform: `translate(${p.x}px, ${p.y}px)` }}>
              <circle
                r={isBest ? 9 : 6}
                className={`${p.out ? 'out' : step === 3 ? 'ranked' : 'live'}${isBest ? ' best' : ''}`}
              >
                <title>{p.out ? `제거됨 (${c.status})` : step === 3 ? `비용 ${c.cost}` : '후보'}</title>
              </circle>
            </g>
          )
        })}
        {step === 3 && best && (
          <text className="space-label" x={pos(best).x + 14} y={pos(best).y + 4}>최적 (비용 {best.cost})</text>
        )}
      </svg>
      <div className="step-explain">
        <code className="rule">{s.rule}</code>
        <p>{s.text} <strong>남은 후보 {remaining}개 / {cands.length}개</strong></p>
      </div>
      <p className="caption">논문 Fig. 3, 4의 개념도입니다. 점의 개수와 위치는 설명을 위한 값입니다.</p>
    </div>
  )
}

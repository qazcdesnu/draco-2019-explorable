import { useState } from 'react'

// §5의 RankSVM을 특징 3개짜리로 줄인 데모.
// 특징 = "nominal 필드를 이 채널에 썼다"의 위반 횟수. 실험 결과 카드는 설명용 가상 데이터다.
// size는 nominal에 쓰면 hard constraint 위반(§4.2.1)이라 특징에서 뺐다. color/shape/row는 §6.2 Draco-CQL weight와 같은 채널이다.
const FEATURES = ['color', 'shape', 'row'] as const
type Feature = (typeof FEATURES)[number]

type Pair = { id: string; better: Feature; worse: Feature; note: string }

const PAIRS: Pair[] = [
  { id: 'p1', better: 'color', worse: 'shape', note: '범주 구분 과업에서 color 차트가 더 정확' },
  { id: 'p2', better: 'row', worse: 'shape', note: 'row로 나눈 차트가 shape 차트보다 더 빠름' },
  { id: 'p3', better: 'color', worse: 'row', note: 'color 차트가 row로 나눈 차트보다 더 정확' },
  { id: 'p4', better: 'shape', worse: 'color', note: '상충하는 결과 (다른 실험 조건)' },
]

const LAMBDA = 0.1

function onehot(f: Feature): number[] {
  return FEATURES.map((g) => (g === f ? 1 : 0))
}

// L = (1/n) Σ max(0, 1 − y·wᵀ(x1 − x2)) + λ‖w‖², 모든 쌍은 (선호, 비선호; y = −1)로 표준화
function train(pairs: Pair[]): number[] {
  const w = [0, 0, 0]
  if (pairs.length === 0) return w
  const diffs = pairs.map((p) => onehot(p.better).map((v, k) => v - onehot(p.worse)[k]))
  for (let it = 0; it < 4000; it++) {
    const lr = 0.1 / Math.sqrt(1 + it / 50)
    const grad = w.map((wk) => 2 * LAMBDA * wk)
    for (const d of diffs) {
      const margin = 1 + d.reduce((s, dk, k) => s + dk * w[k], 0) // 1 − y·wᵀd, y = −1
      if (margin > 0) d.forEach((dk, k) => (grad[k] += dk / diffs.length))
    }
    w.forEach((_, k) => (w[k] -= lr * grad[k]))
  }
  return w
}

export function RankDemo() {
  const [on, setOn] = useState<Set<string>>(new Set())
  const active = PAIRS.filter((p) => on.has(p.id))
  const w = train(active)
  const wOf = (f: Feature) => w[FEATURES.indexOf(f)]
  const correct = active.filter((p) => wOf(p.better) < wOf(p.worse)).length
  const order = [...FEATURES].sort((a, b) => wOf(a) - wOf(b))
  const scale = Math.max(1, ...w.map(Math.abs))

  function toggle(id: string) {
    const next = new Set(on)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setOn(next)
  }

  return (
    <div className="demo">
      <p className="demo-hint">실험 결과 카드를 켜고 끄면 브라우저에서 RankSVM을 다시 학습합니다. 카드가 없으면 weight는 모두 0입니다.</p>
      <div className="compare">
        <div className="pair-cards">
          {PAIRS.map((p) => (
            <button key={p.id} className={`pair-card${on.has(p.id) ? ' on' : ''}`} aria-pressed={on.has(p.id)} onClick={() => toggle(p.id)}>
              <span className="pair-main"><b>{p.better}</b> 차트 &gt; <b>{p.worse}</b> 차트</span>
              <span className="pair-note">{p.note}</span>
              {on.has(p.id) && (
                <span className={`pair-status ${wOf(p.better) < wOf(p.worse) ? 'ok' : 'bad'}`}>
                  {wOf(p.better) < wOf(p.worse) ? '✓ 순서 맞춤' : '✗ 순서 틀림'}
                </span>
              )}
            </button>
          ))}
        </div>
        <div>
          <div className="wbars" role="img" aria-label={`학습된 weight: ${FEATURES.map((f) => `${f} ${wOf(f).toFixed(2)}`).join(', ')}`}>
            {FEATURES.map((f) => {
              const v = wOf(f)
              const pct = (Math.abs(v) / scale) * 50
              return (
                <div className="wbar-row" key={f}>
                  <code>{`:~ channel(E,${f}), type(E,nominal).`}</code>
                  <div className="wbar-track">
                    <span className="wbar-zero" />
                    <span className="wbar" style={v >= 0 ? { left: '50%', width: `${pct}%` } : { left: `${50 - pct}%`, width: `${pct}%` }} />
                  </div>
                  <span className="wbar-val">{v.toFixed(2)}</span>
                </div>
              )
            })}
          </div>
          <p className="result-line">
            {active.length === 0 ? '학습할 쌍이 없습니다.' : (
              <>쌍 정확도 <strong>{correct}/{active.length}</strong> · 선호 순서 (비용 낮은 순): <strong>{order.join(' < ')}</strong></>
            )}
          </p>
          <p className="small">
            이 데모의 차트는 모두 특징을 하나씩만 위반하므로 weight의 차이만 의미가 있습니다. 모든 weight에 같은 값을 더해도 쌍의 비교 결과가 같아서, L2 정규화가 0 근처의 해를 고릅니다. 그래서 음수 weight도 나옵니다.
          </p>
        </div>
      </div>
      <p className="caption">λ = 0.1은 논문 §5의 값입니다. 실험 결과 카드는 설명을 위한 가상 데이터이며, 논문은 Kim &amp; Heer에서 약 1,100쌍, Saket et al.에서 10쌍을 수집했습니다(§6.3.1).</p>
    </div>
  )
}

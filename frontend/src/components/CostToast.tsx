import { useEffect, useRef, useState } from 'react'
import { CONTEXTS, FACTS, SOFT, VIOLATIONS, cost, ranking, viewLabel } from '../design/model'
import type { ContextId, ViewId } from '../design/model'

type Props = { view: ViewId; ctx: ContextId }

const AUTO_COLLAPSE_MS = 7000

// 현재 보기가 어떤 soft constraint를 지키고 위반하는지 보여 준다.
// 부모가 보기/상황이 바뀔 때마다 key를 바꿔 다시 마운트하므로 항상 펼친 상태로 시작한다.
export function CostToast({ view, ctx }: Props) {
  const [open, setOpen] = useState(true)
  const timer = useRef<number | undefined>(undefined)

  useEffect(() => {
    timer.current = window.setTimeout(() => setOpen(false), AUTO_COLLAPSE_MS)
    return () => window.clearTimeout(timer.current)
  }, [])

  const total = cost(view, ctx)
  const ctxLabel = CONTEXTS.find((c) => c.id === ctx)!.label
  const rows = SOFT.map((c) => ({ c, n: VIOLATIONS[view][c.id] ?? 0, w: c.weights[ctx] }))
  const violated = rows.filter((r) => r.n > 0)
  const satisfied = rows.filter((r) => r.n === 0)
  const rank = ranking(ctx)
  const isBest = rank[0].view === view

  if (!open) {
    return (
      <button className="cost-badge" onClick={() => { setOpen(true); window.clearTimeout(timer.current) }} aria-expanded={false} aria-controls="cost-toast">
        <span className="badge-dot" aria-hidden="true">{isBest ? '★' : '◆'}</span>
        {viewLabel(view)} · Cost {total}
      </button>
    )
  }

  return (
    <aside
      id="cost-toast"
      className="cost-toast"
      role="status"
      aria-live="polite"
      onMouseEnter={() => window.clearTimeout(timer.current)}
      onFocus={() => window.clearTimeout(timer.current)}
    >
      <header className="toast-head">
        <div>
          <p className="toast-kicker">이 보기의 디자인 비용 · {ctxLabel} 상황</p>
          <h2>{viewLabel(view)} <span className="toast-cost">Cost {total}</span></h2>
        </div>
        <button className="icon-btn" onClick={() => setOpen(false)} aria-label="접기">✕</button>
      </header>

      <ul className="toast-list">
        {violated.map(({ c, n, w }) => (
          <li key={c.id} className="viol" title={c.asp.replace('[w]', `[${w}]`)}>
            <span className="mark" aria-hidden="true">✗</span>
            <span className="sr-only">위반: </span>
            <code>{c.id}</code>
            <span className="meaning">{c.meaning}</span>
            <span className="w">{n > 1 ? `${n}×` : ''}[{w}]</span>
          </li>
        ))}
      </ul>
      <details className="toast-sat">
        <summary>만족한 제약 {satisfied.length}개</summary>
        <ul className="toast-list">
          {satisfied.map(({ c, w }) => (
            <li key={c.id} className="sat" title={c.asp.replace('[w]', `[${w}]`)}>
              <span className="mark" aria-hidden="true">✓</span>
              <span className="sr-only">만족: </span>
              <code>{c.id}</code>
              <span className="meaning">{c.meaning}</span>
              <span className="w">[{w}]</span>
            </li>
          ))}
        </ul>
      </details>
      <details className="toast-sat">
        <summary>이 보기의 facts</summary>
        <pre className="facts">{FACTS[view].join('\n')}</pre>
      </details>

      <p className="toast-rank">
        순위: {rank.map((r, i) => (
          <span key={r.view} className={r.view === view ? 'me' : ''}>
            {i > 0 && ' < '}{viewLabel(r.view)} {r.cost}
          </span>
        ))}
        {isBest ? ' · 이 상황의 최적 보기입니다' : ''}
      </p>
      <p className="toast-note">제약과 weight는 이 사이트를 위해 우리가 손으로 정한 값입니다(Draco-CQL처럼 hand-tuned). 논문의 지식 베이스가 아닙니다.</p>
    </aside>
  )
}

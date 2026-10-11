import { useCallback, useEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { CONTEXTS, VIEWS } from './design/model'
import type { ContextId, ViewId } from './design/model'
import { SECTIONS } from './content/sections'
import { CostToast } from './components/CostToast'
import { ThemeContext, useTheme } from './theme'
import { PaperView } from './views/PaperView'
import { DeckView } from './views/DeckView'
import { ExplorerView } from './views/ExplorerView'

const isView = (v: unknown): v is ViewId => VIEWS.some((x) => x.id === v)
const isCtx = (v: unknown): v is ContextId => CONTEXTS.some((x) => x.id === v)

function stored(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function initial() {
  const q = new URLSearchParams(location.search)
  const v = q.get('view') ?? stored('view')
  const c = q.get('ctx') ?? stored('ctx')
  const slide = Number(q.get('slide') ?? 1) - 1
  return {
    view: isView(v) ? v : 'deck',
    ctx: isCtx(c) ? c : 'present',
    slide: Number.isInteger(slide) && slide >= 0 && slide < SECTIONS.length ? slide : 0,
  }
}

// 보기 전환에 View Transitions API를 쓴다 (모션 최소화 설정이면 바로 전환)
function transition(update: () => void) {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!document.startViewTransition || reduce) {
    update()
    return
  }
  document.startViewTransition(() => flushSync(update))
}

export default function App() {
  const [init] = useState(initial)
  const [view, setViewState] = useState<ViewId>(init.view)
  const [ctx, setCtxState] = useState<ContextId>(init.ctx)
  const [slide, setSlide] = useState(init.slide)
  const [signal, setSignal] = useState(0)
  const pendingScroll = useRef<string | null>(null)
  const theme = useTheme()

  const setView = useCallback((v: ViewId) => {
    transition(() => {
      setViewState(v)
      setSignal((n) => n + 1)
    })
  }, [])

  const setCtx = (c: ContextId) => {
    setCtxState(c)
    setSignal((n) => n + 1)
  }

  // URL과 localStorage에 현재 상태를 기록 (링크 공유 시 같은 보기로 열림)
  useEffect(() => {
    const q = new URLSearchParams()
    q.set('view', view)
    q.set('ctx', ctx)
    if (view === 'deck') q.set('slide', String(slide + 1))
    history.replaceState(null, '', `${location.pathname}?${q}${view === 'deck' ? '' : location.hash}`)
    try {
      localStorage.setItem('view', view)
      localStorage.setItem('ctx', ctx)
    } catch {
      // 저장소를 쓸 수 없어도 URL로 상태가 유지된다
    }
  }, [view, ctx, slide])

  // 숫자 키 1/2/3으로 보기 전환
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const t = e.target as HTMLElement | null
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA')) return
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const idx = ['1', '2', '3'].indexOf(e.key)
      if (idx >= 0) setView(VIEWS[idx].id)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [setView])

  // Deck의 "자세히" → Paper 보기의 해당 섹션으로 이동
  useEffect(() => {
    if (!pendingScroll.current || view !== 'paper') return
    document.getElementById(`sec-${pendingScroll.current}`)?.scrollIntoView({ block: 'start' })
    pendingScroll.current = null
  }, [view])

  const goDetail = (id: string) => {
    pendingScroll.current = id
    setView('paper')
  }

  return (
    <ThemeContext.Provider value={theme.resolved}>
      <a className="skip" href="#main">본문으로 건너뛰기</a>
      <header className="topbar">
        <p className="brand">Draco <span>· 2019 논문 리뷰</span></p>
        <div className="controls">
          <div className="segmented" role="radiogroup" aria-label="보기 옵션">
            {VIEWS.map((v, i) => (
              <button
                key={v.id}
                role="radio"
                aria-checked={view === v.id}
                className={view === v.id ? 'on' : ''}
                onClick={() => setView(v.id)}
                title={`${v.desc} (단축키 ${i + 1})`}
                aria-keyshortcuts={`${i + 1}`}
              >
                {v.label}
                <kbd className="seg-key" aria-hidden="true">{i + 1}</kbd>
              </button>
            ))}
          </div>
          <div className="segmented small" role="radiogroup" aria-label="이용 상황 (soft constraint weight 세트)">
            {CONTEXTS.map((c) => (
              <button key={c.id} role="radio" aria-checked={ctx === c.id} className={ctx === c.id ? 'on' : ''} onClick={() => setCtx(c.id)}>
                {c.label}
              </button>
            ))}
          </div>
          <button className="icon-btn" onClick={theme.toggle} aria-label={theme.resolved === 'dark' ? '라이트 모드로' : '다크 모드로'}>
            {theme.resolved === 'dark' ? '☀' : '☾'}
          </button>
        </div>
      </header>

      <main id="main" data-view={view} className={`view-${view}`}>
        {view === 'paper' && <PaperView />}
        {view === 'deck' && <DeckView index={slide} setIndex={setSlide} onDetail={goDetail} />}
        {view === 'explorer' && <ExplorerView />}
      </main>

      <CostToast key={signal} view={view} ctx={ctx} />
    </ThemeContext.Provider>
  )
}

import { useEffect } from 'react'
import { SECTIONS } from '../content/sections'
import { Credits } from '../components/Credits'
import { Points, SectionHead } from './SectionParts'

type Props = { index: number; setIndex: (i: number) => void; onDetail: (id: string) => void }

function isTyping(el: EventTarget | null) {
  return el instanceof HTMLElement && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)
}

// 발표형: 한 화면에 파트 하나, 큰 글씨, 세부(detail) 생략
export function DeckView({ index, setIndex, onDetail }: Props) {
  const s = SECTIONS[index]
  const last = SECTIONS.length - 1

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (isTyping(e.target) || e.metaKey || e.ctrlKey || e.altKey) return
      if (e.key === 'ArrowRight' || e.key === 'PageDown' || (e.key === ' ' && !(e.target instanceof HTMLButtonElement))) {
        e.preventDefault()
        setIndex(Math.min(last, index + 1))
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault()
        setIndex(Math.max(0, index - 1))
      } else if (e.key === 'Home') setIndex(0)
      else if (e.key === 'End') setIndex(last)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [index, last, setIndex])

  return (
    <div className="deck">
      <section className={`slide${s.Demo ? ' has-demo' : ''}${s.num === 0 ? ' cover' : ''}`} aria-roledescription="slide" aria-label={`${index + 1} / ${SECTIONS.length}`}>
        <div className="slide-text">
          <SectionHead s={s} as={s.num === 0 ? 'h1' : 'h2'} />
          <p className="lead">{s.lead}</p>
          <Points s={s} />
          {s.detail && (
            <button className="link-btn" onClick={() => onDetail(s.id)}>수식·표 등 자세히 보기 (Paper 보기로) →</button>
          )}
          {index === last && <Credits />}
        </div>
        {s.Demo && (
          <div className="slide-demo">
            <s.Demo key={s.id} />
          </div>
        )}
      </section>
      <nav className="deck-nav" aria-label="슬라이드 이동">
        <button className="ghost" onClick={() => setIndex(Math.max(0, index - 1))} disabled={index === 0} aria-label="이전 파트">←</button>
        <ol className="dots">
          {SECTIONS.map((sec, i) => (
            <li key={sec.id}>
              <button
                className={i === index ? 'on' : i < index ? 'done' : ''}
                onClick={() => setIndex(i)}
                aria-label={`Part ${sec.num}: ${sec.title}`}
                aria-current={i === index ? 'step' : undefined}
                title={sec.title}
              />
            </li>
          ))}
        </ol>
        <span className="deck-count">{index + 1} / {SECTIONS.length}</span>
        <button className="ghost" onClick={() => setIndex(Math.min(last, index + 1))} disabled={index === last} aria-label="다음 파트">→</button>
      </nav>
    </div>
  )
}

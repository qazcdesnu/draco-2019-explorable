import { SECTIONS } from '../content/sections'
import { Credits } from '../components/Credits'
import { Points, SectionHead } from './SectionParts'

// 문서형: 한 단, 논문 순서, 모든 세부 표시, 목차는 맨 위에만
export function PaperView() {
  return (
    <article className="paper">
      <nav className="paper-toc" aria-label="목차">
        <p className="kicker">목차</p>
        <ol start={0}>
          {SECTIONS.map((s) => (
            <li key={s.id}><a href={`#sec-${s.id}`}>{s.title}</a></li>
          ))}
        </ol>
      </nav>
      {SECTIONS.map((s) => (
        <section key={s.id} id={`sec-${s.id}`} className="paper-sec">
          <SectionHead s={s} as={s.num === 0 ? 'h1' : 'h2'} />
          <p className="lead">{s.lead}</p>
          <Points s={s} />
          {s.detail && <div className="detail">{s.detail}</div>}
          {s.Demo && <s.Demo />}
        </section>
      ))}
      <Credits />
    </article>
  )
}

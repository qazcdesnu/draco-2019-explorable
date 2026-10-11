import { SECTIONS } from '../content/sections'
import { Credits } from '../components/Credits'
import { Points, SectionHead } from './SectionParts'

// 대시보드형: 목차 사이드바 상시 표시, 카드 격자, 데모는 항상 펼침, 세부는 접힘
export function ExplorerView() {
  return (
    <div className="explorer">
      <nav className="side-toc" aria-label="목차">
        <p className="kicker">파트</p>
        <ol>
          {SECTIONS.map((s) => (
            <li key={s.id}>
              <a href={`#card-${s.id}`}><span className="toc-num">{s.num}</span>{s.title}</a>
            </li>
          ))}
        </ol>
      </nav>
      <div className="cards">
        {SECTIONS.map((s) => (
          <section key={s.id} id={`card-${s.id}`} className={`card${s.Demo ? ' wide' : ''}`}>
            <SectionHead s={s} as="h3" />
            <p className="lead">{s.lead}</p>
            <Points s={s} />
            {s.Demo && <s.Demo />}
            {s.detail && (
              <details>
                <summary>자세히 (수식·표·근거)</summary>
                <div className="detail">{s.detail}</div>
              </details>
            )}
          </section>
        ))}
        <Credits />
      </div>
    </div>
  )
}

import type { Section } from '../content/sections'

export function SectionHead({ s, as: Tag = 'h2' }: { s: Section; as?: 'h1' | 'h2' | 'h3' }) {
  return (
    <header className="sec-head">
      <p className="kicker">
        <span>Part {s.num}</span>
        <span className="cite">{s.cite}</span>
        {s.kind === 'review' && <span className="badge-review">리뷰어 의견</span>}
      </p>
      <Tag>{s.title}</Tag>
    </header>
  )
}

export function Points({ s }: { s: Section }) {
  return (
    <ul className="points">
      {s.points.map((p, i) => <li key={i}>{p}</li>)}
    </ul>
  )
}

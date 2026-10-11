import { highlight } from './highlight'
import type { Lang } from './highlight'

type Props = { code: string; lang?: Lang; caption?: string }

export function Code({ code, lang = 'asp', caption }: Props) {
  return (
    <figure className="code">
      {caption && <figcaption>{caption}</figcaption>}
      <pre>
        <code>
          {code.split('\n').map((line, i) => (
            <span className="code-line" key={i}>{highlight(line, lang)}</span>
          ))}
        </code>
      </pre>
    </figure>
  )
}

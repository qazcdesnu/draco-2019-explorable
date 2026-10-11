import type { ReactNode } from 'react'

export type Lang = 'asp' | 'json' | 'text'

// 아주 작은 하이라이터: ASP의 연산자/주석/weight, JSON의 키/문자열만 구분한다.
const PATTERNS: Record<Lang, RegExp | null> = {
  asp: /(%.*$)|(:-|:~)|(\[[^\]]*\])|(\b[a-z_][a-zA-Z0-9_]*(?=\())|(\b[A-Z][a-zA-Z0-9_]*\b)/g,
  json: /("(?:[^"\\]|\\.)*"(?=\s*:))|("(?:[^"\\]|\\.)*")|(\btrue\b|\bfalse\b|-?\d+(?:\.\d+)?)/g,
  text: null,
}

const ASP_CLASSES = ['tok-comment', 'tok-op', 'tok-weight', 'tok-pred', 'tok-var']
const JSON_CLASSES = ['tok-key', 'tok-str', 'tok-num']

export function highlight(line: string, lang: Lang): ReactNode[] {
  const re = PATTERNS[lang]
  if (!re) return [line]
  const classes = lang === 'asp' ? ASP_CLASSES : JSON_CLASSES
  const out: ReactNode[] = []
  let last = 0
  for (const m of line.matchAll(re)) {
    const idx = m.index ?? 0
    if (idx > last) out.push(line.slice(last, idx))
    const group = m.slice(1).findIndex((g) => g !== undefined)
    out.push(<span key={idx} className={classes[group]}>{m[0]}</span>)
    last = idx + m[0].length
  }
  if (last < line.length) out.push(line.slice(last))
  return out
}

// 이 사이트 자체의 "디자인 지식 베이스" (docs/02_design.md).
// 논문의 Draco 지식 베이스가 아니라, Draco의 구조를 빌려 우리가 직접 정의한 메타 장치다.

export type ViewId = 'paper' | 'deck' | 'explorer'
export type ContextId = 'present' | 'read' | 'explore'

export const VIEWS: { id: ViewId; label: string; desc: string }[] = [
  { id: 'paper', label: 'Paper', desc: '문서형 · 한 단 스크롤' },
  { id: 'deck', label: 'Deck', desc: '발표형 · 한 화면 한 파트' },
  { id: 'explorer', label: 'Explorer', desc: '대시보드형 · 카드 탐색' },
]

export const CONTEXTS: { id: ContextId; label: string }[] = [
  { id: 'present', label: '발표' },
  { id: 'read', label: '읽기' },
  { id: 'explore', label: '탐색' },
]

export type SoftConstraint = {
  id: string
  asp: string
  meaning: string
  weights: Record<ContextId, number>
}

export const SOFT: SoftConstraint[] = [
  { id: 'long_line', asp: ':~ line_length(V,L), L > 80. [w]', meaning: '한 줄이 너무 길다', weights: { present: 2, read: 4, explore: 1 } },
  { id: 'no_overview', asp: ':~ view(V), not persistent_toc(V). [w]', meaning: '전체 목차가 항상 보이지 않는다', weights: { present: 2, read: 1, explore: 5 } },
  { id: 'scroll_heavy', asp: ':~ view(V), long_scroll(V). [w]', meaning: '계속 스크롤해야 한다', weights: { present: 3, read: 1, explore: 2 } },
  { id: 'small_text', asp: ':~ body_size(V,S), S < 24. [w]', meaning: '멀리서 읽기 어려운 글자 크기', weights: { present: 5, read: 0, explore: 0 } },
  { id: 'too_many_panels', asp: ':~ panels_per_screen(V,N), N > 3. [w]', meaning: '한 화면에 정보 블록이 너무 많다', weights: { present: 3, read: 3, explore: 1 } },
  { id: 'nonlinear_order', asp: ':~ view(V), not paper_order(V). [w]', meaning: '논문의 서사 순서를 따르지 않는다', weights: { present: 3, read: 3, explore: 0 } },
  { id: 'no_side_by_side', asp: ':~ compare(A,B), not adjacent(A,B). [w]', meaning: '비교 대상을 나란히 두지 않는다', weights: { present: 3, read: 2, explore: 3 } },
  { id: 'detail_omitted', asp: ':~ view(V), omits_detail(V). [w]', meaning: '수식·표 같은 세부를 생략한다', weights: { present: 2, read: 5, explore: 4 } },
  { id: 'no_print', asp: ':~ view(V), not printable(V). [w]', meaning: '인쇄·PDF 공유가 어렵다', weights: { present: 0, read: 2, explore: 0 } },
]

// 위반 횟수 n(v). 표시되지 않은 제약은 0회 (만족).
export const VIOLATIONS: Record<ViewId, Record<string, number>> = {
  paper: { no_overview: 1, scroll_heavy: 1, small_text: 1, no_side_by_side: 1 },
  deck: { no_overview: 1, detail_omitted: 1, no_print: 1 },
  explorer: { small_text: 1, too_many_panels: 1, nonlinear_order: 1, no_print: 1 },
}

// 각 보기를 설명하는 facts (토스트에서 보여 준다)
export const FACTS: Record<ViewId, string[]> = {
  paper: ['view(paper).', 'layout(single_column).', 'body_size(paper,18).', 'long_scroll(paper).', 'paper_order(paper).', 'printable(paper).'],
  deck: ['view(deck).', 'layout(one_part_per_screen).', 'body_size(deck,28).', 'paper_order(deck).', 'omits_detail(deck).'],
  explorer: ['view(explorer).', 'layout(sidebar_cards).', 'body_size(explorer,15).', 'persistent_toc(explorer).', 'panels_per_screen(explorer,6).'],
}

export function cost(view: ViewId, ctx: ContextId): number {
  return SOFT.reduce((sum, c) => sum + c.weights[ctx] * (VIOLATIONS[view][c.id] ?? 0), 0)
}

export function ranking(ctx: ContextId): { view: ViewId; cost: number }[] {
  return VIEWS.map((v) => ({ view: v.id, cost: cost(v.id, ctx) })).sort((a, b) => a.cost - b.cost)
}

export function viewLabel(id: ViewId): string {
  return VIEWS.find((v) => v.id === id)!.label
}

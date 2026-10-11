import { useState } from 'react'
import type { VisualizationSpec } from 'vega-embed'
import { Code } from '../components/Code'
import type { Lang } from '../components/highlight'
import { CARS_URL, VegaChart } from '../components/VegaChart'

// 논문 §4.3.2, Fig. 5, 6의 예시를 그대로 따른다.
const STAGES: { title: string; who: string; code: string; lang: Lang; note: string }[] = [
  {
    title: '부분 명세',
    who: '사용자',
    lang: 'json',
    code: `{
  "data": {"url": "cars.csv"},
  "encoding": [
    {"channel": "x", "bin": true, "field": "horsepower"}
  ]
}`,
    note: '"binned horsepower를 x축에 보여 줘." mark와 나머지 인코딩은 비워 둡니다.',
  },
  {
    title: '데이터 facts',
    who: 'Draco',
    lang: 'asp',
    code: `num_rows(407).
fieldtype(name,string).
cardinality(name,311).
fieldtype(miles_per_gallon,number).
cardinality(miles_per_gallon,130).
...`,
    note: '스키마를 따로 주지 않으면 데이터셋에서 필드, 타입, 데이터 속성을 추론합니다.',
  },
  {
    title: '질의 제약',
    who: 'Draco',
    lang: 'asp',
    code: `encoding(e1).
:- not channel(e1,x).
:- not field(e1,horsepower).
:- not bin(e1,_).`,
    note: '질의를 hard constraint로 컴파일해 설계 공간을 질의와 맞는 부분 공간으로 좁힙니다.',
  },
  {
    title: '최적 완성',
    who: 'Clingo',
    lang: 'asp',
    code: `% knowledge base(정의, hard, soft, weights)와 합쳐 풀기
encoding(e2).
channel(e2,y).
aggregate(e2,count).`,
    note: 'Clingo가 비용이 가장 낮은 answer set을 찾았습니다. y축에 count 집계를 추가했고, 결과는 Vega-Lite로 변환됩니다.',
  },
]

const HIST: VisualizationSpec = {
  data: { url: CARS_URL },
  mark: { type: 'bar', tooltip: true },
  encoding: {
    x: { field: 'Horsepower', type: 'quantitative', bin: true },
    y: { aggregate: 'count', type: 'quantitative' },
  },
  height: 160,
}

export function Pipeline() {
  const [i, setI] = useState(0)
  const s = STAGES[i]
  return (
    <div className="demo">
      <ol className="pipeline" aria-label="질의 처리 단계">
        {STAGES.map((st, k) => (
          <li key={k}>
            <button className={k === i ? 'on' : k < i ? 'done' : ''} onClick={() => setI(k)} aria-current={k === i ? 'step' : undefined}>
              <span className="pipe-who">{st.who}</span>
              {st.title}
            </button>
          </li>
        ))}
      </ol>
      <div className="compare">
        <div>
          <Code code={s.code} lang={s.lang} caption={`${i + 1}. ${s.title}`} />
          <p>{s.note}</p>
          <div className="row-buttons">
            <button className="ghost" disabled={i === 0} onClick={() => setI(i - 1)}>← 이전</button>
            <button className="primary" disabled={i === STAGES.length - 1} onClick={() => setI(i + 1)}>다음 →</button>
          </div>
        </div>
        <div className="pipe-out">
          {i === STAGES.length - 1 ? (
            <VegaChart spec={HIST} label="마력 히스토그램" />
          ) : (
            <p className="placeholder">마지막 단계에서 결과 차트가 나타납니다.</p>
          )}
        </div>
      </div>
      <p className="caption">코드는 논문 §4.3의 예시입니다. 차트는 vega-datasets cars 데이터(406행)로 그렸고, 논문의 num_rows(407)과는 데이터 버전 차이가 있습니다.</p>
    </div>
  )
}

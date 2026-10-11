import type { ComponentType, ReactNode } from 'react'
import { Code } from '../components/Code'
import { CodePair } from '../demos/CodePair'
import { SpecPlayground } from '../demos/SpecPlayground'
import { DesignSpace } from '../demos/DesignSpace'
import { WeightSliders } from '../demos/WeightSliders'
import { Pipeline } from '../demos/Pipeline'
import { RankDemo } from '../demos/RankDemo'
import { PairHarvest } from '../demos/PairHarvest'
import { EvidenceDemo } from '../demos/Evidence'

// 모든 보기(Paper / Deck / Explorer)가 공유하는 단일 콘텐츠 원본 (docs/03_outline.md)
// kind: paper = 논문 내용, review = 우리의 평가
export type Section = {
  id: string
  num: number
  title: string
  cite: string
  kind: 'paper' | 'review'
  lead: string
  points: ReactNode[]
  detail?: ReactNode
  Demo?: ComponentType
}

const EDITOR_URL = 'https://idl.uw.edu/draco-editor/#/editor'

export const SECTIONS: Section[] = [
  {
    id: 'cover',
    num: 0,
    title: 'Draco: 시각화 설계 지식을 제약으로',
    cite: 'Moritz et al., IEEE TVCG 25(1), 2019',
    kind: 'paper',
    lead: '좋은 시각화의 지식을 제약으로 쓰면, 컴퓨터가 추천하고 데이터가 고친다.',
    points: [
      <><i>Formalizing Visualization Design Knowledge as Constraints: Actionable and Extensible Models in Draco</i></>,
      <>Dominik Moritz, Chenglong Wang, Greg L. Nelson, Halden Lin, Adam M. Smith, Bill Howe, Jeffrey Heer</>,
      <><b>메타 장치:</b> 이 사이트의 세 가지 보기(Paper · Deck · Explorer)를 Draco의 비용 모델로 평가합니다. 위반한 soft constraint의 weight 합이 비용입니다(weight는 이 사이트용으로 정한 값).</>,
    ],
    detail: (
      <>
        <p>DOI: <a href="https://doi.org/10.1109/TVCG.2018.2865240">10.1109/TVCG.2018.2865240</a></p>
        <p>이 리뷰는 2019년 논문에 실린 Draco만 다룹니다. 이후 버전은 마지막 파트의 "리뷰 범위 밖" 칸에서만 언급합니다.</p>
      </>
    ),
  },
  {
    id: 'problem',
    num: 1,
    title: '문제: 지침과 도구 사이의 간극',
    cite: '§1, §2.1',
    kind: 'paper',
    lead: '지각 실험 결과는 계속 쌓이는데 도구에는 늦게 반영되고, 시스템마다 설계 지식을 따로 구현한다.',
    points: [
      <>설계자는 원칙을 알아도 실제로는 잘 따르지 않습니다. 자동 설계 도구가 이 틈을 메우려 합니다.</>,
      <>기존 시스템(APT, CompassQL 등)은 서로의 지식 베이스를 <b>재사용하지 않습니다</b>.</>,
      <>제안: 설계 지식을 <b>공유할 수 있는 형식 모델</b>, 즉 hard/soft constraints의 집합으로 만들자.</>,
    ],
    detail: (
      <table>
        <thead><tr><th>시스템</th><th>지식 표현</th><th>탐색 / 순위</th></tr></thead>
        <tbody>
          <tr><td>APT (1986)</td><td>약 200개 logic 규칙, expressiveness·effectiveness</td><td>깊이 우선 탐색 + backtracking</td></tr>
          <tr><td>CompassQL</td><td>imperative JavaScript, hand-tuned 점수</td><td>generate-and-test (모두 생성 후 검사)</td></tr>
          <tr><td><b>Draco</b></td><td>ASP 제약 (hard + soft) + weight</td><td>Clingo solver, weight는 데이터로 학습</td></tr>
        </tbody>
      </table>
    ),
  },
  {
    id: 'vegalite',
    num: 2,
    title: 'Vega-Lite: 차트를 선언하는 문법',
    cite: '§2.3, §4.1',
    kind: 'paper',
    lead: "Vega-Lite는 차트를 '데이터 + mark + encoding'의 JSON으로 선언하는 고수준 문법이다.",
    points: [
      <>Wilkinson의 Grammar of Graphics, ggplot2, Tableau의 VizQL에서 영감을 받은 언어입니다.</>,
      <>차트 하나 = <b>mark</b> 하나(bar, point, tick …) + <b>encoding</b> 여러 개. encoding은 데이터 field를 channel(x, y, color …)에 대응시키고, type(nominal / ordinal / quantitative / temporal)과 bin·aggregate 같은 변환을 붙입니다.</>,
      <>scale, axis처럼 적지 않은 값은 컴파일러가 type에 맞게 채웁니다. 그래서 명세가 짧고, 가능한 차트를 탐색하고 추론하기 좋습니다.</>,
    ],
    detail: (
      <>
        <p>Vega-Lite는 단일 뷰 외에 facet(trellis), layer, concat도 지원하지만, 논문은 <b>단일 뷰와 row / column facet</b>만 다룹니다. 이 범위로도 막대, 히스토그램, 점, 산점도, 선, 영역 차트를 표현할 수 있습니다(§2.3).</p>
        <p>Vega-Lite 원 논문: A. Satyanarayan, D. Moritz, K. Wongsuphasawat, J. Heer. "Vega-Lite: A Grammar of Interactive Graphics." IEEE TVCG 23(1), 2017 (Draco 논문의 참고문헌 [52]).</p>
      </>
    ),
    Demo: SpecPlayground,
  },
  {
    id: 'facts',
    num: 3,
    title: 'Vega-Lite 명세를 facts로',
    cite: '§4.1, Fig. 2',
    kind: 'paper',
    lead: 'Draco는 Vega-Lite 명세의 JSON 중첩을 풀어 평평한 logical facts로 옮긴다.',
    points: [
      <>mark는 <code>mark(bar).</code> 하나로, encoding은 id를 붙여 <code>encoding(e0).</code>로 씁니다.</>,
      <>field, type, aggregate는 그 id에 붙는 사실이 됩니다: <code>field(e0,cylinders).</code>, <code>type(e0,ordinal).</code></>,
      <>채널도 <code>channel(e0,x).</code>라는 사실입니다. 데이터의 성질과 사용자 과업도 같은 식의 facts로 적어 규칙이 함께 참조합니다.</>,
    ],
    detail: (
      <>
        <p>채널마다 predicate(<code>field_x</code> 등)를 두지 않고 <code>channel(E,C)</code> 형태로 일반화했습니다. 그래야 detail 채널을 여러 번 쓸 수 있고, 특정 채널에 묶이지 않은 일반 제약을 쓰기 쉽습니다(§4.1).</p>
        <p>데이터 스키마는 <code>num_rows/1</code>, <code>fieldtype/2</code>, <code>cardinality/2</code>, <code>entropy/2</code>, <code>extent/3</code>, 사용자 과업은 <code>task/1</code>(value / summary)과 <code>interesting/2</code>로 표현합니다.</p>
      </>
    ),
    Demo: CodePair,
  },
  {
    id: 'asp',
    num: 4,
    title: '규칙을 쓰는 언어: Answer Set Programming',
    cite: '§3',
    kind: 'paper',
    lead: '규칙과 제약을 선언하면 solver가 답(answer set)을 찾는다. :- 는 금지, :~ 는 벌점이다.',
    points: [
      <><code>A :- B, not C.</code> B가 참이고 C를 도출할 수 없으면 A가 참입니다.</>,
      <><code>:- B.</code> (hard) B인 해는 버립니다. <code>:~ B. [w]</code> (soft) B이면 비용 w를 더합니다.</>,
      <>최적 answer set은 위반한 soft constraint의 weight 합이 가장 작은 해입니다.</>,
    ],
    detail: (
      <>
        <table>
          <thead><tr><th>형태</th><th>의미</th><th>예</th></tr></thead>
          <tbody>
            <tr><td><code>A.</code></td><td>fact</td><td><code>power_on.</code></td></tr>
            <tr><td><code>A :- B, not C.</code></td><td>rule</td><td><code>light_on :- power_on, not broken.</code></td></tr>
            <tr><td><code>:- B.</code></td><td>hard constraint</td><td><code>:- log(E), zero(E).</code></td></tr>
            <tr><td><code>:~ B. [w]</code></td><td>soft constraint</td><td><code>:~ continuous(E), not zero(E). [5]</code></td></tr>
            <tr><td><code>l {'{'} A; B {'}'} k</code></td><td>aggregate (l~k개만 참)</td><td><code>1 {'{'} mark(bar); mark(line); mark(area); mark(point) {'}'} 1.</code></td></tr>
          </tbody>
        </table>
        <p><code>not</code>은 "거짓"이 아니라 "도출할 수 없음"입니다(negation as failure). Draco는 ASP solver로 <b>Clingo</b>를 씁니다(§2.4).</p>
      </>
    ),
  },
  {
    id: 'space',
    num: 5,
    title: '설계 공간과 hard constraints',
    cite: '§4.2.1, Fig. 3',
    kind: 'paper',
    lead: '가능한 모든 조합 가운데 문법에 어긋나는 것(ill-formed)과 데이터를 제대로 전달하지 못하는 것(non-expressive)을 잘라낸다.',
    points: [
      <><b>Aggregate rules</b>로 각 속성이 가질 수 있는 값(도메인)을 정합니다.</>,
      <><b>Well-formedness</b>: shape는 point mark에만, log scale에는 0을 넣을 수 없음.</>,
      <><b>Expressiveness</b>: 막대는 0 기준선 필수, size는 nominal 데이터에 쓸 수 없음.</>,
    ],
    detail: (
      <>
        <Code caption="Hard constraint 예시 (§4.2.1)" code={`:- channel(_,shape), not mark(point).
:- log(E), zero(E).
:- channel(E,shape), cardinality(E,C), C > 8.   % Vega-Lite shape는 8종
:- mark(bar), channel(E,(x;y)), continuous(E), not zero(E).
:- channel(E,size), type(E,nominal).`} />
        <p>일부 hard constraint는 "좋은 디자인"이 아니라 Vega-Lite 구현의 한계를 반영합니다(예: shape 8종). 제약끼리 충돌하면 해가 하나도 없는 빈 공간이 되므로 주의해야 합니다.</p>
      </>
    ),
    Demo: DesignSpace,
  },
  {
    id: 'soft',
    num: 6,
    title: 'Soft constraints와 비용',
    cite: '§4.2.2, §6.2',
    kind: 'paper',
    lead: '남은 후보는 위반한 선호의 weight 합으로 줄을 세운다. weight를 바꾸면 최적 차트가 바뀐다.',
    points: [
      <><code>:~ continuous(E), not zero(E). [5]</code> 연속형 필드는 0을 포함하는 편이 좋다. 위반하면 비용 5.</>,
      <>같은 제약을 인코딩마다 여러 번 위반할 수 있습니다. 비용 = Σ weight × 위반 횟수.</>,
      <>문제: weight를 손으로 맞추려면 모든 제약 사이의 trade-off를 한꺼번에 고려해야 합니다.</>,
    ],
    detail: (
      <>
        <p className="formula">Cost(v) = Σᵢ wᵢ · n<sub>pᵢ</sub>(v) = xᵀw</p>
        <p>x = [n<sub>p1</sub>(v), …, n<sub>pk</sub>(v)]는 soft constraint별 위반 횟수를 모은 <b>feature vector</b>이고, w는 weight 벡터입니다. 둘 다 k차원(k = soft constraint 수)입니다. 정규화하지 않은 가중합이므로 가중평균과는 다릅니다.</p>
        <table>
          <caption>Draco-APT 채널 선호 (§6.1, 낮을수록 선호)</caption>
          <thead><tr><th>타입</th><th>x</th><th>y</th><th>color</th><th>size</th><th>shape</th></tr></thead>
          <tbody>
            <tr><td>quantitative</td><td>1</td><td>1</td><td>3</td><td>2</td><td>–</td></tr>
            <tr><td>ordinal</td><td>1</td><td>1</td><td>2</td><td>3</td><td>–</td></tr>
            <tr><td>nominal</td><td>1</td><td>1</td><td>2</td><td>4</td><td>3</td></tr>
          </tbody>
        </table>
      </>
    ),
    Demo: WeightSliders,
  },
  {
    id: 'query',
    num: 7,
    title: '질의에서 차트로',
    cite: '§4.3, Fig. 5, 6',
    kind: 'paper',
    lead: '부분 명세 → 데이터 facts + 질의 제약 → Clingo → Vega-Lite. 사용자는 아는 것만 적고 나머지는 Draco가 채운다.',
    points: [
      <>질의는 모르는 속성을 비워 둔 <b>부분 명세</b>, 데이터셋, 사용자 과업으로 이루어집니다.</>,
      <>Draco는 질의를 제약으로 컴파일해 knowledge base와 합친 뒤 Clingo로 최적 answer set을 찾습니다.</>,
      <>예: "binned horsepower를 x축에"라는 질의에 y축 count 집계를 더해 히스토그램을 완성합니다.</>,
    ],
    detail: (
      <p>여기서 "최적"은 절대적으로 가장 좋은 디자인이 아닙니다. <b>정의된 선호 아래에서 더 나은 대안이 없는 명세</b>라는 뜻입니다. 저자들은 시스템이 사용자 의도를 완전히 알 수 없고, 분석은 여러 뷰를 오가는 반복 과정이라는 점을 들어 이렇게 한정합니다(§4).</p>
    ),
    Demo: Pipeline,
  },
  {
    id: 'learn',
    num: 8,
    title: 'weight를 데이터에서 배우기: learning to rank',
    cite: '§2.5, §5, §6.3.1',
    kind: 'paper',
    lead: '정답 차트는 없지만 "A가 B보다 낫다"는 실험 결과는 있다. 그래서 점수가 아니라 순서를 배운다.',
    points: [
      <>부분 명세마다 유일한 최적 완성이 없어서, "이 질의의 정답 차트" 같은 학습 데이터는 만들 수 없습니다(§2.5).</>,
      <>지각 실험은 "같은 데이터·과업에서 A가 B보다 유의하게 정확했다"는 <b>순위 쌍</b>을 만듭니다. 서로 다른 실험의 쌍도 섞을 수 있습니다.</>,
      <>각 차트는 Clingo로 센 soft constraint 위반 횟수 <code>x = [n₁(v), …, n_k(v)]</code>로 바뀝니다. 비용은 <code>wᵀx</code>이므로 배울 것은 w뿐입니다.</>,
    ],
    detail: (
      <>
        <p>순위 쌍 수집(§6.3.1): 응답을 (데이터 스키마, 과업)별로 묶고, 묶음 안에서 시각화 쌍을 모두 만든 뒤, 정확도나 시간 차이가 Fisher's test에서 p &lt; 0.01인 쌍만 남깁니다. Kim &amp; Heer에서 약 1,100쌍, Saket et al.에서 10쌍을 얻었습니다.</p>
        <p>Learning to rank는 원래 검색 결과를 정렬하려고 발전한 방법입니다(참고문헌 [36]). 항목 하나의 점수를 맞히는 pointwise, 두 항목의 순서를 맞히는 pairwise, 목록 전체를 최적화하는 listwise가 있고, Draco는 pairwise인 RankSVM을 씁니다.</p>
      </>
    ),
    Demo: PairHarvest,
  },
  {
    id: 'ranksvm',
    num: 9,
    title: 'RankSVM: 순위 쌍을 분류 문제로',
    cite: '§5, §6.3',
    kind: 'paper',
    lead: '두 차트의 비용 차이 wᵀ(x1 − x2)의 부호만 맞히면 된다. 순위 학습이 선형 SVM 분류가 된다.',
    points: [
      <>쌍 비교: f(v1, v2) = Cost(v1) − Cost(v2) = wᵀ(x1 − x2). 차이 벡터 하나를 "v1이 낫다 / v2가 낫다"로 분류합니다.</>,
      <>hinge loss + L2 정규화(λ = 0.1). 선호되는 차트의 비용이 <b>1 이상</b> 낮아야 손실이 0입니다.</>,
      <>학습된 w가 곧 soft constraint의 weight입니다. 새 규칙은 weight 0에서 시작해 다시 학습하면 됩니다.</>,
    ],
    detail: (
      <>
        <p className="formula">L = (1/n) Σᵢ max(0, 1 − yᵢ wᵀ(xᵢ1 − xᵢ2)) + λ‖w‖²</p>
        <p>(v1, v2; y)와 (v2, v1; −y)는 같은 정보라서 모든 쌍을 (선호, 비선호; −1) 꼴로 맞춰도 클래스 불균형이 생기지 않습니다(§5). 학습에는 scikit-learn의 SVM을 그대로 썼고, 데이터는 학습 55%, 검증 15%, 테스트 30%로 나눴습니다(§6.3). 결과는 Part 10에서 봅니다.</p>
        <p>논문은 이 선호 모델을 Markov Logic Network로 해석합니다. 최적 완성 찾기는 MAP 추론과 같고, ASP solver가 비용을 최소화하므로 partition function을 계산할 필요가 없습니다(Appendix).</p>
      </>
    ),
    Demo: RankDemo,
  },
  {
    id: 'evidence',
    num: 10,
    title: '증거: Draco-APT → Draco-CQL → Draco-Learn',
    cite: '§6, Fig. 7, 8',
    kind: 'paper',
    lead: '같은 일을 더 짧은 코드로 더 빠르게 하고, 실험 결과를 반영해 과업에 따라 다른 차트를 추천한다.',
    points: [
      <><b>Draco-APT</b>: APT의 importance ordering을 우선순위가 있는 soft constraint <code>[w@P,E]</code>로 재현.</>,
      <><b>Draco-CQL</b>: CompassQL과 같은 결과, 훨씬 적은 코드, 더 나은 확장성.</>,
      <><b>Draco-Learn</b>: 실험 데이터로 학습한 weight로 과업(value / summary)을 구분.</>,
    ],
    detail: (
      <>
        <p>CompassQL에서 JS 14줄인 "단일 채널은 한 번만" 규칙이 Draco에서는 <code>:- single_channel(C), 2 {'{'} channel(_,C) {'}'}.</code> 한 줄입니다(§6.2).</p>
        <p>실험 데이터: Kim &amp; Heer는 산점도 12종에 참가자 1,920명, 응답 185,000건, Saket et al.은 참가자 180명. Draco-Learn은 설계 공간을 실험 범위로 제한한 상태에서 48개(Kim)와 8개(Saket) 조건 모두 최상위 인코딩을 냈습니다(§6.3).</p>
      </>
    ),
    Demo: EvidenceDemo,
  },
  {
    id: 'critique',
    num: 11,
    title: '평가: 강점과 한계',
    cite: '§7 + 리뷰어 의견',
    kind: 'review',
    lead: '지식과 탐색을 분리한 설계는 강력하지만, 학습 데이터가 좁고 규칙 자체는 여전히 사람이 쓴다.',
    points: [
      <><b>강점</b>: 관심사 분리, 간결성, 확장성(새 규칙은 weight 0에서 시작), 데이터 기반 weight, MLN이라는 이론적 토대.</>,
      <><b>한계</b>: 학습 쌍 대부분이 산점도 12종에서 나옴, weight만 학습, 선형 비용 모델, 단일 뷰와 facet만 다룸.</>,
      <>93% 대 65%는 같은 실험 분포의 테스트 쌍에서 잰 값입니다. hand-tuned 모델은 task weight가 0이라 불리한 비교일 수 있습니다.</>,
    ],
    detail: (
      <div className="compare">
        <div>
          <h4>강점</h4>
          <ul>
            <li>"무엇이 좋은가"(지식)와 "어떻게 찾는가"(검색)를 분리했습니다.</li>
            <li>CompassQL 4,324줄이 제약 180개로 줄었습니다.</li>
            <li>손으로 weight를 고칠 때 생기는 "국소 변경, 전역 효과" 문제를 학습으로 바꿨습니다.</li>
            <li>"최적"의 의미를 겸손하게 한정했습니다.</li>
          </ul>
        </div>
        <div>
          <h4>한계와 리뷰어 메모</h4>
          <ul>
            <li>전체 Vega-Lite 공간에서 Learn이 CQL보다 낫다는 증거는 없습니다. 사용자 연구도 없습니다.</li>
            <li>과업 모델은 value / summary 두 가지뿐이고, overplotting 같은 저수준 요인은 명세에 드러나지 않습니다.</li>
            <li>표기: §6.2에서 hard constraint(<code>:-</code>)를 "prefer not to"라고 설명합니다.</li>
            <li>표기: §5에서 SVM 분류를 "linear regression"이라고 부릅니다.</li>
          </ul>
        </div>
      </div>
    ),
  },
  {
    id: 'discussion',
    num: 12,
    title: '토론과 더 보기',
    cite: '§7.2',
    kind: 'review',
    lead: '"좋은 시각화"를 weight로 요약할 수 있을까? 직접 2019 Draco를 돌려 보며 생각해 보자.',
    points: [
      <>실험실의 정확도와 시간이 실제 분석 상황의 "좋음"을 대표할까?</>,
      <>LLM이 차트를 추천하는 지금, 규칙 기반 형식 모델의 가치는 무엇일까? (설명 가능성, 검증 가능성, 일관성)</>,
      <>수업에서 배운 설계 원칙 하나를 Draco 제약으로 써 본다면?</>,
    ],
    detail: (
      <>
        <p>논문이 제안한 다른 쓰임(§7.2): 시각화 맞춤법 검사기(unsat core로 자동 교정), 설계 공간 탐색과 군집화, 효과성 연구끼리의 비교, 설계자용 도구.</p>
        <ul className="links">
          <li><a href={EDITOR_URL}>2019 Draco Editor (브라우저에서 ASP 실행)</a></li>
          <li><a href="https://doi.org/10.1109/TVCG.2018.2865240">논문 DOI</a></li>
          <li><a href="https://uwdata.github.io/draco/">논문에 적힌 공개 주소 (현재는 리다이렉트됨)</a></li>
        </ul>
        <aside className="out-of-scope">
          <b>[리뷰 범위 밖] 이후 이야기</b>
          <p>저자들은 이후 Draco 2를 발표했습니다. 이 리뷰의 내용은 모두 2019 논문 기준입니다.</p>
        </aside>
      </>
    ),
  },
]

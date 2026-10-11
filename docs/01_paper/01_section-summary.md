# 01. 섹션별 요약

> 원문 섹션 순서를 따른다. 괄호 안의 §, Fig 번호는 원문 기준이다.

## 한 문장 요약

시각화 설계 지식을 **hard/soft constraints의 집합**으로 형식화하고 Answer Set Programming(ASP)으로 최적의 시각화를 찾는다. 나아가 soft constraint의 **weight를 실험 데이터에서 학습**해서 연구 결과가 실제 도구로 빠르게 옮겨가게 하자는 논문이다.

## Abstract / §1 Introduction — 문제 제기

- **간극(gap):** 시각화 설계 지침(책, 논문, 실험)과 실제 시각화 도구 사이에 간극이 있다. 새로운 지각(perception) 실험 결과가 도구에 반영되는 속도가 느리다.
- **원인:** 지식을 표현하고 공유할 공통 매체가 없다. 기존 자동 설계 시스템(APT, CompassQL 등)은 각자 독자적인 방식으로 지식을 구현했고, 서로의 지식 베이스를 재사용하지 않는다.
- **제안:** Draco
  - 시각화를 **logical facts의 집합**으로 표현한다.
  - 설계 지침을 그 facts 위의 **hard constraints**(반드시 만족해야 함, 예: shape 인코딩으로는 정량값을 표현할 수 없음)와 **soft constraints**(선호, 예: 시간 데이터는 기본적으로 x축에 둠)로 표현한다.
  - soft constraint의 weight를 바꾸면 선호 간 trade-off가 달라진다. 하지만 손으로 고치면 국소적인 변경이 예상하지 못한 전역 효과를 낸다. 그래서 **learning to rank**로 weight를 자동 학습한다.
- **평가 계획:** (1) APT와 CompassQL을 Draco로 재구현해 표현력과 성능을 보이고, (2) 두 지각 실험(Kim & Heer, Saket et al.)에서 weight를 학습해 hand-tuned 모델과 비교한다.
- **비전:** 설계 지식을 커뮤니티가 공유하는 **진화하는 knowledge base**로 만든다. 도구 개발자는 ad-hoc 규칙을 다시 구현하지 않아도 되고, 연구자는 결과를 "제약 몇 개와 weight 업데이트"로 배포할 수 있다.

## §2 Related Work — 위치 짓기

| 축 | 선행 연구 | Draco의 차별점 |
|---|---|---|
| 자동 설계 | **APT** (Mackinlay 1986): expressiveness/effectiveness 기준, 약 200개 logic 규칙, DFS + backtracking | 현대적 constraint solver, Vega-Lite 출력, 여러 경쟁 기준을 함께 다룸 |
| | **SAGE**: cardinality 등 데이터 속성 / **BOZ**: 지각 과업(task) / **ShowMe**: trellis | 데이터 속성, task, faceting을 모두 모델에 포함 |
| | **CompassQL** (Voyager): hand-tuned 점수, imperative JavaScript | 가장 비슷한 시스템. 차이는 선언형 표현 + **실험 데이터로부터 weight 학습** |
| 효과성 연구 | Bertin, Cleveland & McGill의 채널 순위 → 최근의 앙상블/과업 연구(Kim & Heer, Saket et al.) | 고전적인 엄격한 순위와 데이터·과업 의존 효과를 한 시스템에 통합 |
| 명세 언어 | VizQL, ggplot2, Grammar of Graphics → **Vega-Lite** | Vega-Lite의 논리적 표현(CompassQL을 따름). 단일 뷰와 facet 뷰에 집중 |
| 제약 프로그래밍 | 스케줄링, 그래픽 디자인(ThingLab), 게임 레벨 디자인 | ASP + **Clingo** solver. CompassQL은 불가능한 해까지 열거하느라 자원을 낭비함 |
| 선호 학습 | VizDeck (선형 점수, 정해진 차트 집합) | soft constraint = 특징(feature) → **Markov Logic Network**. 순위가 매겨진 쌍(ranked pairs)에서 **RankSVM**으로 학습 |

학습 데이터 문제: "부분 명세와 최적 완성"의 쌍은 구하기 어렵다. 단 하나의 정답이 없기 때문이다. 그래서 **"A가 B보다 낫다"는 순위 쌍**을 학습 데이터로 쓴다.

## §3 Background: ASP

- **Atom**(참/거짓 명제), **literal**(A 또는 `not A`), **rule** `A :- L1, ..., Ln.`
  - 예: `light_on :- power_on, not broken.` 전원이 켜져 있고 고장이라고 볼 근거가 없으면 불이 켜진다.
- **Fact:** 몸체가 없는 규칙 `power_on.`
- **Integrity constraint**(hard): 머리가 없는 규칙 `:- L0, ..., Ln.` 몸체가 참이면 모순이다.
- `not`은 "거짓"이 아니라 **"도출할 수 없음"**을 뜻한다(negation as failure).
- **Answer set (stable model):** 제약과 모순되지 않고, 도출로 정당화되며, 모르는 사실에 대해 최소인 atom들의 집합.
- **Aggregate rule** `l { A0; ...; An } k`: l개 이상 k개 이하가 참이다. 설계 공간을 정의할 때 쓴다.
- **Soft constraint** `:~ L0, ..., Ln. [w]`: 위반할 수 있지만 위반할 때마다 비용 w가 붙는다. **최적 answer set = 가중 위반 비용의 합이 최소인 answer set.**

## §4 Modeling Visualization Design in Draco

"최적"은 절대적으로 가장 좋은 디자인이라는 뜻이 아니다. **형식적으로 정의된 선호 기준에서 더 나은 대안이 없는 명세**라는 뜻이다. 저자들은 사용자 의도를 완전히 안다는 가정과 단일 뷰가 정답이라는 가정을 명시적으로 거부한다.

### §4.1 시각화 명세를 facts로

- Vega-Lite 명세 → atom: `mark(bar).`, `encoding(e0).`, `channel(e0,x).`, `field(e0,cylinders).`, `type(e0,ordinal).`, `aggregate(e1,mean).`, `bin/2`, `stack/1`, `zero/1`, `log/1` (Fig. 2)
- 데이터 스키마: `num_rows/1`, `fieldtype/2`, `cardinality/2`, `entropy/2`, `extent/3`
- 사용자 과업: `task/1` (value / summary, Kim & Heer의 분류), `interesting/2`
- 설계 결정: 채널마다 predicate(`field_x`)를 두지 않고 `channel(E,C)` 형태로 일반화했다. 확장하기 쉽고 detail 채널을 여러 번 쓸 수 있다. 확장 예로 `kurtosis/2`를 새로 추가할 수 있다.

### §4.2 설계 지식을 제약으로 (Fig. 3)

Fig. 3의 공간 구조: 가능한 모든 시각화 ⊃ 유효한 Vega-Lite ∩ Draco 탐색 공간. Hard constraint가 ill-formed 명세와 non-expressive 명세를 잘라내고, 남은 공간은 soft constraint로 순위를 매긴다.

**§4.2.1 설계 공간 정의 (hard)**
1. **Aggregate rules**로 속성 도메인을 정한다. 예: `1 { mark(bar); mark(line); mark(area); mark(point) } 1.`
2. **Well-formedness constraints**는 문법적으로 잘못된 명세를 제거한다.
   - `:- channel(_,shape), not mark(point).` (shape는 point mark에만 쓸 수 있음)
   - `:- log(E), zero(E).` (log scale은 0을 포함할 수 없음)
   - `:- channel(E,shape), cardinality(E,C), C > 8.` (Vega-Lite의 shape는 8종)
3. **Expressiveness constraints**는 데이터의 사실을 "전부, 그리고 그것만" 전달하지 못하는 명세를 제거한다.
   - `:- mark(bar), channel(E,(x;y)), continuous(E), not zero(E).` (막대는 0 기준선 필수)
   - `:- channel(E,size), type(E,nominal).` (size는 순서를 암시하므로 nominal 데이터에 쓸 수 없음)

**§4.2.2 선호 (soft)**
- `:~ continuous(E), not zero(E). [5]`: 연속형 필드는 0을 포함하는 편이 좋다. 막대가 아니면 생략할 수도 있으므로 soft로 둔다.
- 한 시각화가 같은 soft constraint를 **여러 번 위반**할 수 있다(인코딩마다).
- **비용 모델:** `Cost(v) = Σ wᵢ · n_pᵢ(v) = xᵀw`
  - x = [n_p1(v), ..., n_pk(v)]: 위반 횟수 벡터, 곧 시각화의 **feature vector**
  - w: weight 벡터
- weight를 손으로 정하려면 기존 제약 전부를 알고 균형을 맞춰야 한다. 그래서 §5의 학습이 필요하다.

### §4.3 제약을 풀어 명세 완성하기 (Fig. 4, 5, 6)

- 사용자 질의 = **partial specification**(모르는 속성은 비워 둠) + 데이터셋 + 과업. CompassQL 질의와 Vega-Lite 명세도 변환해서 받을 수 있다.
- 처리 과정 (Fig. 5):
  1. 데이터에서 스키마 facts를 추론한다.
  2. 질의를 제약으로 컴파일한다.
  3. knowledge base(aggregate rules, well-formedness, expressiveness, preference rules, weights)와 합친다.
  4. **Clingo**가 최적 answer set을 구한다.
  5. Vega-Lite로 역변환한다.
- 예시 (Fig. 6): "binned horsepower를 x축에"라는 질의에 대해 Draco는 y축에 `count` 집계 인코딩을 추가해 히스토그램을 완성한다.

## §5 Learning Preference Models

- 학습 데이터: `(v1, v2; y)`. y = −1이면 v1이 더 선호된다.
- 각 시각화를 Clingo로 돌려 **soft constraint 위반 횟수 벡터 x**로 만든다.
- `f(v1, v2) = Cost(v1) − Cost(v2) = wᵀ(x1 − x2)`의 부호로 선호를 판정한다.
- **RankSVM**: hinge loss + L2 정규화, λ = 0.1
  `L = (1/n) Σ max(0, 1 − yᵢ wᵀ(xᵢ1 − xᵢ2)) + λ‖w‖²`
- 쌍의 순서를 바꿔도 대칭이다. 그래서 모든 쌍을 (선호, 비선호; −1) 형태로 표준화할 수 있고 클래스 불균형 문제가 없다.
- 학습된 w*를 넣으면 knowledge base에 **전문가 지식(규칙 구조)과 경험적 데이터(weight)가 함께** 담긴다.

## §6 Demonstration — 점점 정교해지는 세 시스템

### §6.1 Draco-APT
- APT의 **importance ordering**(중요한 필드부터 가장 효과적인 채널에 배정)을 우선순위(priority) 레벨이 있는 soft constraint로 재현한다: `[w@P,E]`
- solver는 hard constraint를 먼저 만족시키고, 그다음 우선순위 순으로 soft constraint를 처리한다(사전식 최적화).
- 예: Q, Q, N, O 필드에 대해 두 가지 최적해가 나온다. q1/q2를 x/y에, N을 color에, O를 size에 둔다.

### §6.2 Draco-CQL
- CompassQL은 **generate-and-test** 방식이라 모든 후보를 만들고 검사한다.
- Draco는 hard constraint를 solver에 넘겨 탐색을 맡기고, 점수 함수는 soft constraint로 표현한다.
- **간결성:** CompassQL에서 JS 14줄인 채널 중복 금지 규칙이 `:- single_channel(C), 2 { channel(_,C) }.` 한 줄로 줄어든다.
- **결과:** CompassQL 테스트 스위트의 17개 질의 모두에서 **동일한 최적 명세**를 냈다.
- **규모:** Draco-CQL은 hard 70개 + soft 110개 제약. CompassQL은 4,324줄(hard 1,134줄, 점수 786줄).
- **성능 (Fig. 7):** 필드 25개와 인코딩 5개인 질의를 Draco는 0.5초 안에 풀었다. CompassQL은 몇 분 뒤 힙 메모리(4GB)가 부족해진다.

### §6.3 Draco-Learn
- 데이터: **Kim & Heer** (산점도 12종, 1 범주형 + 2 정량형, 1,920명, 185,000건 응답)와 **Saket et al.** (180명, bar/line/scatter)
- **순위 쌍 수집:** 데이터 스키마와 과업별로 묶고 → 시각화 쌍을 만들고 → 정확도나 시간에서 Fisher's test p < 0.01인 쌍만 남긴다. 결과는 Kim에서 약 1,100쌍, Saket에서 10쌍.
- Draco-CQL 제약에 task-channel, task-mark 상호작용 규칙을 추가했다. 새 규칙의 초기 weight는 0이고, 구현에 "몇 시간" 걸렸다.
- **정확도:** 학습 55% / 검증 15% / 테스트 30%로 나눴을 때 학습 모델은 테스트 정확도 **93%**, hand-tuned Draco-CQL은 **65%**(무작위 50%보다 조금 나은 수준)였다.
  - Saket 데이터에서는 Kim 데이터를 함께 넣어도 학습 정확도가 100%였다. 즉 서로 다른 출처의 데이터를 섞어도 성능이 떨어지지 않았다.
  - p 임계값을 0.1로 올리면 검증 정확도가 96%였다. 250쌍보다 적게 학습할 때부터 성능이 떨어진다(데이터에 중복이 있다는 뜻).
- **최적 인코딩:** 설계 공간을 실험 범위로 제한하고 조건 48개(Kim)와 8개(Saket) 모두에서 **최상위 성능 인코딩**을 찾았다.
- **Fig. 8:** Draco-CQL은 task 관련 weight가 0이어서 과업과 상관없이 같은 산점도(Q1→y, N→color)를 낸다. Draco-Learn은 **summary 과업이면 범주(N)별로 공간을 나눈 차트**를 낸다. 분포 특성(최소, 최대, 평균)을 읽기 쉽기 때문이다.

## §7 Discussion & Future Work

- **소프트웨어 공학 관점:** 문제를 "검색 알고리즘 설계"에서 "weight trade-off 정의"라는 더 다루기 쉬운 문제로 옮긴다. 지식 표현과 그 지식을 적용하는 코드를 분리한다.
- **확장 방향:** filtering/sorting 변환, 상호작용(Vega-Lite selection), 레이어와 대시보드 같은 **다중 뷰의 전역 일관성**, 더 풍부한 task taxonomy, 자연어 인터페이스
- **학습 확장:** 실험 데이터 공개 장려, active learning, **규칙 자체를 학습**(ILASP, inductive logic programming), Pareto 최적화, 저수준 특징(overplotting 등) 재순위화
- **자동 설계를 넘어서 (§7.2):**
  1. **시각화 맞춤법 검사기:** 위반 보고, unsat core로 자동 교정, 교육용 설명
  2. **설계 공간 탐색:** 비용 순위, 위반 벡터 기반 클러스터링, 선호 없이 모든 answer set을 열거해 말뭉치 생성
  3. **효과성 연구 비교:** 새 지침이 기존 지침과 충돌하는지, 기존 지침에 포함되는지 검사
  4. **도구 지원:** 설계 공간과 규칙 브라우저, 위반 이해, trade-off 미세 조정

## Appendix: Markov Logic Network 해석

- `P(v) = e^(−Cost(v)) / Σ_u e^(−Cost(u))`: 비용에 softmax를 씌운 확률 분포
- 두 시각화의 비용 차이 = 로그 확률 차이
- 최적 완성 찾기 = **MAP 추론**. ASP solver가 비용을 최소화하면 되므로 partition function을 계산할 필요가 없다.
- MLN은 속성 자체가 아니라 **구조적 특징 위의 선형 모델**이다. 예를 들어 "데이터 타입에 따라 달라지는 채널 순위" 같은 관계를 압축적이고 해석 가능하게 표현한다.

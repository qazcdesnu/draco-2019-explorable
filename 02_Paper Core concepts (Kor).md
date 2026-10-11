
## Paper

**Formalizing Visualization Design Knowledge as Constraints: Actionable and Extensible Models in Draco**

- 저자: Dominik Moritz, Chenglong Wang, Greg L. Nelson, Halden Lin, Adam M. Smith, Bill Howe, Jeffrey Heer
- 학술지: *IEEE Transactions on Visualization and Computer Graphics*, 25(1), 438–448, 2019
- DOI: https://doi.org/10.1109/TVCG.2018.2865240
- 프로젝트: https://idl.uw.edu/draco/ (논문에 적힌 원래 주소: https://uwdata.github.io/draco/ → 현재 idl.uw.edu/draco/로 리다이렉트됨)
- 2019 Draco 데모 (Draco Editor): https://idl.uw.edu/draco-editor/#/editor

## 연구 동기

시각화 설계 지침과 이를 실제 시각화 도구에 적용하는 것 사이에는 간극이 있다. 이 논문은 설계 지식을 constraints로 표현해 자동화된 시각화 설계 시스템에서 활용하고, 여러 연구의 결과를 통합하며, 검증하고 확장할 수 있도록 하는 방법을 제안한다.

## 1. Encoding

**정의:** Encoding은 데이터 속성(data attributes)을 시각적 마크(graphical marks)의 시각적 속성인 visual channels에 대응시키는 것을 의미한다.

- **Data attributes:** 키, 몸무게, 매출액, 범주 등 데이터 변수
- **Marks:** 점(points), 선(lines), 막대(bars) 등 데이터를 표현하는 시각적 요소
- **Visual channels:** 위치(position), 길이(length), 색상(color), 크기(size), 모양(shape) 등 마크의 시각적 속성

**예시:** Scatterplot에서 height를 x-position에, weight를 y-position에 대응시킬 수 있다. 대응 관계를 바꾸면 데이터 자체는 같더라도 visual encoding은 달라진다.

**Draco에서의 역할:** Draco는 어떤 data fields를 어떤 visual channels에 대응시킬지와 같은 설계 선택을 표현하고, design constraints를 이용해 가능한 encodings를 평가하거나 추천한다.

## 2. Vega-Lite 문법

**정의:** Vega-Lite는 시각화를 JSON으로 선언적으로 기술하는 고수준 시각화 문법(grammar of graphics)이다(Satyanarayan et al., 2017). 그리는 방법을 단계별로 지시하지 않는다. "어떤 데이터를, 어떤 mark로, 어떤 field를 어떤 channel에" 대응시킬지만 적으면 컴파일러가 나머지(scale, axis, legend 등)를 합리적인 기본값으로 채운다. Wilkinson의 Grammar of Graphics, ggplot2, Tableau의 VizQL에서 영향을 받았다.

### 기본 구조 (단일 뷰)

```json
{
  "data": {"url": "cars.csv"},
  "mark": "bar",
  "encoding": {
    "x": {"field": "Cylinders", "type": "ordinal"},
    "y": {"field": "Horsepower", "type": "quantitative", "aggregate": "mean"}
  }
}
```

위 명세는 실린더 수별 평균 마력을 막대 차트로 그린다. 논문 Fig. 2와 같은 예시다.

| 구성 요소 | 의미 | 값의 예 |
|---|---|---|
| `data` | 입력 데이터. 이름 있는 field를 가진 레코드들의 표 | `{"url": ...}`, `{"values": [...]}` |
| `mark` | 데이터 레코드를 나타내는 기하 도형 | `bar`, `point`, `line`, `area`, `tick`, `text`, `rect` 등 |
| `encoding` | channel → field 정의의 모음 | `x`, `y`, `color`, `size`, `shape`, `text`, `detail`, `row`, `column` |
| `transform` | (선택) 인코딩 전에 적용하는 데이터 변환 | `filter`, `calculate`, `aggregate`, `bin` 등 |

### Encoding 정의 안의 속성

- **`field`**: 시각화할 데이터 field
- **`type`**: 데이터 타입. `nominal`(범주, 순서 없음), `ordinal`(순서 있는 범주), `quantitative`(수치), `temporal`(시간)
- **변환**: `aggregate`(`count`, `mean`, `sum`, `median` 등), `bin`(구간화), `timeUnit`(시간 단위), `sort`, `stack`
- **`scale`**: 데이터 domain을 시각적 range로 대응시키는 방식. 예: `{"zero": true}`, `{"type": "log"}`
- **guide**: scale을 보여 주는 `axis`와 `legend`
- 생략한 속성은 channel과 data type에 맞춰 Vega-Lite 컴파일러가 **기본값을 추론**한다.

### 다중 뷰와 상호작용

- **View composition:** `facet`(또는 `row`/`column` channel로 만든 trellis), `layer`(겹치기), `concat`(나란히 배치), `repeat`
- **Interaction:** selection으로 brushing, 필터링, 하이라이트 같은 상호작용을 선언적으로 정의한다. 2019 Draco는 이를 다루지 않으며 향후 과제로만 언급한다(§7).

### Draco에서의 역할

1. **출력 언어:** Draco가 합성한 최적 설계는 Vega-Lite 명세로 반환되고, Vega-Lite가 그 명세를 렌더링한다(Fig. 1).
2. **논리적 표현의 기반:** Draco는 CompassQL을 따라 Vega-Lite를 logical facts로 옮긴다. 이때 JSON의 중첩을 풀어 평평한 predicate로 표현한다. 예를 들어 `scale.zero`는 `zero(E)`가 된다.

   | Vega-Lite JSON | Draco ASP fact |
   |---|---|
   | `"mark": "bar"` | `mark(bar).` |
   | `"x": {...}` | `encoding(e0). channel(e0,x).` |
   | `"field": "Cylinders"` | `field(e0,cylinders).` |
   | `"type": "ordinal"` | `type(e0,ordinal).` |
   | `"aggregate": "mean"` | `aggregate(e1,mean).` |
   | `"bin": true` | `bin/2` (논문은 predicate 형태만 제시. 질의 예시에서는 `bin(e1,_)`) |
   | `"scale": {"zero": true}` / `{"type": "log"}` | `zero(e).` / `log(e).` |
   | `"stack": ...` | `stack/1` |

3. **탐색에 적합한 설계:** Vega-Lite는 처음부터 가능한 시각화 공간을 탐색하고 추론하기 쉽게 설계되었다. 그래서 Draco 같은 자동 설계 시스템의 대상 언어로 적합하다.
4. **논문의 범위:** 논문은 Vega-Lite 전체가 아니라 **단일 뷰와 faceted 뷰**(`row`/`column`)만 다룬다. 이 부분집합으로도 bar, histogram, dot plot, scatter, line, area 차트를 표현할 수 있다. layer, concat, interaction은 향후 과제다.

**주의:** Hard constraint의 일부는 "좋은 디자인"이 아니라 **Vega-Lite 구현의 한계**를 반영한다. 예를 들어 shape는 8종뿐이므로 `:- channel(E,shape), cardinality(E,C), C > 8.` 같은 제약이 있다.

## 3. Soft and hard constraints

Draco는 시각화 설계 지식을 constraints로 표현한다. 두 개념의 핵심 차이는 규칙이 반드시 지켜야 하는 요건인지, 다른 선호와 절충할 수 있는 선호 사항인지에 있다.

### Soft constraints

**정의:** Soft constraint는 가능한 한 만족하는 것이 바람직하지만, 필요한 경우 위반할 수도 있는 설계 선호를 나타낸다. 제약 조건을 위반하면 비용(cost) 또는 페널티(penalty)가 발생하며, 시스템은 이를 이용해 후보 설계안 사이의 trade-off를 비교할 수 있다.

단순화한 목적 함수는 다음과 같다.

`Total cost = Σᵢ wᵢ vᵢ`

- `wᵢ`: 제약 조건 i의 상대적 중요도를 나타내는 weight
- `vᵢ`: 해당 제약 조건의 위반 여부 또는 위반 비용

목적이 total cost를 최소화하는 것이라면, weight가 큰 제약 조건을 위반한 설계안은 weight가 작은 제약 조건을 위반한 설계안보다 더 큰 페널티를 받는다.

**Draco에서의 역할:** Soft constraints를 사용하면 모든 설계 지침을 절대적인 규칙으로 취급하지 않고, 선호도의 정도를 표현할 수 있다. 이 논문은 graphical-perception experiments를 포함한 실험 데이터로부터 soft-constraint weights를 학습하는 방법도 다룬다.

### Hard constraints

**정의:** Hard constraint는 후보 해(candidate solution)가 반드시 만족해야 하는 조건이다. 이를 위반하는 후보는 유효한 해(valid solutions)의 집합에서 제외된다.

**Draco에서의 역할:** Hard constraints는 허용 가능한 설계(admissible designs)의 범위를 정한다. Soft constraints는 그 범위 안에 있는 설계안 중 어느 것이 더 바람직한지 구분하는 데 사용된다.

### 핵심 차이

- **Hard constraint — validity:** 이 설계안은 허용 가능한가?
- **Soft constraint — preference:** 허용 가능한 설계안 중 무엇이 더 바람직한가?

특정 설계 규칙을 hard constraint로 다룰지 soft constraint로 다룰지는 시스템이 해당 규칙을 어떻게 형식화하고 적용하는지에 따라 달라진다. 이 논문에서 특히 중요한 부분은 설계 선호를 soft constraints로 표현하는 방법과 실험 데이터로부터 그 weights를 학습하는 방법이다.

## 4. Answer Set Programming (ASP)

**정의:** ASP는 문제를 logical rules와 constraints로 표현하고, solver가 프로그램의 의미론을 만족하는 answer sets(형식적으로는 stable models)를 계산하도록 하는 declarative programming 패러다임이다.

**Imperative programming과의 차이:** 해결 절차의 각 단계를 일일이 지정하는 대신, 문제의 규칙을 정의하고 solver가 해를 탐색하도록 한다.

**Draco에서의 역할:**
1. 시각화 설계 지식을 logical rules와 constraints로 표현한다.
2. 규칙에 부합하는 후보 설계안을 탐색한다.
3. hard constraints를 위반하는 설계안을 제외한다.
4. 가중치가 적용된 soft constraints 등의 최적화 기준을 이용해 설계안을 평가하거나 선택한다.

**중요한 구분:** ASP는 규칙 기반 추론과 해 탐색을 담당한다. 실험 데이터로부터 soft-constraint weights를 학습하는 것은 이 메커니즘과 결합할 수 있는 별도의 학습 과정이다.

## 5. Learning to rank

**정의:** Learning to rank(LTR, 순위 학습)는 항목마다 "정답 점수"를 맞히는 대신, **항목들 사이의 순서**를 맞히도록 점수 함수를 학습하는 머신러닝 방법이다. 원래 검색 엔진에서 문서를 관련도 순으로 정렬하려고 발전했다(Liu, 2009; 논문 참고문헌 [36]).

### 왜 "점수"가 아니라 "순서"를 배우는가

- 많은 문제에서 절대적인 정답 레이블을 얻기 어렵다. 반면 "A가 B보다 낫다"는 **상대 비교**는 얻기 쉽고 더 믿을 만하다.
- 시각화가 대표적이다. 부분 명세에 대해 **유일한 최적 완성이 존재하지 않으므로**, "이 질의의 정답 차트는 X"라는 학습 데이터는 만들기 어렵다(§2.5).
- 대신 지각 실험은 "같은 데이터와 과업에서 차트 A의 정확도가 차트 B보다 유의하게 높았다"는 **순위 쌍(ranked pair)**을 자연스럽게 만들어 낸다.

### LTR의 세 가지 접근

| 접근 | 학습 단위 | 손실의 의미 | 예 |
|---|---|---|---|
| Pointwise | 항목 하나 | 각 항목의 점수나 등급을 회귀 또는 분류로 맞힘 | 선형 회귀로 점수 예측 |
| **Pairwise** | **항목 두 개** | 쌍의 순서를 맞히면 0, 틀리면 벌점 | **RankSVM**, RankNet |
| Listwise | 목록 전체 | 정렬된 목록 전체의 품질(예: NDCG)을 최적화 | ListNet, LambdaMART |

Draco는 **pairwise** 방식인 RankSVM을 쓴다.

### Draco에서의 수식

1. **Feature vector:** Clingo로 시각화 v를 검사해 soft constraint별 위반 횟수를 센다.
   `x(v) = [n_p1(v), ..., n_pk(v)]`
2. **비용 모델 (선형):** `Cost(v) = wᵀx(v)`. 비용이 낮을수록 선호한다.
3. **쌍 비교:** `f(v1, v2) = Cost(v1) − Cost(v2) = wᵀ(x1 − x2)`
   → 순위 문제가 **차이 벡터 (x1 − x2)에 대한 이진 분류**로 바뀐다.
4. **레이블:** v1이 선호되면 y = −1, 아니면 y = +1
5. **RankSVM 손실 (hinge + L2):**
   `L = (1/n) Σ max(0, 1 − yᵢ wᵀ(xᵢ1 − xᵢ2)) + λ‖w‖²`, λ = 0.1
   - v1이 선호될 때(y = −1) 손실이 0이 되려면 `Cost(v1) ≤ Cost(v2) − 1`이어야 한다. 즉 선호되는 차트의 비용이 **여유(margin) 1 이상** 낮아야 한다.
   - L2 항은 weight가 지나치게 커지는 것(과적합)을 막는다.
6. **대칭성:** (v1, v2; y)와 (v2, v1; −y)는 같은 정보다. 그래서 모든 쌍을 (선호, 비선호; −1) 형태로 통일할 수 있고 클래스 불균형을 걱정할 필요가 없다.

### 작은 예시

soft constraint가 두 개뿐이라고 가정하자.
- p1: nominal 필드를 color에 씀
- p2: nominal 필드를 size에 씀

실험 결과 차트 A(nominal → color)가 차트 B(nominal → size)보다 정확도가 유의하게 높았다.
- x_A = [1, 0], x_B = [0, 1] → 차이 d = x_A − x_B = [1, −1]
- 손실이 0이 되려면 `wᵀd = w1 − w2 ≤ −1`, 즉 **w2 ≥ w1 + 1**
- 모델은 "nominal을 size에 쓰는 것이 color에 쓰는 것보다 더 큰 벌점을 받아야 한다"를 배운다. 사람이 weight를 정하지 않아도 실험 결과가 weight로 옮겨진다.

### 실험 데이터 → 순위 쌍 (§6.3.1)

1. 응답 데이터를 (데이터 스키마, 과업)별로 묶는다.
2. 각 묶음 안에서 시각화끼리 가능한 모든 쌍을 만든다.
3. 정확도나 응답 시간 차이가 Fisher's test에서 p < 0.01인 쌍만 남긴다.
4. 결과: Kim & Heer에서 약 1,100쌍, Saket et al.에서 10쌍

### 결과와 의미

- 테스트 쌍의 순서 정확도: **학습된 weight 93%**, hand-tuned Draco-CQL 65%
- 서로 다른 실험의 쌍을 섞어 학습해도 각 데이터에서 성능이 떨어지지 않는다. 즉 **여러 연구 결과를 하나의 모델로 통합**할 수 있다. 이것이 논문 제목의 "Extensible"이 뜻하는 핵심이다.
- 새 규칙을 추가하면 weight를 0에서 시작해 다시 학습하면 된다.

### 한계

- **weight만 배운다.** soft constraint(특징) 자체는 여전히 사람이 만든다.
- **선형 모델이다.** 특징 사이의 상호작용은 규칙으로 따로 정의해야만 표현된다.
- **쌍 정확도와 최적 추천은 다르다.** 2위와 3위의 순서보다 1위를 맞히는 게 더 중요하다. 그래서 논문은 최적 인코딩을 찾는지 별도로 검증했다(48 + 8 조건).
- 실험이 다룬 좁은 설계 공간(주로 산점도) 밖으로 일반화된다는 보장은 없다.

**Draco에서의 역할:** ASP는 "주어진 weight로 최적 설계 찾기"를 맡고, learning to rank는 "그 weight를 실험 데이터로부터 정하기"를 맡는다. 비용이 feature 벡터의 선형 함수이기 때문에 이 둘이 깔끔하게 맞물린다.

## 개념 간 관계

1. **Encoding**은 데이터 속성을 visual channels에 어떻게 대응시킬지 결정하는 시각화 설계 선택이다.
2. **Vega-Lite**는 이러한 encoding을 JSON으로 기술하는 문법이다. Draco는 이를 logical facts로 옮겨 추론하고, 결과를 다시 Vega-Lite로 출력한다.
3. **Design knowledge**는 이러한 설계 선택에 관한 constraints로 형식화된다.
4. **Hard constraints**는 유효한 설계의 범위를 정하고, **soft constraints**는 유효한 설계안 사이의 선호도를 표현한다. Draco의 학습 관련 기여는 특히 soft constraints의 weights에 초점을 둔다.
5. **ASP**는 규칙을 만족하는 설계안을 탐색하고, 최적화와 결합해 가중치가 반영된 위반 비용이 낮은 설계안을 선호하도록 한다.
6. **Learning to rank**(RankSVM)는 실험에서 얻은 "A가 B보다 낫다"는 순위 쌍으로부터 soft constraint의 weight를 학습한다. 학습된 weight는 다시 ASP의 비용 최소화에 쓰인다.

## 논문을 읽으며 다시 확인할 질문

- Draco는 formal language에서 marks, data fields, visual channels를 어떻게 표현하는가?
- ASP에서 hard constraints와 soft constraints는 어떤 방식으로 표현되는가?
- Soft-constraint weights를 추정하는 데 어떤 objective function과 learning procedure를 사용하는가?
- Graphical-perception experiments의 결과를 constraints 또는 weights로 어떻게 변환하는가?
- 모델의 한계는 무엇이며, 새로운 design knowledge를 얼마나 쉽게 추가할 수 있는가?

## 원문 및 관련 링크

- 논문 DOI: https://doi.org/10.1109/TVCG.2018.2865240
- 저자 연구실 페이지: https://idl.uw.edu/papers/draco
- Draco 프로젝트: https://idl.uw.edu/draco/
  - 논문(§1)에 적힌 원래 주소는 https://uwdata.github.io/draco/ 이며, 현재는 위 주소로 리다이렉트된다.
  - 현재 프로젝트 페이지는 2019년 이후 버전 내용을 포함할 수 있으므로 2019 Draco 내용과 구분해서 볼 것.
- **2019 Draco 데모 (Draco Editor):** https://idl.uw.edu/draco-editor/#/editor
  - 이전 주소 https://uwdata.github.io/draco-editor/ 도 이 주소로 리다이렉트된다.
  - 2019 Draco로 판단한 근거 (2026-10-11 확인): Vega-Lite **v2** 스키마를 쓰고, clingo를 WebAssembly(`clingo.wasm`)로 브라우저에서 실행하며, `define.lp`·`weights.lp` 같은 ASP 파일과 "Channel rankings à la APT" 규칙을 포함한다.
- PubMed 서지 정보: https://pubmed.ncbi.nlm.nih.gov/30137004/

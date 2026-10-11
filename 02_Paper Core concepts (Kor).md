
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

### 발표 사이트에서의 구성 (Part 2, Part 3)

발표에서는 Vega-Lite를 두 단계로 나눠 설명한다. 논문도 Vega-Lite 소개(§2.3)와 facts로 옮기는 법(§4.1)을 나눠 다룬다.

1. **Part 2 "차트를 선언하는 문법" (§2.3, §4.1):** Vega-Lite만 설명한다. 데모에서 mark와 field를 바꾸면 JSON 몇 줄만 바뀌어도 차트가 달라진다는 것을 보여 준다.
2. **Part 3 "명세를 facts로" (§4.1, Fig. 2):** 같은 명세가 ASP facts로 어떻게 바뀌는지 보여 준다.

데이터 type은 cars 데이터로 예를 들면 이해가 빠르다.

| type | 뜻 | cars 예 | 기본 표현 |
|---|---|---|---|
| nominal | 순서 없는 범주 | `Origin` (Europe, Japan, USA) | 색 구분, 순서 없는 축 |
| ordinal | 순서 있는 범주 | `Cylinders` (3, 4, 5, 6, 8) | 순서대로 놓인 띠 축 |
| quantitative | 수치 | `Horsepower`, `Miles_per_Gallon` | 연속 축, 0 포함 여부를 scale로 지정 |
| temporal | 시간 | `Year` | 시간 축 |

- type은 기본 scale, axis, legend를 정할 뿐 아니라 Draco 규칙의 조건이 된다. 예를 들어 "size는 nominal 데이터에 쓰지 않는다"(expressiveness, §4.2.1)는 type을 보고 판단한다.
- 데모에서 mark가 bar일 때 y에 `aggregate: mean`을 붙이는 것은 막대 하나가 값 하나를 나타내도록 한 **데모 설계 선택**이다. Draco 규칙이 아니다.

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

### 문법과 의미 (§3)

| 형태 | 이름 | 읽는 법 | 예 |
|---|---|---|---|
| `A.` | fact (bodiless rule) | A는 참이다 | `mark(bar).` |
| `A :- L1, ..., Ln.` | rule | 몸통(body)의 literal이 모두 참이면 머리(head) A도 참 | `light_on :- power_on, not broken.` |
| `not B` | negation as failure | B를 **도출할 수 없다** (B가 거짓이라고 증명된 것이 아님) | `not zero(E)` |
| `:- L1, ..., Ln.` | integrity constraint (headless rule, hard constraint) | 이 몸통이 성립하면 모순. 그런 answer set은 버린다 | `:- log(E), zero(E).` |
| `:~ L1, ..., Ln. [w]` | weak constraint (soft constraint) | 성립할 때마다 비용 w. "가능하면 피한다" | `:~ continuous(E), not zero(E). [5]` |
| `:~ L1, ..., Ln. [w@P,T]` | 우선순위가 있는 weak constraint | 비용 w를 우선순위 P 단계에 매긴다. T는 위반을 따로 세는 기준 | `:~ type(E,nominal), channel(E,color), priority(E,P). [2@P,E]` |
| `l { A0; ...; An } k` | aggregate (choice) rule | 집합 중 최소 l개, 최대 k개가 참 | `1 { mark(bar); mark(line); mark(area); mark(point) } 1.` |

- **변수:** 대문자로 시작하면 변수다(`E`, `C`). `0 { aggregate(E,count); aggregate(E,mean); ... } 1 :- encoding(E).`는 "모든 encoding E는 aggregate를 최대 하나 가진다"는 뜻이다(§4.2.1).
- **predicate 표기:** Prolog 관례대로 이름과 인자 수로 부른다. `channel/2`는 인자가 두 개인 `channel`이다(§4 각주).
- **answer set (stable model):** 제약과 모순이 없고, 참인 atom마다 근거(도출)가 있으며, 근거 없는 것은 참이라고 하지 않는 **최소한의** atom 집합이다(§3). Draco에서는 answer set 하나가 완성된 시각화 명세 하나다.
- **구성적 성질:** 부정 literal은 "도출 안 됨"이면 참이지만, 긍정 literal은 반드시 도출되어야 참이다(§3).
- **최적 answer set:** soft constraint가 있는 프로그램에서는 위반한 soft constraint의 weight 합이 가장 작은 answer set이 최적이다(§3). Pareto 최적 같은 더 풍부한 최적화도 ASP로 쓸 수 있지만, 학습할 선형 선호 모델에는 weight 합으로 충분하다고 논문은 말한다.

### Draco가 ASP를 쓰는 방식 (§4)

1. **도메인 정의:** aggregate rule로 각 속성이 가질 수 있는 값을 정한다(어떤 mark, 어떤 aggregate 등). tick mark를 지원하려면 `mark(tick)`을 추가하면 된다.
2. **설계 공간 자르기:** integrity constraint로 문법에 어긋나는 것(well-formedness)과 데이터를 제대로 전달하지 못하는 것(expressiveness)을 없앤다. 일부는 Vega-Lite 구현의 한계를 반영한다.
3. **선호:** soft constraint로 평가 함수를 **암묵적으로** 정의한다. 비용은 정수이고, 설계 공간에 전체 순서를 만든다(§4.2.2).
4. **질의와 풀이:** 사용자의 데이터, 부분 명세, 과업을 facts와 규칙으로 바꿔 지식 베이스와 합치고, Clingo가 최적 answer set을 찾는다. Draco가 그 answer set을 Vega-Lite 명세로 되돌린다(§4.3).
5. **학습용 특징 추출:** 완성된 명세에 Clingo를 돌려 soft constraint마다 위반 횟수를 세면 그것이 feature vector x가 된다(§5).

### Clingo

- 2019 Draco가 쓰는 solver다. conflict reasoning과 heuristic으로 탐색을 이끌어 수백만 변수 규모의 문제도 푼다(§2.4).
- 논문은 Clingo의 내부 최적화 알고리즘을 자세히 설명하지 않는다. 사용법은 Potassco의 Clingo guide를 참고하라고만 한다.

### 왜 ASP인가 (논문이 든 이유)

- **잘 정의된 의미론과 효율적인 범용 알고리즘**(§1): 최적 인코딩 찾기를 "최적 answer set 찾기"로 정식화할 수 있다.
- **지식과 탐색의 분리**(§2.4, §4): 설계자는 지식만 선언하고 탐색은 solver에 맡긴다. CompassQL처럼 모두 생성한 뒤 검사하는(generate-and-test) 명령형 구현은 불가능한 후보까지 만들고 평가하느라 자원을 낭비하고, 바꾸기도 어렵다.
- **표현력, 효율, 사용 편의의 균형**(§2.4): 의사결정 지원, 제품 구성, 교육용 게임 설계 등에 이미 쓰였다.
- **학습과 맞물림:** 비용이 위반 횟수의 선형 함수라서 RankSVM으로 weight를 학습하면 바로 쓸 수 있다(§5).

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

Draco는 **pairwise** 방식인 RankSVM을 쓴다. 수식과 예시는 6절에서 다룬다.

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

## 6. RankSVM

**정의:** RankSVM은 서포트 벡터 머신(SVM)을 쌍 비교 학습에 쓴 pairwise learning to rank 방법이다(Herbrich et al., 1999; 논문 참고문헌 [27]). Draco-Learn의 soft constraint weight는 모두 이 방법으로 학습된다(§5, §6.3).

### 왜 중요한가

- 논문의 두 기여 중 하나인 "실험 데이터로 soft constraint의 weight를 학습하는 방법"(Abstract)이 바로 이 단계다.
- Draco-CQL(손으로 정한 weight)과 Draco-Learn(학습한 weight)의 차이, 즉 테스트 쌍 정확도 93% 대 65%와 Fig. 8의 과업별 추천 차이가 모두 여기서 나온다(§6.3).
- 학습된 w가 그대로 ASP soft constraint의 weight가 된다. 추론(ASP)과 학습(RankSVM)이 같은 선형 비용 모델을 공유하기 때문에 두 부분이 따로 놀지 않는다.

### SVM 기초 [배경, 논문 밖]

- 선형 SVM은 두 클래스를 나누는 경계(초평면) 가운데 양쪽 데이터와의 여유(margin)가 가장 큰 것을 찾는다.
- **hinge loss** `max(0, 1 − y·s)`: 점수 s가 맞는 쪽으로 1 이상 떨어져 있으면 0, 아니면 모자란 만큼 벌점을 준다. 방향은 맞아도 여유가 1보다 작으면 벌점이 있다.
- **L2 항** `λ‖w‖²`: w를 작게 유지한다. margin을 넓히는 것과 같은 효과이고 과적합을 줄인다. λ가 크면 w가 작고 완만해지며, 작으면 학습 데이터에 더 맞춘다.
- 경계 근처에 있거나 잘못 분류된 쌍(support vector)만 해를 움직인다. 이미 여유 있게 맞힌 쌍은 영향을 주지 않는다.

### 순위를 분류로 바꾸기 (§5)

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

soft constraint가 두 개뿐이라고 가정하자. (size는 nominal에 쓰면 hard constraint 위반이라(§4.2.1) 예시에 쓰지 않는다.)
- p1: nominal 필드를 color에 씀
- p2: nominal 필드를 shape에 씀

실험 결과 차트 A(nominal → color)가 차트 B(nominal → shape)보다 정확도가 유의하게 높았다.
- x_A = [1, 0], x_B = [0, 1] → 차이 d = x_A − x_B = [1, −1]
- 손실이 0이 되려면 `wᵀd = w1 − w2 ≤ −1`, 즉 **w2 ≥ w1 + 1**
- 모델은 "nominal을 shape에 쓰는 것이 color에 쓰는 것보다 더 큰 벌점을 받아야 한다"를 배운다. 사람이 weight를 정하지 않아도 실험 결과가 weight로 옮겨진다.

### 학습 설정 (§5, §6.3)

- **특징:** Draco-CQL의 soft constraint에, Kim et al.과 Saket et al. 실험의 설계 공간을 표현하는 규칙을 더했다. 새 규칙의 weight는 0에서 시작한다.
- **학습:** 쌍마다 두 feature vector의 차이로 분류기를 학습한다. scikit-learn의 SVM을 그대로("off-the-shelf") 썼다. λ = 0.1은 "초기 실험"의 값이다.
- **데이터 분할:** 학습 55%, 검증 15%, 테스트 30%
- **결과:**
  - 테스트 쌍 정확도 93% (손으로 정한 Draco-CQL은 65%, 우연보다 조금 나은 수준)
  - Kim et al. 데이터를 함께 넣어도 Saket et al. 데이터의 학습 정확도는 100%. 서로 다른 실험을 섞어도 성능이 떨어지지 않았다.
  - 순위 쌍 수집 기준을 p < 0.1로 넓히면 검증 정확도 96%
  - 학습 쌍이 250개보다 적어질 때부터 테스트 정확도가 검증 정확도보다 크게 떨어진다. 논문은 이를 데이터에 중복이 있고 모델이 일반화된다는 근거로 든다.
  - 48개(Kim et al.)와 8개(Saket et al.) 조건 모두에서 실험상 가장 좋은 인코딩을 추천했다.

### 학습된 weight 읽는 법

- 값이 클수록 그 위반의 벌점이 크다. 순위를 정하는 것은 크기 자체보다 **다른 weight와의 상대 차이**다.
- 비교하는 두 차트의 위반 횟수 합이 늘 같으면, 모든 weight에 같은 값을 더해도 비교 결과가 같다. 이때 L2 항이 0 근처의 해를 고르므로 음수 weight가 나올 수 있다(사이트 Part 9 데모). 음수 weight는 "그 위반이 오히려 선호된다"는 뜻이다. 논문은 학습된 weight의 부호를 따로 다루지 않는다. **[명시 없음]**
- Clingo는 정수 비용을 쓰지만, 실수 weight를 정수로 바꾸는 방법은 논문에 없다. **[명시 없음]**

### MLN 해석 (§2.5, §4.2.2, Appendix)

- Draco의 선호 모델은 Markov Logic Network(MLN)를 이룬다. soft constraint는 논리식, weight는 그 식의 학습 가능한 파라미터다.
- 최적 완성 찾기는 MLN의 MAP 추론과 같다. ASP solver가 비용 최소화로 직접 풀기 때문에 partition function을 계산할 필요가 없다.

### 한계 (RankSVM 관점)

- **선형 모델:** 특징끼리의 상호작용은 규칙으로 따로 써야 표현된다.
- **표현의 부정확함:** 논문은 "linear regression ... minimizing the hinge loss"라고 썼지만, hinge loss를 쓰는 것은 회귀가 아니라 선형 분류다(`docs/01_paper/04_critical-review.md`에 기록).
- **다른 순위 학습 방법과의 비교 없음:** RankNet, LambdaMART 같은 방법과 비교한 실험은 없다. **[명시 없음]**

## 7. 발표 후 질문 대비: Vega-Lite, ASP, RankSVM

출처 표기: **[논문 §]** = 논문에 근거, **[배경]** = 논문 밖의 일반 지식(논문 주장이 아니라고 밝히고 답할 것), **[명시 없음]** = 논문이 말하지 않는 내용(추측으로 채우지 말 것).

### Vega-Lite

**Q. Vega-Lite는 Vega나 D3와 뭐가 다른가요?**
A. D3는 그림을 그리는 과정을 코드로 하나하나 지시하는 JavaScript 라이브러리이고, Vega는 그보다 위의 선언적 문법, Vega-Lite는 그보다 더 위의 고수준 문법입니다. Vega-Lite 명세는 Vega로 컴파일되어 그려집니다. **[배경]** Draco 논문에서 Vega-Lite는 Draco가 추론하는 대상이자 출력 언어입니다. **[논문 §2.3, Fig. 1]**

**Q. 왜 ggplot2나 Tableau가 아니라 Vega-Lite인가요?**
A. 논문이 든 이유는 세 가지입니다. Vega-Lite는 가능한 시각화 공간을 탐색하고 추론하기 쉽게 설계된 언어이고 **[§2.3]**, 앞선 시스템 CompassQL도 Vega-Lite의 논리 표현을 썼으며 **[§2.3]**, APT가 쓰던 그래픽 대수는 더 이상 쓰이지 않는 데 비해 Vega-Lite는 더 완전한 언어입니다 **[§2.1]**. 명세가 JSON이라 프로그램이 만들고 고치기 쉽다는 점도 있습니다. **[배경]**

**Q. JSON을 그대로 쓰면 되지, 왜 facts로 바꾸나요?**
A. ASP solver는 facts와 규칙 위에서만 추론합니다. 중첩된 JSON을 `mark(bar).`, `channel(e0,x).` 같은 평평한 사실로 바꿔야 규칙이 "어떤 encoding E든"처럼 일반적으로 참조할 수 있습니다. 채널마다 따로 predicate를 두지 않고 `channel(E,C)`로 일반화했기 때문에 detail 채널을 여러 번 쓸 수 있고 채널과 무관한 규칙을 쓰기 쉽습니다. **[§4.1]** 결과 answer set은 다시 Vega-Lite 명세로 바뀝니다. **[§4.3]**

**Q. Draco는 layer, concat, 상호작용도 추천하나요?**
A. 아니요. 2019 논문은 단일 뷰와 row/column facet만 다룹니다. **[§2.3]** Vega-Lite selection 같은 상호작용은 앞으로 확장할 방향으로만 언급합니다. **[§7.2]**

**Q. 2019 Draco는 Vega-Lite 몇 버전을 썼나요?**
A. 논문에는 버전이 적혀 있지 않습니다. **[명시 없음]** 다만 2019 Draco Editor는 Vega-Lite v2 스키마를 씁니다(2026-10-11 확인). 발표 사이트의 차트는 현재 버전 Vega-Lite로 그렸고, v2에도 있던 기능만 썼습니다.

**Q. nominal과 ordinal은 왜 구분하나요?**
A. 순서가 있느냐에 따라 맞는 표현이 다르기 때문입니다. Cylinders(3, 4, 5, 6, 8)는 순서가 있는 ordinal, Origin(Europe, Japan, USA)은 순서가 없는 nominal입니다. type은 Vega-Lite의 기본 scale과 legend를 정하고, Draco 규칙의 조건이 되기도 합니다. 예를 들어 크기(size)는 순서를 느끼게 하므로 nominal 데이터에는 쓰지 않습니다. **[§4.2.1]**

### ASP

**Q. ASP와 Prolog는 뭐가 다른가요?**
A. 둘 다 논리 프로그래밍이지만 동작이 다릅니다. Prolog는 질의 하나를 규칙 순서대로 위에서 아래로 증명해 나가고, 규칙을 적는 순서가 결과와 종료 여부에 영향을 줍니다. ASP는 프로그램 전체를 변수 없는 형태로 펼친(grounding) 뒤 solver가 조건을 만족하는 answer set을 찾습니다. 규칙 순서와 무관하고, 최적화(weak constraint)가 언어에 들어 있습니다. **[배경]** 논문은 predicate를 `이름/인자 수`로 부르는 Prolog 관례만 언급합니다. **[§4 각주]**

**Q. 왜 ASP를 골랐나요? SAT나 정수계획법, 머신러닝도 있는데요.**
A. 논문은 잘 정의된 의미론과 효율적인 범용 풀이 알고리즘 **[§1]**, 지식은 선언하고 탐색은 solver에 맡기는 분리 **[§2.4]**, 표현력·효율·사용 편의의 균형 **[§2.4]**을 이유로 듭니다. 머신러닝만으로 추천하려면 "불완전한 명세 → 최적 완성" 쌍이 필요한데, 시각화에서는 하나의 정답이 없어 그런 데이터가 없습니다. 그래서 규칙은 ASP로 쓰고 weight만 순위 쌍으로 학습합니다. **[§2.5]** SAT나 정수계획법과 직접 비교한 실험은 없습니다. **[명시 없음]**

**Q. 규칙의 `not`은 논리의 부정과 같나요?**
A. 다릅니다. ASP의 `not B`는 "B를 도출할 수 없다"는 뜻입니다(negation as failure). `light_on :- power_on, not broken.`에서 broken을 도출할 근거가 없으면 light_on이 참이 됩니다. **[§3]** 그래서 `:~ continuous(E), not zero(E). [5]`는 "연속형인데 0을 포함한다는 사실이 없으면 비용 5"로 읽습니다.

**Q. answer set이 정확히 뭔가요?**
A. 규칙과 모순이 없고, 참인 것마다 도출 근거가 있으며, 근거 없는 것은 참이라 하지 않는 최소한의 사실 집합입니다(stable model). **[§3]** Draco에서는 answer set 하나가 완성된 차트 명세 하나입니다.

**Q. Clingo는 모든 후보를 다 만들어 보고 고르나요?**
A. 아니요. conflict reasoning과 heuristic으로 탐색을 이끌어 수백만 변수 규모도 풉니다. **[§2.4]** 모든 후보를 만든 뒤 검사하는 CompassQL과 대비되는 점이고, 필드 25개·인코딩 5개 질의를 0.5초 안에 풀었는데 CompassQL은 몇 분 뒤 메모리가 부족했습니다. **[§6.2]** 내부적으로 먼저 grounding을 하고, 더 낮은 비용의 해를 찾을 때마다 기준을 낮춰 가며 최적을 증명합니다. **[배경]** 이 내부 알고리즘은 논문에 설명되어 있지 않습니다. **[명시 없음]**

**Q. 최적해가 여러 개(동점)면 어떻게 되나요?**
A. 논문의 "최적"은 정의된 선호 아래에서 더 선호되는 다른 시각화가 없다는 뜻입니다. **[§4]** 동점일 때 무엇을 고르는지는 적혀 있지 않습니다. **[명시 없음]** 상위 몇 개를 뽑아 다른 분류기로 다시 순위를 매기는 방법은 향후 과제로 제안합니다. **[§7.1]**

**Q. Clingo 비용은 정수인데, 학습한 weight는 실수 아닌가요?**
A. 논문은 평가 함수가 명세를 정수로 바꾼다고만 하고 **[§4.2.2]**, RankSVM이 학습한 실수 weight를 어떻게 정수로 바꾸는지는 적지 않았습니다. **[명시 없음]** 보통은 일정 배수를 곱해 반올림하는 방식을 쓰지만 이건 일반적인 방법일 뿐 논문 내용이 아닙니다. **[배경]**

**Q. 비용은 weight의 평균인가요?**
A. 합입니다. Cost(v) = Σ wᵢ · nᵢ(v)이고 nᵢ(v)는 i번째 soft constraint를 위반한 횟수입니다. w와 x = [n₁(v), ..., n_k(v)]는 soft constraint 개수 k차원의 벡터라서 Cost = wᵀx입니다. **[§4.2.2, §5]**

**Q. Draco-APT 규칙의 `[2@P,E]`는 무슨 뜻인가요?**
A. `w@P`는 비용 w를 우선순위 P 단계에 매긴다는 뜻입니다. solver는 hard constraint를 먼저 모두 지키고, 그다음 soft constraint를 우선순위 단계 순서로 따집니다. Draco-APT는 P에 필드의 중요도를 넣어, 중요한 필드부터 가장 효과적인 채널을 받는 APT의 원칙을 재현합니다. **[§6.1]** 뒤의 `E`는 encoding마다 위반을 따로 센다는 표시입니다. **[배경]** 학습한 weight를 쓰는 Draco-Learn은 단일 비용 합을 씁니다. **[§5]**

**Q. 어떤 규칙을 hard로, 어떤 규칙을 soft로 두나요?**
A. 차트가 성립하지 않거나(문법 오류) 데이터를 잘못 전달하면 hard, 좋고 나쁨의 정도 차이면 soft입니다. 일부 hard constraint는 "좋은 디자인"이 아니라 Vega-Lite 구현의 한계를 반영합니다(예: shape는 8종까지). **[§4.2.1]**

**Q. 이 발표 사이트의 비용도 Clingo로 계산하나요?**
A. 아니요. 사이트는 Draco의 비용 모델(위반 횟수 × weight의 합)만 빌려서 TypeScript로 직접 계산합니다. 제약과 weight도 이 사이트를 위해 손으로 정한 값이고, 논문의 지식 베이스가 아닙니다.

### RankSVM

**Q. RankSVM이 Draco에서 얼마나 중요한가요?**
A. 논문의 두 기여 중 하나가 "실험 데이터로 weight를 학습하는 방법"이고(Abstract), 그 방법이 RankSVM입니다. **[§5]** 손으로 정한 weight(Draco-CQL)와 학습한 weight(Draco-Learn)의 차이, 즉 테스트 쌍 정확도 93% 대 65%가 이 학습에서 나옵니다. **[§6.3]**

**Q. 왜 RankSVM인가요? 신경망 순위 모델도 있는데요.**
A. Draco의 비용이 위반 횟수의 선형 함수라서, 선형 pairwise 모델을 학습하면 그 계수가 곧 soft constraint의 weight가 됩니다. 사람이 읽고 고칠 수 있는 규칙별 weight로 남는다는 점이 중요합니다. **[§5]** 다른 순위 학습 방법과 비교한 실험은 없습니다. **[명시 없음]**

**Q. 논문에 "linear regression"이라고 쓰여 있는데, 회귀인가요?**
A. 아닙니다. hinge loss를 최소화하는 것은 차이 벡터의 부호를 맞히는 선형 분류입니다. 논문 표현이 부정확한 부분으로, 리뷰의 표기 문제에 넣었습니다. **[§5, 리뷰어 의견]**

**Q. 모든 쌍을 y = −1로 맞추면 클래스가 하나뿐인데 SVM 학습이 되나요?**
A. 논문의 손실식에는 절편(bias)이 없어서 원점 대칭이고, 모든 쌍을 "선호, 비선호; −1" 꼴로 맞춰도 수학적으로 문제가 없다고 설명합니다. **[§5]** 다만 scikit-learn의 일반 분류기는 보통 두 클래스가 있어야 학습되므로, 실제로 쌍의 일부를 뒤집었는지, 절편을 껐는지 같은 구현 방식은 논문에 없습니다. **[명시 없음; scikit-learn 동작은 배경]**

**Q. weight가 음수로 나오면 어떻게 해석하나요?**
A. 그 규칙을 위반하는 쪽이 오히려 선호된다는 뜻입니다. 비교하는 차트들의 위반 횟수 합이 같으면 weight의 상대 차이만 의미가 있어 L2 정규화가 0 근처 값을 고르고, 그 결과 음수가 나올 수 있습니다. **[배경]** 논문은 학습된 weight의 부호를 다루지 않습니다. **[명시 없음]**

**Q. 학습 데이터는 얼마나 필요했나요?**
A. Kim & Heer 실험에서 약 1,100쌍, Saket et al.에서 10쌍을 모았습니다. **[§6.3.1]** 학습 쌍이 250개보다 적어질 때부터 테스트 정확도가 크게 떨어졌습니다. **[§6.3]**

**Q. 93%는 과적합 아닌가요?**
A. 학습 55%, 검증 15%와 분리한 테스트 30%에서 잰 값이라 학습 데이터 안의 과적합은 아닙니다. **[§6.3]** 다만 테스트 쌍도 같은 실험들에서 나왔기 때문에, 그 실험이 다룬 좁은 설계 공간(주로 산점도) 밖에서도 잘 맞는지는 보여 주지 않습니다. **[리뷰어 의견]**

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

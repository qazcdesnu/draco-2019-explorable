# 02. 웹사이트용 핵심 예시와 수치

> 4단계 구현에서 그대로 데이터나 코드로 옮겨 쓸 재료다. 모든 값은 원문에서 가져왔다.

## A. Vega-Lite ↔ ASP 대응 (Fig. 2) — "같은 차트, 두 언어"

자동차 데이터셋에서 실린더 수별 평균 마력을 보여 주는 막대 차트다.

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

```prolog
mark(bar).
encoding(e0). channel(e0,x). type(e0,ordinal). field(e0,cylinders).
encoding(e1). channel(e1,y). type(e1,quant).   field(e1,horsepower). aggregate(e1,mean).
```

웹 아이디어: 두 코드를 나란히 놓고 같은 줄끼리 하이라이트를 연결한다. 실제 Vega-Lite 차트도 함께 렌더링한다.

## B. ASP 문법 치트시트 (§3)

| 형태 | 의미 | 예 |
|---|---|---|
| `A.` | fact | `power_on.` |
| `A :- B, not C.` | rule (B가 참이고 C를 도출할 수 없으면 A) | `light_on :- power_on, not broken.` |
| `:- B.` | hard constraint (B는 불가능) | `:- log(E), zero(E).` |
| `:~ B. [w]` | soft constraint (B이면 비용 w) | `:~ continuous(E), not zero(E). [5]` |
| `l { A; B; C } k` | aggregate (l~k개만 참) | `1 { mark(bar); mark(line); mark(area); mark(point) } 1.` |
| `[w@P,E]` | 우선순위 P 레벨의 비용 w | Draco-APT 채널 선호 |

## C. Hard constraint 예시 모음 (§4.2.1)

| 종류 | 제약 | 사람이 읽는 말 |
|---|---|---|
| Well-formed | `:- channel(_,shape), not mark(point).` | shape 채널은 point mark에만 |
| Well-formed | `:- log(E), zero(E).` | log scale에는 0이 들어갈 수 없음 |
| Well-formed | `:- channel(E,shape), cardinality(E,C), C > 8.` | Vega-Lite shape는 8종뿐 |
| Expressive | `:- mark(bar), channel(E,(x;y)), continuous(E), not zero(E).` | 막대는 0 기준선 필수 |
| Expressive | `:- channel(E,size), type(E,nominal).` | size는 순서를 암시하므로 nominal에 쓸 수 없음 |
| CQL 재구현 | `:- single_channel(C), 2 { channel(_,C) }.` | 단일 채널은 한 번만 (CompassQL에서는 JS 14줄) |

## D. Soft constraint와 weight 예시

**Draco-APT 채널 선호 (§6.1)** — 숫자가 낮을수록 선호한다.

| 데이터 타입 | x | y | color | size | shape |
|---|---|---|---|---|---|
| quantitative | 1 | 1 | 3 | 2 | – |
| ordinal | 1 | 1 | 2 | 3 | – |
| nominal | 1 | 1 | 2 | 4 | 3 |

**Draco-CQL nominal 채널 선호 (§6.2)**

| channel | y | x | row | column | color | shape | text | detail |
|---|---|---|---|---|---|---|---|---|
| weight | 0 | 1 | 6 | 7 | 7 | 8 | 9 | 20 |

기타: `:~ aggregate(_,_), continuous(E), not aggregate(E,_). [3]`는 연속형 필드로 그룹핑하는 집계에 벌점을 준다(CompassQL에서는 12줄).

웹 아이디어: weight 슬라이더를 움직이면 후보 차트들의 `Cost = Σ w·n` 순위가 실시간으로 바뀌는 인터랙티브 데모. 후보는 미리 정의한다.

## E. 질의 → 완성 예시 (Fig. 6, §4.3.2)

**입력 (partial spec):**
```json
{ "data": {"url": "cars.csv"},
  "encoding": [ {"channel": "x", "bin": true, "field": "horsepower"} ] }
```

**데이터에서 추론한 facts:**
```prolog
num_rows(407).
fieldtype(name,string).            cardinality(name,311).
fieldtype(miles_per_gallon,number). cardinality(miles_per_gallon,130).
...
```

**질의를 컴파일한 제약:**
```prolog
encoding(e1).
:- not channel(e1,x).
:- not field(e1,horsepower).
:- not bin(e1,_).
```

**Draco가 추가한 최적 완성:**
```prolog
encoding(e2). channel(e2,y). aggregate(e2,count).
```
→ 마력 히스토그램이 된다.

웹 아이디어: 4단계 파이프라인 애니메이션 (partial spec → facts + constraints → Clingo → Vega-Lite 차트)

## F. 설계 공간 다이어그램 (Fig. 3, 4)

- 바깥 영역: 모든 시각화
- 안쪽의 겹치는 두 영역: Valid Vega-Lite / Draco Search Space
- 그 안에서 hard constraint가 **ill-formed**와 **non-expressive**를 제거
- 남은 expressive 영역은 세로축 "more ↔ less preferred"로 정렬 (soft)
- Fig. 4: 질의가 질의와 맞지 않는 후보(✘)를 지우고, 남은 공간에서 최적해(✓)를 고른다.

웹 아이디어: 스크롤에 따라 점(후보)들이 단계적으로 사라지는 scrollytelling

## G. 핵심 수치

| 항목 | 값 | 출처 |
|---|---|---|
| APT 규칙 수 | 약 200개 | §2.1 |
| Draco-CQL 제약 수 | hard 70 + soft 110 | §6.2 |
| CompassQL 코드 | 4,324줄 (hard 1,134 / 점수 786) | §6.2 |
| CompassQL 테스트 질의 일치 | 17/17 | §6.2 |
| 성능 | 필드 25 × 인코딩 5에서 Draco < 0.5초 / CQL은 메모리 부족(4GB, 몇 분 후) | §6.2, Fig. 7 |
| Kim & Heer 실험 | 산점도 12종, 참가자 1,920명, 응답 185,000건 | §6.3 |
| Saket et al. 실험 | 참가자 180명, bar/line/scatter | §6.3 |
| 수집한 순위 쌍 | Kim 약 1,100 / Saket 10 (Fisher p < 0.01) | §6.3.1 |
| 데이터 분할 | 55 / 15 / 30 | §6.3.2 |
| 정규화 λ | 0.1 | §5 |
| 테스트 정확도 | **Draco-Learn 93%** vs Draco-CQL 65% | §6.3.2 |
| 검증 정확도 (p < 0.1) | 96% | §6.3.2 |
| 최소 학습 쌍 | 약 250쌍 미만이면 테스트 정확도가 떨어짐 | §6.3.2 |
| 최적 인코딩 조건 | 48 (Kim) + 8 (Saket) 모두 최상위 | §6.3.2 |

웹 아이디어: Fig. 7은 로그 스케일 라인 차트로 직접 다시 그린다. 원 데이터가 없으므로 "개념도"라고 표시하고, 논문 그림을 인용한다.

## H. Fig. 8 비교 — 과업을 아는 모델

| | Value task | Summary task |
|---|---|---|
| Draco-CQL (hand-tuned) | 산점도, Q1→y, N→color | **같은 차트** (task 관련 weight = 0) |
| Draco-Learn (learned) | 산점도 (개별 값 비교에 유리) | **범주 N별로 공간을 나눈 차트** (분포를 읽기 쉬움) |

웹 아이디어: task 토글 버튼. CQL 쪽 차트는 그대로이고 Learn 쪽 차트만 바뀐다.

## I. 수식

- `Cost(v) = Σᵢ wᵢ · n_pᵢ(v) = xᵀw`
- `f(v1, v2) = wᵀ(x1 − x2)` → 부호로 선호 판정
- `L = (1/n) Σᵢ max(0, 1 − yᵢ wᵀ(xᵢ1 − xᵢ2)) + λ‖w‖²`
- `P(v) = e^(−Cost(v)) / Σ_{u∈V} e^(−Cost(u))` (MLN)

# 03. 리뷰 순서와 목차

## 서사 원칙

1. **문제 → 아이디어 → 도구 → 방법 → 증거 → 평가** 순서로 간다. 논문 순서를 기본으로 따르되, 청중이 처음 보는 개념(Vega-Lite, ASP)을 쓰기 직전에 배치한다.
2. 각 파트에는 **하나의 메시지**와 **하나의 인터랙티브 장치**만 둔다. Deck 보기에서 한 화면에 들어가는 분량이다.
3. 논문 내용(§, Fig. 표기)과 우리의 평가나 메타 장치(사이트 디자인 제약)를 시각적으로 구분한다.
4. Draco 2 같은 후속 연구는 마지막 파트의 "이후 이야기" 칸에만 둔다.

## 목차 (11개 파트, 발표 약 15분 기준)

| # | 파트 제목 | 핵심 메시지 (한 문장) | 논문 근거 | 인터랙티브 장치 | 발표 시간 |
|---|---|---|---|---|---|
| 0 | 표지: Draco | "좋은 시각화의 지식을 제약으로 쓰면, 컴퓨터가 추천하고 데이터가 고친다." | 제목, Abstract | 보기 전환 안내 + 토스트 첫 노출 | 0:30 |
| 1 | 문제: 지침과 도구 사이의 간극 | 실험 결과는 쌓이는데 도구에 반영되지 않고, 시스템마다 지식을 따로 구현한다. | §1, §2.1 | 기존 시스템 비교 표 (APT, CompassQL, Draco) | 1:00 |
| 2 | 시각화를 쓰는 언어: Vega-Lite | 차트 = data + mark + encoding. Draco는 이를 logical facts로 옮긴다. | §2.3, §4.1, Fig. 2 | **VL ↔ ASP 코드 쌍** (줄 연결 하이라이트) + 실제 차트 | 1:30 |
| 3 | 규칙을 쓰는 언어: ASP | 규칙과 제약을 선언하면 solver가 답을 찾는다. `:-`는 금지, `:~`는 벌점. | §3 | ASP 치트시트 표 | 1:00 |
| 4 | 설계 공간과 hard constraints | 가능한 모든 차트 중 문법에 어긋나는 것과 표현력이 없는 것을 잘라낸다. | §4.2.1, Fig. 3 | **설계 공간 가지치기** (단계 버튼) | 1:30 |
| 5 | Soft constraints와 비용 | 남은 후보는 위반한 선호의 weight 합으로 줄을 세운다. | §4.2.2, §6.2 | **weight 슬라이더** → 1위 차트가 바뀜 | 2:00 |
| 6 | 질의에서 차트로 | 부분 명세 → facts + 제약 → Clingo → Vega-Lite | §4.3, Fig. 5, 6 | **파이프라인 스텝퍼** (마지막에 히스토그램) | 1:30 |
| 7 | weight를 데이터에서 배우기 | "A가 B보다 낫다"는 실험 결과로 RankSVM이 weight를 학습한다. | §5, §6.3.1 | **Learning to rank 미니 데모** | 2:00 |
| 8 | 증거: APT → CQL → Learn | 더 짧은 코드, 더 빠른 탐색, 실험 결과를 반영하는 추천 | §6, Fig. 7, 8 | 숫자 타일 + **과업 토글** (CQL vs Learn) | 2:00 |
| 9 | 평가: 강점과 한계 | 지식과 탐색을 분리한 건 강력하지만, 학습 데이터가 좁고 규칙은 여전히 사람이 쓴다. | §7 + 리뷰어 의견 | 강점과 한계를 나란히 비교 | 1:30 |
| 10 | 토론과 더 보기 | 질문 4개, 2019 Draco Editor 링크, [리뷰 범위 밖] 이후 이야기 | §7.2 | 링크 카드 | 0:30 |

## 보기별 배열 규칙

| 요소 | Paper | Deck | Explorer |
|---|---|---|---|
| 파트 단위 | 연속된 섹션 | 슬라이드 1장 | 카드 1장 |
| 리드 문장 (핵심 메시지) | 섹션 첫 문단 | 큰 글씨 제목 아래 | 카드 상단 |
| 요점 bullet | 표시 | 표시 (최대 3개) | 표시 |
| 본문 문단, 표, 수식 (detail) | 전부 표시 | **생략**, "자세히" 링크로 Paper의 해당 위치 이동 | 카드를 펼치면 표시 |
| 인터랙티브 장치 | 본문 끝 | 슬라이드의 주 영역 | 카드 안에 항상 표시 |
| 비교 쌍 (VL과 ASP 등) | 위아래로 쌓기 | 좌우 배치 | 좌우 배치 |
| 목차 | 맨 위에 한 번 | 하단 진행 바 | 사이드바에 항상 표시 |

## 각 파트의 세부 구성

### 0. 표지
- 논문 제목, 저자, TVCG 2019, DOI
- 리드: 위 핵심 메시지
- "이 사이트도 Draco처럼 설계되었습니다. 위의 보기를 바꿔 보세요." 안내 (메타 장치 소개)

### 1. 문제
- 요점: 지침과 도구 사이의 간극 / 시스템마다 지식을 따로 구현 / 공유할 수 있는 형식 지식 모델이 필요
- detail: APT(약 200개 규칙, DFS), CompassQL(hand-tuned, imperative JS), Draco(ASP + 학습) 비교 표

### 2. Vega-Lite
- 요점: data, mark, encoding / field, type(N, O, Q, T), aggregate, bin / Draco는 JSON 중첩을 풀어 facts로 바꿈
- 장치: Fig. 2 막대 차트 (Cylinders × mean Horsepower). 왼쪽은 VL JSON, 오른쪽은 ASP. 한쪽 줄에 마우스를 올리면 대응하는 줄이 강조됨
- detail: 논문은 단일 뷰와 facet만 다룸 / 그림을 그리는 Vega-Lite는 현재 버전이고, 2019 Draco는 v2를 씀

### 3. ASP
- 요점: fact, rule, `:-` (hard), `:~ [w]` (soft), aggregate `l{..}k`
- detail: 치트시트 표, `light_on :- power_on, not broken.` 예시, negation as failure

### 4. 설계 공간
- 요점: aggregate rules로 도메인 정의 / well-formedness / expressiveness
- 장치: 후보 점 72개. 단계 버튼을 누를 때마다 ill-formed 후보가 빠지고, non-expressive 후보가 빠지고, 남은 후보가 비용 순으로 정렬됨
- detail: Hard constraint 예시 표 (§4.2.1)

### 5. Soft constraints
- 요점: `:~ ... [w]` / Cost = Σ w·n / 같은 제약을 여러 번 위반할 수 있음
- 장치: 질의 "Horsepower와 Origin을 보여 줘"의 후보 5개 (설명을 위해 우리가 구성). weight 초기값은 논문 §6.2의 Draco-CQL nominal 채널 weight(y 0, x 1, row 6, color 7, shape 8). 슬라이더를 움직이면 순위와 1위 차트가 바뀜
- detail: 비용 수식, feature vector x, APT 채널 선호 표

### 6. 질의에서 차트로
- 장치: 4단계 스텝퍼 (partial spec → data facts → query constraints → Clingo가 추가한 완성), 마지막 단계에서 Horsepower 히스토그램 렌더링
- detail: "최적"의 의미 (정의된 선호 아래에서의 최적)

### 7. Learning to rank
- 요점: 정답 차트가 없으니 "A > B" 순위 쌍으로 학습 / `f = wᵀ(x1 − x2)` / RankSVM (hinge + L2)
- 장치: 특징 3개(nominal → color / size / shape). 실험 결과 카드("A가 더 정확했다")를 추가하면 브라우저에서 RankSVM을 학습해 weight 막대가 움직임
- detail: 손실 수식, 순위 쌍 수집 절차(§6.3.1), 한계

### 8. 증거
- 숫자 타일: 17/17 질의 일치 / 제약 180개 vs 4,324줄 / 0.5초 미만 vs 메모리 부족 / 93% vs 65%
- 장치: 과업 토글 (value / summary). 왼쪽 CQL은 그대로, 오른쪽 Learn만 바뀜. **합성 데이터로 만든 개념도**라고 명시
- detail: Draco-APT 예시, 실험 데이터 규모 (§6.3)

### 9. 평가
- 강점 4개 vs 한계 4개를 나란히 배치 (출처: `docs/01_paper/04_critical-review.md`)
- detail: 리뷰어 관점의 표기 문제 3가지

### 10. 토론
- 토론 질문 4개
- 링크: 2019 Draco Editor, 논문 DOI, 논문에 적힌 원래 주소
- "[리뷰 범위 밖] 이후 이야기": Draco 2가 있었다는 사실만 한 줄로

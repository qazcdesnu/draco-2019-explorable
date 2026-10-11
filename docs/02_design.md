# 02. 웹사이트 디자인 결정

## 핵심 컨셉: "이 웹사이트도 Draco로 설계되었다"

Draco는 같은 데이터를 여러 시각화 후보로 만든 뒤, **hard constraint로 걸러내고 soft constraint 비용으로 순위를 매긴다.** 이 사이트도 같은 구조를 따른다.

| Draco (논문) | 이 웹사이트 |
|---|---|
| 데이터 | 리뷰 콘텐츠 (모든 보기에서 동일) |
| 후보 시각화 (Vega-Lite 명세) | **보기 옵션 3개** (Paper / Deck / Explorer) |
| 시각화를 설명하는 facts | 각 보기의 디자인 facts (`layout(single_column).` 등) |
| Hard constraints | 모든 보기가 반드시 지키는 조건 (아래 §2) |
| Soft constraints + weights | 보기마다 지키거나 위반하는 디자인 선호 (아래 §3) |
| `Cost(v) = Σ wᵢ·nᵢ(v)` | 보기마다 계산한 비용. 토스트 박스에 표시 |
| 사용자 과업 `task/1` (value / summary) | **이용 상황 (발표 / 읽기 / 탐색)**: 상황마다 weight가 달라짐 |
| Fig. 8: 과업이 바뀌면 최적 차트도 바뀜 | 상황이 바뀌면 최적 보기도 바뀜 |

> **범위 표시:** 아래 제약과 weight는 **우리가 이 사이트를 위해 직접 만든 것**이다. 논문의 Draco 지식 베이스가 아니다. 사이트 안에서도 이 점을 명시한다. 논문 내용(Draco 2019)과 이 메타 장치를 섞지 않는다.

## 1. 보기 옵션 3개

세 보기 모두 **같은 콘텐츠**(`src/content/`)를 쓰고, 화면 배치만 다르게 그린다. Draco에서 데이터는 같고 인코딩만 다른 것과 같은 관계다.

### A. Paper (문서형): 읽기에 최적
- 가운데 한 단, 본문 폭 최대 약 70자, 본문 18px
- 논문 섹션 순서대로 길게 스크롤. 그림, 코드, 데모는 본문 사이에 삽입
- 목차는 맨 위에만 있음
- 비교 대상(Vega-Lite와 ASP, CQL과 Learn)은 위아래로 쌓음
- 인쇄와 PDF 저장에 적합

### B. Deck (발표형): 프로젝터 발표에 최적, **기본값**
- 한 화면에 섹션 하나. ←/→ 키나 스페이스로 이동하고 하단에 진행 바 표시
- 글자를 크게(본문 28px 이상), 한 화면에 핵심 블록은 최대 2개
- 비교 대상은 좌우로 나란히 배치
- 세부 수식이나 표는 생략하고 "자세히" 링크로 Paper 보기의 해당 위치로 이동

### C. Explorer (대시보드형): 직접 만져 보기에 최적
- 왼쪽 사이드바에 목차를 항상 표시하고, 오른쪽은 카드 격자
- 인터랙티브 데모(weight 슬라이더, 과업 토글 등)를 한 화면에 여러 개 펼침
- 카드는 원하는 순서로 열어 볼 수 있음 (비선형 탐색)
- 글자는 작고 정보 밀도가 높음

## 2. Hard constraints: 세 보기 모두 반드시 만족

통과하지 못하는 보기는 후보에서 뺀다(구현 시 체크리스트).

```prolog
:- view(V), horizontal_scroll(V).          % 휴대폰 너비에서 가로 스크롤 금지
:- view(V), text_contrast(V,C), C < 4.5.   % 본문 대비 WCAG AA 이상
:- view(V), not same_content(V).           % 모든 보기는 같은 콘텐츠 원본을 사용
:- claim(X), not cites_paper(X).           % 논문 내용 주장에는 § 또는 Fig 표기
:- view(V), not theme(V,light), not theme(V,dark).  % 라이트/다크 둘 다 지원
:- content(X), draco2(X), not labeled_after_paper(X). % 후속 버전 내용은 '이후 이야기'로 분리
```

## 3. Soft constraints와 weight

각 행은 ASP 형식으로 적은 soft constraint와 사람이 읽는 설명이다. weight는 상황(발표 / 읽기 / 탐색)마다 다르다.

| id | 제약 (ASP 형식) | 의미 | 발표 | 읽기 | 탐색 |
|---|---|---|---|---|---|
| `long_line` | `:~ line_length(V,L), L > 80. [w]` | 한 줄이 너무 길면 읽기 어렵다 | 2 | 4 | 1 |
| `no_overview` | `:~ view(V), not persistent_toc(V). [w]` | 전체 목차가 항상 보이지 않는다 | 2 | 1 | 5 |
| `scroll_heavy` | `:~ view(V), long_scroll(V). [w]` | 내용을 보려면 계속 스크롤해야 한다 | 3 | 1 | 2 |
| `small_text` | `:~ body_size(V,S), S < 24. [w]` | 멀리서(프로젝터로) 읽기 어려운 글자 크기 | 5 | 0 | 0 |
| `too_many_panels` | `:~ panels_per_screen(V,N), N > 3. [w]` | 한 화면에 정보 블록이 너무 많다 (인지 부하) | 3 | 3 | 1 |
| `nonlinear_order` | `:~ view(V), not paper_order(V). [w]` | 논문의 서사 순서를 따르지 않는다 | 3 | 3 | 0 |
| `no_side_by_side` | `:~ compare(A,B), not adjacent(A,B). [w]` | 비교 대상을 나란히 보여 주지 않는다 | 3 | 2 | 3 |
| `detail_omitted` | `:~ view(V), omits_detail(V). [w]` | 수식이나 표 같은 세부를 생략한다 | 2 | 5 | 4 |
| `no_print` | `:~ view(V), not printable(V). [w]` | 인쇄하거나 PDF로 공유하기 어렵다 | 0 | 2 | 0 |

#### weight 0의 의미와 근거

weight 0은 "규칙은 그대로 있지만 이 상황에서는 비용에 영향이 없다"는 뜻이다. 제약 목록은 모든 상황에서 같고, 상황이 바뀌면 weight만 바뀐다. 논문에서도 같은 쓰임이 있다. Draco-CQL은 과업 관련 weight가 0이라 과업과 상관없이 같은 차트를 내고(§6.3, Fig. 8), 새 규칙은 weight 0에서 시작해 학습으로 값을 얻는다(§7.1).

| 제약 | 0인 상황 | 근거 |
|---|---|---|
| `small_text` | 읽기, 탐색 | "멀리서 프로젝터로 볼 때" 기준으로 정의한 제약이다. 자기 화면으로 읽을 때는 15~18px이 정상이다. |
| `nonlinear_order` | 탐색 | 탐색의 목적은 원하는 곳으로 바로 가는 것이라 순서를 벗어나도 손해가 아니다. |
| `no_print` | 발표, 탐색 | 인쇄나 PDF 공유는 나중에 읽거나 나눠 줄 때만 필요하다. |

민감도 확인: 0인 weight를 모두 1로 바꿔도 세 상황의 최적 보기는 바뀌지 않는다(발표 Deck, 읽기 Paper, 탐색 Explorer). 0이 순위를 억지로 만든 것은 아니다.

### 위반 행렬 n(v) (✗ = 위반 1회)

| 제약 | Paper | Deck | Explorer |
|---|---|---|---|
| long_line | ✓ | ✓ | ✓ |
| no_overview | ✗ | ✗ | ✓ |
| scroll_heavy | ✗ | ✓ | ✓ |
| small_text | ✗ | ✓ | ✗ |
| too_many_panels | ✓ | ✓ | ✗ |
| nonlinear_order | ✓ | ✓ | ✗ |
| no_side_by_side | ✗ | ✓ | ✓ |
| detail_omitted | ✓ | ✗ | ✓ |
| no_print | ✓ | ✗ | ✗ |

### 상황별 비용 (낮을수록 선호, 스크립트로 계산함)

| 상황 | Paper | Deck | Explorer | 최적 |
|---|---|---|---|---|
| 발표 (present) | 13 | **4** | 11 | Deck |
| 읽기 (read) | **4** | 8 | 8 | Paper |
| 탐색 (explore) | 10 | 9 | **1** | Explorer |

읽기 상황에서 Deck과 Explorer는 둘 다 8로 동점이다. 토스트는 동점을 `=`로 표시한다(`Paper 4 < Deck 8 = Explorer 8`). 최소 비용이 동점이면 둘 다 최적으로 표시한다.

상황마다 최적 보기가 다르게 나오도록 weight를 정했다. 논문 Fig. 8에서 과업이 바뀌면 최적 차트가 바뀌는 것과 같은 효과다. 이 weight는 **사람이 정한 값**이므로, Draco-CQL처럼 hand-tuned에 해당한다는 점을 사이트에서 솔직하게 밝힌다. 토스트 안의 한 줄 설명으로 처리한다.

## 4. 인터랙션 설계

### 보기 전환 컨트롤
- 화면 위쪽 가운데에 segmented control: `Paper | Deck | Explorer`
- 키보드 단축키 `1` / `2` / `3`
- 현재 보기는 URL에 저장 (`?view=deck`). 링크를 공유하면 같은 보기로 열린다. localStorage에도 저장해 다시 방문할 때 유지한다.
- 상황 선택 `발표 | 읽기 | 탐색`은 컨트롤 옆에 작게 둔다. 상황을 바꾸면 weight가 바뀌고, 세 보기의 비용 순위가 다시 계산된다.

### 토스트 박스 (핵심 장치)
보기를 바꿀 때마다 오른쪽 아래에 나타나고, 몇 초 뒤 접혀서 "Cost 4" 배지로 남는다. 배지를 누르면 다시 펼쳐진다.

```
┌─ Deck · 발표 상황 ─────────────── Cost 4 ─┐
│ ✓ small_text       글자 28px ≥ 24     [5] │
│ ✓ no_side_by_side  비교를 좌우로 배치  [3] │
│ ...                                       │
│ ✗ no_overview      목차 상시 표시 없음 [2] │
│ ✗ detail_omitted   세부 수식 생략     [2] │
│ ┆ no_print  인쇄 부적합 · 비용 없음    [0] │
│───────────────────────────────────────────│
│ 순위: Deck 4 < Explorer 11 < Paper 13     │
│ ※ weight는 이 사이트용 hand-tuned 값       │
└───────────────────────────────────────────┘
```
- 위반 항목을 위에, 만족 항목은 접어서 아래에 둔다.
- weight가 0인 위반은 일반 위반과 구분해 흐리게(점선 테두리) 보여 주고 "이 상황에서는 weight 0이라 비용 없음"이라고 적는다.
- 각 행에 마우스를 올리면 ASP 형식의 제약 원문을 보여 준다.
- 위반·만족 표시는 색만으로 구분하지 않는다. ✓/✗ 아이콘과 글자를 함께 쓴다.

### 전환 애니메이션
보기를 바꿀 때 콘텐츠 블록이 새 위치로 이동한다(FLIP 또는 View Transitions API). 같은 데이터에 인코딩만 바뀐다는 느낌을 주기 위해서다. `prefers-reduced-motion`이면 애니메이션 없이 바로 전환한다.

## 5. 시각 스타일

| 항목 | 결정 |
|---|---|
| 서체 | 본문 **Pretendard** (한글과 영문 모두), 코드 **JetBrains Mono** |
| 색 토큰 | 중립 배경과 텍스트, 강조 1색. 의미 색은 hard(빨강 계열), 위반(주황), 만족(파랑) 3가지. 색각 이상자를 고려해 파랑/주황 대비로 정하고 아이콘을 병기 |
| 테마 | 라이트/다크 모두 지원. CSS 변수로 정의하고 기본은 시스템 설정을 따름 |
| 코드 블록 | ASP와 Vega-Lite JSON 문법 강조. 같은 의미의 줄끼리 연결 하이라이트 |
| 차트 | **Vega-Lite**(vega-embed)로 렌더링. Draco의 출력 언어이므로 컨셉과 맞는다. 단, 렌더링에 쓰는 Vega-Lite는 현재 버전이고 2019 Draco가 쓴 것은 v2이므로 사이트에 그 사실을 적는다 |
| 로고, 브랜딩 | Draco 공식 로고는 쓰지 않는다. 텍스트 제목만 쓴다 |

## 6. 콘텐츠 안의 인터랙티브 데모 후보

`docs/01_paper/02_key-examples-and-numbers.md`의 아이디어 중 3단계 목차에서 확정할 후보들이다.

1. **Vega-Lite ↔ ASP 대응**: 같은 차트를 두 언어로 나란히 보여 주고, 줄끼리 연결해 하이라이트 (Fig. 2)
2. **설계 공간 가지치기**: 후보 점들이 hard constraint 단계별로 사라짐 (Fig. 3, 4)
3. **Weight 슬라이더**: 후보 차트들의 비용 순위가 실시간으로 바뀜 (§4.2.2)
4. **질의 → 완성 파이프라인**: Fig. 6 예시를 단계별 애니메이션으로
5. **Learning to rank 미니 데모**: 실험 결과 쌍(nominal → color / shape / row)을 추가하면 weight가 움직임 (§5). size는 nominal에 쓰면 hard constraint 위반이라 특징에서 뺐다(IMP-003)
6. **과업 토글**: Draco-CQL과 Draco-Learn의 최적 차트 비교 (Fig. 8)
7. **2019 Draco Editor 링크**: https://idl.uw.edu/draco-editor/#/editor

## 7. 구현 구조 (4단계 준비)

```
frontend/src/
  content/       # 섹션별 콘텐츠 데이터 (보기와 무관한 단일 원본)
  design/        # 보기 facts, soft constraints, 상황별 weights, 비용 계산
  views/         # PaperView, DeckView, ExplorerView
  components/    # ViewSwitcher, CostToast, CodePair, VegaChart, demos/...
```
- 비용은 `design/`의 데이터로 브라우저에서 바로 계산한다(Σ w·n). ASP solver는 쓰지 않는다. 보기 3개를 미리 정의해 두므로 탐색할 필요가 없다.
- 백엔드는 필요 없다. `backend/` 폴더는 결정대로 남겨 둔다.

## 8. 결정 사항 (1차 반복: 권장안 채택)

1차 결과물은 사용자 승인 없이 아래 권장안대로 만든다. 결과를 본 뒤 1~4단계를 반복하며 고친다.

- [x] 보기 3개: Paper / Deck / Explorer. 기본값은 Deck
- [x] 상황 토글(발표 / 읽기 / 탐색)을 넣는다. 기본값은 "발표"
- [x] soft constraint 9개와 위 weight 표를 그대로 쓴다
- [x] 사이트 언어: 한국어 본문에 영어 용어 병기
- [x] 범주형 차트 색은 dataviz 기본 팔레트의 앞 3색(blue / orange / aqua)만 쓴다. cars 데이터의 Origin(USA / Europe / Japan)이 정확히 3개다
- [x] 차트 데이터: vega-datasets의 `cars.json`을 `frontend/public/data/`에 내장한다. 발표장 네트워크에 의존하지 않기 위해서다
- [x] Fig. 7(런타임 비교)은 원 데이터가 없으므로 차트로 다시 그리지 않는다. 논문에 적힌 수치만 숫자 타일로 보여 준다

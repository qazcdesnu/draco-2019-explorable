# 03. 용어집

| 용어 | 국문 | 한 줄 정의 |
|---|---|---|
| Encoding | 인코딩 | 데이터 필드를 마크의 시각 채널(위치, 색, 크기 등)에 대응시키는 것 |
| Mark | 마크 | 데이터를 표현하는 기하 요소 (bar, point, line, area, tick, text) |
| Visual channel | 시각 채널 | x, y, color, size, shape, text, detail, row, column |
| Data type | 데이터 타입 | nominal / ordinal / quantitative / temporal |
| Vega-Lite | — | 인코딩을 선언적으로 기술하는 시각화 문법. Draco의 출력 형식 |
| Partial specification | 부분 명세 | 일부 속성을 비워 둔 사용자 질의. Draco가 나머지를 채운다 |
| Completion | 완성 | 부분 명세를 완전한 명세로 채운 결과 |
| Design space | 설계 공간 | 고려 대상인 유효한 시각화 전체 |
| Hard constraint | 경성 제약 | 반드시 만족해야 함. 위반하면 후보에서 제외 (`:- ...`) |
| Soft constraint | 연성 제약 | 위반할 수 있지만 위반할 때마다 weight만큼 비용 (`:~ ... [w]`) |
| Well-formedness | 적형성 | 명세가 문법적으로 성립하는가 (예: shape는 point에만) |
| Expressiveness | 표현성 | 데이터의 사실을 전부, 그리고 그것만 전달하는가 (Mackinlay) |
| Effectiveness | 효과성 | 정보를 다른 시각화보다 더 쉽게 지각할 수 있는가 |
| Answer Set Programming (ASP) | 해답 집합 프로그래밍 | 규칙과 제약을 선언하면 solver가 해(answer set)를 찾는 선언형 논리 프로그래밍 |
| Answer set / Stable model | 해답 집합 | 제약과 모순되지 않고, 도출로 정당화되며, 최소인 atom 집합 |
| Atom / Literal / Rule | 원자 / 리터럴 / 규칙 | 명제 / 명제 또는 그 부정 / `head :- body.` |
| Negation as failure | 실패로서의 부정 | `not A` = "A를 도출할 수 없음" |
| Aggregate rule | 집계 규칙 | `l { ... } k` 형태로 선택지 수를 제한. 설계 공간 도메인 정의에 사용 |
| Clingo | — | Potassco의 ASP solver (grounder + solver). Draco의 엔진 |
| Cost | 비용 | 위반한 soft constraint들의 weight × 횟수의 합. 낮을수록 선호 |
| Feature vector | 특징 벡터 | soft constraint별 위반 횟수 벡터 x |
| Learning to rank | 순위 학습 | 정답 레이블 대신 "A > B"라는 순서 쌍으로 학습 |
| RankSVM | — | 쌍 차이 벡터에 대해 hinge loss로 학습하는 선형 SVM 순위 모델 |
| Markov Logic Network (MLN) | 마르코프 논리 네트워크 | weight가 있는 논리 공식으로 확률 분포를 정의하는 모델 |
| MAP inference | 최대 사후 추론 | 가장 확률이 높은 해 찾기 = Draco에서는 최소 비용 완성 찾기 |
| Value task / Summary task | 값 과업 / 요약 과업 | 개별 값을 읽고 비교 / 앙상블(분포, 평균 등) 파악 (Kim & Heer) |
| Generate-and-test | 생성 후 검사 | 후보를 전부 만들고 걸러내는 방식 (CompassQL) |
| APT | — | Mackinlay(1986)의 최초의 자동 시각화 설계 시스템 |
| CompassQL | — | Voyager의 추천 엔진. hand-tuned 점수를 쓰는 imperative JS |
| Unsatisfiable core | 불만족 핵심 | 동시에 만족할 수 없는 최소 제약 집합. "맞춤법 검사기" 아이디어의 기반 |

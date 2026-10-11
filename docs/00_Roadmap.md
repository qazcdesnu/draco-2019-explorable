# Draco 논문 리뷰 웹사이트 — 진행 로드맵

논문: *Formalizing Visualization Design Knowledge as Constraints: Actionable and Extensible Models in Draco* (Moritz et al., IEEE TVCG 2019)

## 단계와 산출물

| 단계 | 내용 | 산출물 | 상태 |
|---|---|---|---|
| 0 | Vite 프로젝트 초기화 | `frontend/` (React + TypeScript) | 완료 |
| 1 | 논문 읽고 문서화 | `docs/01_paper/` | 완료 |
| 2 | Draco 컨셉에 맞는 웹 디자인 결정 | `docs/02_design.md` | 1차 완료 (권장안 채택) |
| 3 | 리뷰 순서, 목차, 파트 배열 | `docs/03_outline.md` | 1차 완료 |
| 4 | 문서 기반으로 웹사이트 구현 | `frontend/src/` | 1차 결과물 완성 (피드백 대기) |
| 5 | 빌드, 배포 전략 문서화 후 직접 배포 | `docs/05_deploy.md` | 문서 완료, Vercel 연결 진행 중 |
| 6 | 내용 보강 (개선 요청 → 검토 → 승인 → 반영) | `docs/06_improvements.md`, 대본 `docs/07_script.md` | 진행 중 (IMP-001, 002 검토 완료) |

## 1단계 문서 (`docs/01_paper/`)

1. `01_section-summary.md`: 섹션별 요약. 논문 흐름을 그대로 따라감
2. `02_key-examples-and-numbers.md`: 웹사이트에 그대로 쓸 수 있는 코드 예시, 그림 설명, 수치
3. `03_glossary.md`: 용어집 (영문, 국문, 한 줄 정의)
4. `04_critical-review.md`: 기여, 강점, 한계, 토론 질문, 개념 노트의 열린 질문에 대한 답

## 기존 자료

- `../01_Paper Core concepts (Eng).md`, `../02_Paper Core concepts (Kor).md`: 처음 정리한 핵심 개념 노트 (Encoding, Hard/Soft constraints, ASP)
- `../2019-Draco-InfoVis.pdf`: 원문. 모든 주장의 근거

## 참고 링크

| 용도 | 주소 | 비고 |
|---|---|---|
| 2019 Draco 데모 (Draco Editor) | https://idl.uw.edu/draco-editor/#/editor | 2019 버전임을 확인함 (Vega-Lite v2, 브라우저용 clingo.wasm, `define.lp`/`weights.lp`). 발표 중 라이브 시연이나 웹사이트 링크로 쓸 수 있음 |
| 논문에 적힌 공개 주소 (§1) | https://uwdata.github.io/draco/ | 현재 https://idl.uw.edu/draco/ 로 리다이렉트됨. 이후 버전 내용이 섞여 있을 수 있음 |
| DOI | https://doi.org/10.1109/TVCG.2018.2865240 | |

## 반복 계획

1~4단계를 몇 차례 반복해 다듬은 뒤 5단계(빌드, 배포)로 넘어간다.

- **1차 (2026-10-11):** 권장안대로 보기 3개, 상황 토글, 11개 파트, 데모 6종을 구현했다. 빌드와 린트 통과, 데스크톱과 모바일(390px)에서 화면을 확인했다.

## 결정 사항 기록

- 백엔드: 최종 사이트가 완성될 때까지 `backend/` 폴더는 비워 둔 채 유지한다. 현재 계획은 정적 프론트엔드만 만드는 것이다.
- 배포: 정적 사이트로 Vercel에 배포한다. GitHub `qazcdesnu/draco-2019-explorable`의 `main`에 push하면 자동 배포된다 (`docs/05_deploy.md`).
- 라이선스: 직접 쓴 코드와 글은 MIT. 논문 PDF와 그림은 저장소에 넣지 않는다. 출처는 README와 사이트 하단에 적는다.
- 프론트엔드: Vite + React + TypeScript (create-vite 9, Vite 8)

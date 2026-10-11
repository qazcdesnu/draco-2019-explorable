# 5단계: 빌드와 배포 전략

## 결정

- **정적 사이트로 배포한다.** 모든 데모가 브라우저에서 돌고 데이터(`cars.json`)도 번들되어 있어 서버가 필요 없다. 그래서 FastAPI/Render는 쓰지 않는다. `backend/`는 비워 둔 채 유지한다.
- **Vercel + GitHub 연동.** 저장소 [qazcdesnu/draco-2019-explorable](https://github.com/qazcdesnu/draco-2019-explorable)을 Vercel 프로젝트에 한 번 연결한다. 이후에는 push만 하면 된다.
  - `main`에 push → 운영(Production) 배포가 자동으로 갱신된다.
  - 다른 브랜치에 push하거나 PR을 열면 → 미리보기(Preview) 주소가 따로 생긴다. 운영 주소는 바뀌지 않는다.
- **Vercel CLI는 쓰지 않는다.** 연결은 Vercel 대시보드에서 한 번만 하면 되고, 이후 배포는 GitHub push로 일어난다.

## 빌드 구성

| 항목 | 값 | 어디에 적혀 있나 |
|---|---|---|
| Root Directory | `frontend` | Vercel 프로젝트 설정 (대시보드에서 입력) |
| Framework | Vite | `frontend/vercel.json` |
| Install | `npm ci` (lockfile 그대로 설치) | `frontend/vercel.json` |
| Build | `npm run build` = `tsc -b` → `vite build` → 서드파티 라이선스 파일 생성 | `frontend/package.json` |
| Output | `dist` | `frontend/vercel.json` |
| Node | `>=20.19` (Vite 8의 요구 버전) | `frontend/package.json`의 `engines` |
| 환경 변수 | 없음 | |

- 사이트는 `index.html` 한 장이고, 보기와 슬라이드 상태는 query string(`?view=deck&slide=3`)에 둔다. 그래서 SPA용 rewrite 설정이 필요 없다.
- 파일 이름에 해시가 붙는 `/assets/*`는 1년 캐시(`immutable`)로 둔다. `index.html`은 Vercel 기본값(매번 재검증)이라 새 배포가 바로 보인다.
- 빌드 결과는 약 1.4MB다. vega 번들(약 850KB, gzip 291KB)은 첫 차트가 필요할 때 따로 불러온다.

## 처음 한 번: Vercel 연결

1. https://vercel.com/new 에 GitHub 계정(qazcdesnu)으로 로그인한다.
2. **Import Git Repository**에서 `draco-2019-explorable`을 고른다. 목록에 없으면 "Adjust GitHub App Permissions"에서 이 저장소 접근을 허용한다.
3. **Root Directory**를 `frontend`로 바꾼다. 이 칸만 직접 바꾸면 되고, 나머지 값은 `vercel.json`이 채운다.
4. **Deploy**를 누른다. 1분 안팎으로 `https://<프로젝트명>.vercel.app` 주소가 나온다.
5. 주소를 이 문서의 "배포 기록"과 GitHub 저장소 About의 Website 칸에 적는다.

## 평소 작업 흐름

```bash
cd frontend
npm run dev                      # 수정하면서 확인
npm run lint && npm run build    # push 전에 로컬에서 같은 빌드를 돌린다
npm run preview                  # 빌드 결과를 http://localhost:4173 에서 확인
cd .. && git add -A && git commit -m "..." && git push   # main에 push → 자동 배포
```

- 큰 수정은 브랜치에서 하고 미리보기 주소로 확인한 뒤 `main`에 합친다.
- 배포가 실패하면 Vercel 대시보드의 Deployments → 해당 배포 → Build Logs를 본다. 실패한 배포는 운영 주소에 반영되지 않는다(직전 배포가 유지된다).
- 되돌리기: Vercel 대시보드에서 이전 배포를 골라 **Promote to Production**을 누르거나, `git revert` 후 push한다.

## 로컬 빌드 확인 (Vercel과 같은 조건)

커밋된 파일만으로 빌드되는지 보려면 저장소를 새로 clone해서 빌드한다. 로컬에만 있고 커밋하지 않은 파일에 기대는 실수를 잡아 준다.

```bash
git clone git@github-qazcdesnu:qazcdesnu/draco-2019-explorable.git /tmp/draco-check
cd /tmp/draco-check/frontend && npm ci && npm run build && npm run preview
```

## 발표 당일 대비

- 차트 데이터는 번들되어 있지만 글꼴(Pretendard, JetBrains Mono)은 CDN에서 받는다. 인터넷이 끊기면 시스템 글꼴로 바뀐다. 레이아웃은 유지된다.
- 인터넷이 아예 안 되는 경우를 대비해 노트북에서 `npm run build && npm run preview`로 띄울 수 있게 준비한다.
- 발표용 링크는 `?view=deck&ctx=present`로 시작하게 공유한다.

## 배포 기록

| 날짜 | 내용 | 주소 |
|---|---|---|
| 2026-10-11 | 로컬 clean clone에서 `npm ci` + `npm run build` 통과 (Node 20.19.5, Vite 8.3.4) | |

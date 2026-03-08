# 프렌즈텔 배포·운영 런북

## 로컬 실행

```bash
npm install
npm run dev
```

- 브라우저: `http://localhost:5173`
- 네트워크 공유: `npm run dev:share` 후 동일 LAN에서 접속 가능

## 빌드

```bash
npm run build
```

- 산출물: `dist/`
- **BASE_PATH**: GitHub Pages는 저장소 이름에 따라 경로가 달라짐. CI에서 자동 설정:
  - `사용자명.github.io` 저장소 → `BASE_PATH: '/'`
  - 그 외 저장소 → `BASE_PATH: '/저장소이름/'`

로컬에서 서브경로로 테스트할 때:

```bash
BASE_PATH=/프렌즈텔/ npm run build
npm run preview
```

## GitHub Pages 배포

1. 저장소 **Settings → Pages** → Source: **GitHub Actions**
2. `main` 브랜치에 푸시 시 `.github/workflows/deploy.yml` 실행
3. 배포 URL: `https://사용자명.github.io/저장소이름/` (사용자 사이트면 `https://사용자명.github.io/`)

### SPA 404 처리
- 워크플로에서 `cp dist/index.html dist/404.html` 로 미리 처리됨. GitHub Pages가 알 수 없는 경로를 404.html로 서빙해 클라이언트 라우팅이 동작함.

## Vercel 배포

1. Vercel 프로젝트를 저장소와 연결한다.
2. 기본 빌드 명령은 `npm run build`, 산출물은 `dist/`를 사용한다.
3. 저장소 루트의 `vercel.json`으로 SPA rewrite가 적용된다.

### SPA 새로고침 처리 (Vercel)
- `vercel.json`의 rewrite 설정으로 모든 경로를 `index.html`로 폴백한다.
- 대상 라우트:
  - `/home/:homeId`
  - `/home/:homeId/about`
  - `/home/:homeId/board/:boardId`
  - `/home/:homeId/board/:boardId/post/:postId`
  - `/home/:homeId/board/:boardId/write`
- 기대 결과: 상세 경로 직접 진입/새로고침 시에도 React Router가 정상 렌더링한다.

## 롤백

1. 배포 전 상태로 되돌릴 커밋 확인: `git log`
2. 되돌리기: `git revert <commit>` 또는 `git reset --hard <commit>` 후 force push (팀 정책에 따름)
3. `main`에 푸시하면 해당 커밋 기준으로 재배포됨
4. **주의**: `src/data/mock.js` 스키마·키 변경 시 기존 사용자 localStorage와 불일치할 수 있음.  
   - 현재 버전은 `friends_tell_data`에 `meta.aiItMeetupLastPlayDate`를 추가하고, `friends_tell_homes`에 `home_ai_it_meetup` 시드 홈을 자동 주입한다.
   - 롤백 시에는 기존 저장소 데이터를 유지한 채 UI만 이전 버전으로 돌아갈 수 있으므로, 시드 데이터 노출 정책(자동 생성/자동 대화)을 함께 확인한다.
5. Vercel 라우팅 이슈가 생기면 `vercel.json`의 rewrite 변경 커밋을 우선 롤백한다.

## 환경·시크릿

- 현재: 빌드 시점 환경 변수는 `BASE_PATH` 정도. 시크릿 없음.
- 운영자 비밀번호는 `src/data/mock.js` 내 상수(`OPERATOR_PASSWORD`). 변경 시 해당 파일 수정 후 배포.

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
4. GitHub Pages는 서버리스 API를 제공하지 않으므로 `/api/shared-data`는 동작하지 않으며, 앱은 자동으로 localStorage 폴백 모드로 동작한다.

### SPA 404 처리
- 워크플로에서 `cp dist/index.html dist/404.html` 로 미리 처리됨. GitHub Pages가 알 수 없는 경로를 404.html로 서빙해 클라이언트 라우팅이 동작함.

## Vercel 배포

1. Vercel 프로젝트를 저장소와 연결한다.
2. 기본 빌드 명령은 `npm run build`, 산출물은 `dist/`를 사용한다.
3. 저장소 루트의 `vercel.json`으로 SPA rewrite가 적용된다.
4. 공용 DB를 쓰려면 Upstash Redis Integration을 연결하고 환경변수를 설정한다.

### SPA 새로고침 처리 (Vercel)
- `vercel.json`에서 `/api/*`는 API 함수로 유지하고, 나머지 경로는 `index.html`로 폴백한다.
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
4. **주의**: `src/data/mock.js` 스키마·키 변경 시 기존 사용자 localStorage와 불일치할 수 있음. 필요 시 마이그레이션 또는 안내 문구 고려.
5. Vercel 라우팅 이슈가 생기면 `vercel.json`의 rewrite 변경 커밋을 우선 롤백한다.
6. 공용 DB 장애 시 임시 완화: Vercel 환경변수 `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`을 제거/비활성화하면 클라이언트가 localStorage 폴백 모드로 동작한다.
7. 공용 DB 키(`friends_tell:shared_db:v1`) 스키마를 변경할 때는 `v2` 키를 병행 운영하고 이전 절차를 문서화한다.

## 환경·시크릿

- 빌드/런타임:
  - `BASE_PATH` (빌드 경로)
  - `UPSTASH_REDIS_REST_URL` (공용 DB URL)
  - `UPSTASH_REDIS_REST_TOKEN` (공용 DB 토큰)
- 공용 DB 미설정 시에도 앱은 localStorage 폴백으로 동작한다.
- 운영자 비밀번호는 `src/data/mock.js` 내 상수(`OPERATOR_PASSWORD`). 변경 시 해당 파일 수정 후 배포.

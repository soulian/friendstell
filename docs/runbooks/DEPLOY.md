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
5. OG 동적 미리보기는 Vercel 함수(`/api/og-meta`, `/api/og-image`)를 사용하므로, `/home/:homeId` 및 하위 경로 요청이 `vercel.json`에서 `og-meta`로 rewrite되는지 확인한다.

### 공용 DB 유지 정책 (중요)
- 재배포 시 공용 DB를 초기화(키 삭제/flush)하지 않는다.
- API는 기본 키 `friends_tell:shared_db:v1`를 사용하며, 저장 시 `friends_tell:shared_db:v1:backup`도 함께 갱신한다.
- 읽기 시에는 기본 키 + 레거시 키(`friends_tell:shared_db`, `friends_tell:shared_db:v0`) + 백업 키를 병합해 자동 복구한다.
- 운영 중 홈 데이터가 비어 보이면 먼저 Upstash 환경변수와 키 접근 권한을 점검한다.

### SPA 새로고침 처리 (Vercel)
- `vercel.json`에서 `/api/*`는 API 함수로 유지하고, 나머지 경로는 `index.html`로 폴백한다.
- `/home/:homeId` 및 하위 경로는 `api/og-meta`를 거쳐 동적 OG 메타를 주입한 뒤 SPA 엔트리 HTML을 반환한다.
- 대상 라우트:
  - `/home/:homeId`
  - `/home/:homeId/about`
  - `/home/:homeId/board/:boardId`
  - `/home/:homeId/board/:boardId/post/:postId`
  - `/home/:homeId/board/:boardId/write`
- 기대 결과:
  - 상세 경로 직접 진입/새로고침 시에도 React Router가 정상 렌더링한다.
  - 링크 프리뷰 크롤러가 상세 경로 접근 시 `og:image`에 홈 미니룸 이미지(`/api/og-image?homeId=...`)가 노출된다.
  - `og:image` 응답 헤더 `Content-Type`이 `image/png`인지 확인한다.
- Header 하단 동기화 배너가 `공용DB 연결됨`으로 표시되는지 확인한다.
- 운영(프로덕션)에서 `공용DB 연결 오류` 문구가 뜨면 로컬 저장이 차단되며 글/댓글/홈 생성이 실패한다. 이 상태에서는 Upstash 환경변수/연결을 우선 복구한다.
- `로컬 모드` 배너는 개발/프리뷰 런타임에서만 허용된다.

## 롤백

1. 배포 전 상태로 되돌릴 커밋 확인: `git log`
2. 되돌리기: `git revert <commit>` 또는 `git reset --hard <commit>` 후 force push (팀 정책에 따름)
3. `main`에 푸시하면 해당 커밋 기준으로 재배포됨
4. **주의**: `src/data/mock.js` 스키마·키 변경 시 기존 사용자 localStorage와 불일치할 수 있음. 필요 시 마이그레이션 또는 안내 문구 고려.
   - 현재 버전은 기본 시드 홈(`home_ai_it_meetup`)과 시드 게시글/댓글을 자동 보정한다. 롤백 시 시드 데이터 노출 방식(자동 주입 여부)을 함께 확인한다.
   - outbox 재동기화 키(`friends_tell_pending_mutations_v1`)가 남아 있을 수 있으므로, 구버전으로 롤백 시 재시도 동작 차이가 없는지 확인한다.
   - 인증 기능 롤백 시 회원정보 키(`friends_tell_users_v1`)와 로그인 세션 키(`friends_tell_auth_session_v1`)는 구버전에서 사용되지 않는다. 필요하면 사용자 안내 후 수동 정리(브라우저 저장소 초기화)한다.
5. Vercel 라우팅 이슈가 생기면 `vercel.json`의 rewrite 변경 커밋을 우선 롤백한다.
6. 공용 DB 장애 시 임시 완화: Vercel 환경변수 `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`을 제거/비활성화하면 클라이언트가 localStorage 폴백 모드로 동작한다.
7. 공용 DB 키(`friends_tell:shared_db:v1`) 스키마를 변경할 때는 `v2` 키를 병행 운영하고 이전 절차를 문서화한다.
8. 공용 DB 유실 의심 시 `friends_tell:shared_db:v1:backup` 값을 먼저 확인하고, 필요하면 해당 값을 `friends_tell:shared_db:v1`로 복원한다.
9. OG 동적 주입 장애(홈 경로 진입 실패/미리보기 깨짐) 시 `vercel.json`의 `/home/:homeId* -> /api/og-meta` rewrite를 롤백해 기존 `/index.html` 직결 경로로 즉시 복구한다.
10. 공유 데이터가 일부 사용자에게만 보이는 경우 Header 배너에서 `로컬 모드` 여부와 `원격 동기화 대기 N건` 문구를 먼저 확인한다. 일시 장애 후 자동 재동기화(outbox)가 실패하면 Upstash 연결 상태를 복구한 뒤 홈 화면 재접속으로 재시도한다.

## 환경·시크릿

- 빌드/런타임:
  - `BASE_PATH` (빌드 경로)
  - `UPSTASH_REDIS_REST_URL` (공용 DB URL)
  - `UPSTASH_REDIS_REST_TOKEN` (공용 DB 토큰)
- 개발/프리뷰 런타임에서는 공용 DB 미설정 시 localStorage 폴백으로 동작한다.
- 운영(프로덕션) 런타임에서는 공용 DB 미설정/장애 시 localStorage 폴백을 허용하지 않고, 쓰기 작업(홈 생성·글/댓글 작성·홈 이름 변경)을 차단한다.
- 운영자 비밀번호는 `src/data/mock.js` 내 상수(`OPERATOR_PASSWORD`). 변경 시 해당 파일 수정 후 배포.

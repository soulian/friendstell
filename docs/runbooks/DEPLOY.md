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

## 롤백

1. 배포 전 상태로 되돌릴 커밋 확인: `git log`
2. 되돌리기: `git revert <commit>` 또는 `git reset --hard <commit>` 후 force push (팀 정책에 따름)
3. `main`에 푸시하면 해당 커밋 기준으로 재배포됨
4. **주의**: `src/data/mock.js` 스키마·키 변경 시 기존 사용자 localStorage와 불일치할 수 있음. 필요 시 마이그레이션 또는 안내 문구 고려.

## 환경·시크릿

- 현재: 빌드 시점 환경 변수는 `BASE_PATH` 정도. 시크릿 없음.
- 운영자 비밀번호·기본 게시판 비밀번호는 `src/data/mock.js` 내 상수. 변경 시 해당 파일 수정 후 배포.

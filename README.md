# 프렌즈텔

**친구와 함께 쓰는 게시판**을 만드는 서비스. 사용자가 프렌즈홈을 만들고, 링크를 공유해 함께 공지·자유·소식·임시 게시판을 쓸 수 있습니다. **하이텔** 시절 PC통신 터미널 느낌의 디자인과 키보드 조작을 지원합니다.

## 실행 방법

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:5173` 으로 접속하세요.

## 메뉴 구조 (프렌즈홈당)

- **기본메뉴**: 1. 공지사항, 2. 프렌즈텔?(서비스 소개)
- **커뮤니티**: 3. 자유게시판, 4. (프렌즈홈 이름) 소식, 5. 임시 게시판

## 기능

- **프렌즈홈 생성**: `/create` 진입 또는 상단 드롭다운의 "새 프렌즈홈 만들기"에서 제목을 입력해 생성.
- **키보드 조작**: 1~5로 메뉴 선택, N으로 새 프렌즈홈, Enter 확인, ↑↓ 메뉴 이동, Tab 포커스 이동, Esc 닫기. 화면 하단에 단축키 안내 표시.
- **퍼머링크 공유**: 프렌즈홈 제목 옆 🔗 버튼으로 현재 페이지 URL 복사.  
  - Vercel 배포에서는 `/home/:homeId` 및 하위 링크에서 OG 메타를 서버에서 동적으로 주입하며, `og:image`는 해당 홈의 캠핑장 미니룸 상태(유니크 작성자 수 반영)를 PNG로 생성합니다.
  - GitHub Pages 배포에서는 서버리스 API가 없으므로 URL별 동적 OG는 동작하지 않고 기본 메타만 사용됩니다.
- **공지사항**: 운영자 비밀번호 입력 후에만 글쓰기 가능 (기본: `village2024`, `src/data/mock.js`의 `OPERATOR_PASSWORD`에서 변경).
- **4·5번(소식, 임시 게시판)**: 비밀번호 없이 바로 열람·글쓰기 가능.
- **데이터**: 기본적으로 `/api/shared-data` 공용 DB를 사용해 **모든 사용자에게 같은 홈/게시판/글/댓글**을 보여줍니다. 공용 DB가 없거나 장애가 나면 자동으로 브라우저 **localStorage**(홈/글/댓글)로 폴백합니다. 폴백 중 생성된 데이터는 outbox에 쌓였다가 공용 API 복구 시 재동기화됩니다. 닉네임은 **sessionStorage**를 사용합니다.

## 공용 DB(모든 사용자 통합) 설정

프렌즈텔을 Vercel에 배포하는 경우:

1. Vercel 프로젝트에서 **Upstash Redis Integration**을 연결합니다.
2. 환경변수 `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`이 설정되었는지 확인합니다.
3. 배포 후 `/api/shared-data`가 200 응답하면 공용 DB 모드가 활성화됩니다.

> 로컬 개발(`npm run dev`)에서는 Vite 단독 실행 시 `/api/shared-data`가 없으므로 localStorage 폴백 모드로 동작합니다.

## GitHub Pages 배포

1. 이 프로젝트를 **GitHub 저장소**에 올립니다.
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/사용자명/저장소이름.git
   git branch -M main
   git push -u origin main
   ```

2. 저장소 **Settings → Pages** 에서  
   **Build and deployment → Source** 를 **GitHub Actions** 로 선택합니다.

3. `main` 브랜치에 푸시하면 자동으로 빌드 후 **GitHub Pages**에 배포됩니다.  
   배포 주소: `https://사용자명.github.io/저장소이름/`

> 저장소 이름을 `사용자명.github.io` 로 만들면 루트(`https://사용자명.github.io/`)에 배포됩니다.  
> 그 경우 `.github/workflows/deploy.yml` 의 `BASE_PATH` 를 `'/'` 로 바꿔야 합니다.
# friends-tell
# friendsnews

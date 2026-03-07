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
- **퍼머링크 공유**: 프렌즈홈 제목 옆 🔗 버튼으로 현재 페이지 URL 복사. 카톡 등에 붙여넣기 시 OG 메타로 기본 제목·설명이 미리보기에 사용됩니다. (URL별 다른 미리보기는 서버에서 OG를 URL별로 제공해야 합니다.)
- **공지사항**: 운영자 비밀번호 입력 후에만 글쓰기 가능 (기본: `village2024`, `src/data/mock.js`의 `OPERATOR_PASSWORD`에서 변경).
- **4·5번(소식, 임시 게시판)**: 비밀번호 없이 바로 열람·글쓰기 가능.
- **데이터**: 브라우저 **localStorage**(홈/글/댓글)와 **sessionStorage**(닉네임)에 저장.

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

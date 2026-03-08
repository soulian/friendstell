# 프렌즈텔 — 현재 출시 슬라이스 & 다음 백로그

> 우리 일하기 방식: 현재 결과물을 “출시된 첫 슬라이스”로 정의하고, 다음에 할 수 있는 스토리 후보를 정리합니다.  
> 새 기능은 **backlog-to-epic** → **story-slicing** → **vertical-slice-delivery** → **release-readiness** 순서로 진행합니다.

---

## 1. 현재 출시 슬라이스 (Shipped)

**이름**: 프렌즈텔 MVP+ — 공용 DB 통합(사용자 공통 홈/게시판) + 5개 게시판 + 글·댓글 + 키보드·공유

| 구분 | 내용 |
|------|------|
| **사용자 가치** | 링크 하나로 “우리만의 게시판”을 만들고, 친구와 공지·자유·소식·임시 게시판을 함께 사용 가능 |
| **포함** | 홈 생성, 홈별 5개 메뉴, 글쓰기/보기/댓글, 홈 메인 캠프파이어 성장 씬(유니크 작성자 기준), 공지 비밀번호, 키보드 조작, URL 복사, 공용 DB API(`/api/shared-data`) + localStorage 폴백 |
| **미포함** | 로그인, 알림, 검색, 첨부파일, 충돌 해결을 포함한 강한 동시성 제어 |
| **문서** | `docs/prd/CURRENT_PRODUCT.md`, `docs/runbooks/DEPLOY.md`, `docs/runbooks/RELEASE_CHECKLIST.md` |

---

## 2. 다음 스토리 후보 (Backlog)

아이디어를 epic·스토리로 만들 때 **backlog-to-epic** 스킬을 사용하고, 한 PR 범위로 자를 때 **story-slicing**을 사용한다.

### 2.1 기능 확장
- **새 글 알림(앱 내)**: 구독 게시판 지정 → 새 글 시 앱 내 배지·목록 (localStorage 기준, 푸시 없음)
- **검색**: 프렌즈홈 내 글 제목·본문 검색
- **글 수정·삭제**: 작성자(닉네임) 일치 시 수정·삭제 허용
- **첨부파일**: 이미지/파일 업로드 (로컬 저장 또는 외부 스토리지 연동)

### 2.2 UX·접근성
- **모바일 터치**: 터치에서도 메뉴·글쓰기 편하게
- **다크 모드**: 하이텔 테마 대비 스킨
- **OG 메타 개선**: URL별 제목·설명 (서버 또는 정적 JSON)

### 2.3 데이터·인프라
- **서버 연동 고도화**: 동시 수정 충돌 해결(낙관적 락/버전 관리) 및 감사 로그
- **내보내기**: 프렌즈홈 데이터 JSON/파일 다운로드
- **가져오기**: JSON 업로드로 기존 데이터 복원

### 2.4 Tech Debt·품질
- **테스트**: 메인 플로우 E2E 또는 핵심 데이터/유틸 단위 테스트
- **에러 바운더리**: React 에러 바운더리 + 폴백 UI
- **로딩·빈 상태**: 모든 목록·상세 화면에 로딩·빈 상태 명시

### 2.5 Bug Backlog

- **BUG-001 · Vercel 배포 링크 새로고침 시 에러 화면 노출**
  - **문제 요약**: Vercel에 배포된 프렌즈텔 URL에서 상세 경로(예: `/home/:homeId/board/:boardId`, `/home/:homeId/board/:boardId/post/:postId`) 상태로 브라우저 새로고침 시 에러/404 화면이 노출된다.
  - **재현 절차**:
    1. Vercel 배포 URL로 접속 후 게시판/게시글 상세 페이지로 이동한다.
    2. 해당 경로에서 브라우저 새로고침(F5) 또는 주소창 재진입을 수행한다.
    3. 앱이 아닌 에러 화면(404 등)이 표시된다.
  - **기대 동작**: 어떤 클라이언트 라우트에서 새로고침해도 `index.html` 폴백 후 React Router가 정상 렌더링한다.
  - **영향도**: 공유 링크 진입성과 신뢰도가 떨어지며, 모바일 인앱 브라우저/메신저 재진입 시 이탈 가능성이 높다.
  - **가설 원인**: Vercel의 SPA rewrite/fallback 설정 부재(`vercel.json` 미구성) 가능성이 높다.
  - **우선순위**: P1 (배포 안정성)
  - **완료 기준(AC)**:
    - Vercel 배포본에서 `/home/:homeId`, `/home/:homeId/about`, `/home/:homeId/board/:boardId`, `/home/:homeId/board/:boardId/post/:postId`, `/home/:homeId/board/:boardId/write` 경로를 직접 진입/새로고침해도 정상 렌더링된다.
    - 원인 및 대응 방법이 `docs/runbooks/DEPLOY.md`에 반영된다.

---

## 3. 새 아이디어 처리 절차

1. **AGENTS.md**를 읽고, **backlog-to-epic**으로 아이디어를 epic + 첫 출시 슬라이스로 만든다.
2. **story-slicing**으로 스코프를 **한 번에 프리뷰 가능한 PR** 하나로 줄인다.
3. **vertical-slice-delivery**로 PM, design, FE, BE, data, infra, QA 관점에서 계획한다.
4. 구현 후 머지 전 **release-readiness**로 체크한다.

문서 갱신: epic·스토리가 확정되면 `docs/prd/`, `docs/backlog/` 또는 `docs/epic/`에 정리해 두면 다음 작업 시 맥락을 잃지 않는다.

# ADR 001: 현재 아키텍처 (클라이언트 전용 SPA + localStorage)

## 상태
Accepted (현재 출시 버전 기준)

## 배경
- 프렌즈텔 1차 목표: “친구와 링크 하나로 게시판 공유”를 **서버 없이** 빠르게 검증.
- 단일 사용자 또는 같은 기기에서의 시나리오도 허용.

## 결정
- **SPA**: React + React Router. Vite 빌드, 정적 호스팅(GitHub Pages).
- **상태·영속**: 서버 없음. `src/data/mock.js`에서 localStorage(홈·글·댓글·비밀번호)·sessionStorage(닉네임·게시판 접근) 사용.
- **라우팅**: `/home/:homeId`, `/home/:homeId/board/:boardId`, `home/:homeId/board/:boardId/post/:postId` 등. SPA 404 대응으로 `dist/404.html` 복사.
- **배포**: GitHub Actions로 `main` 푸시 시 빌드 후 GitHub Pages에 배포. BASE_PATH는 저장소 이름에 따라 자동 설정.

## 결과
- 장점: 서버 비용·설계 없이 빠르게 출시, 오프라인·로컬에서도 동작 가능.
- 단점: 디바이스·브라우저가 바뀌면 데이터 비공유, 데이터 손실 위험(localStorage 삭제 시). 멀티 디바이스·장기 보존이 필요하면 추후 백엔드 도입(별도 ADR).

## 참고
- `docs/prd/CURRENT_PRODUCT.md` — 현재 스코프
- `docs/runbooks/DEPLOY.md` — 배포·롤백

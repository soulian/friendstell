# 프렌즈텔 문서

현재 개발 결과물에 **우리 일하기 방식**을 적용한 문서 구조입니다.

## 디렉터리

| 경로 | 용도 |
|------|------|
| **prd/CURRENT_PRODUCT.md** | 현재 제품 요약(PRD) — 스코프, 사용자 플로우, AC, 기술 스택 |
| **runbooks/RELEASE_CHECKLIST.md** | 머지·릴리스 전 체크리스트 (DoD 반영) |
| **runbooks/DEPLOY.md** | 로컬 실행, 빌드, GitHub Pages 배포, 롤백 |
| **backlog/CURRENT_AND_NEXT.md** | 현재 출시 슬라이스 정리 + 다음 스토리 후보 |
| **adr/001-current-architecture.md** | 현재 아키텍처 (SPA + localStorage) |

## 새 기능 진행 순서

1. **AGENTS.md** 읽기  
2. **backlog-to-epic** — 아이디어 → epic + 첫 출시 슬라이스  
3. **story-slicing** — 한 번에 프리뷰 가능한 PR 범위로 축소  
4. **vertical-slice-delivery** — PM/design/FE/BE/data/infra/QA 계획  
5. 구현 후 **release-readiness** — 머지 전 검증  

Epic·스토리 확정 시 `prd/`, `backlog/`, 또는 `epic/` 에 정리해 두면 다음 작업 시 맥락 유지에 도움이 됩니다.

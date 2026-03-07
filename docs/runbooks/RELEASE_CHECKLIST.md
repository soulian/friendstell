# RELEASE_CHECKLIST

머지·릴리스 전에 확인하는 체크리스트. (AGENTS.md Definition of Done과 동기화)

## Before merge
- [ ] Acceptance criteria met
- [ ] Relevant tests pass (해당 변경에 대한 테스트)
- [ ] Preview validated (로컬 또는 배포 프리뷰에서 동작 확인)
- [ ] Screenshots / proof attached (UI 변경 시)
- [ ] Docs updated if behavior changed (동작·API·운영 변경 시 docs 반영)
- [ ] Analytics/logging considered (사용자 가시 기능 시)
- [ ] Rollback notes written for risky changes (설정·env·스키마·인증 등)

## Before production (배포 전)
- [ ] Env/config validated (BASE_PATH 등)
- [ ] Flags/defaults checked (기능 플래그 사용 시)
- [ ] Monitoring plan ready (필요 시)
- [ ] Owner for launch is clear

## After production
- [ ] Smoke test complete (배포 URL에서 메인 플로우 확인)
- [ ] Metrics checked (해당 시)
- [ ] Errors/logs checked (해당 시)
- [ ] Follow-up issues created if needed

## 프렌즈텔 특이사항
- **배포**: GitHub Pages. `main` 푸시 시 Actions로 빌드·배포. `docs/runbooks/DEPLOY.md` 참고.
- **롤백**: 이전 커밋으로 되돌린 뒤 `main` 푸시. localStorage 호환 깨지면 사용자 데이터 리셋 가능성 안내.

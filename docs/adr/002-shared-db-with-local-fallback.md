# ADR 002: 공용 DB(Upstash Redis) + 로컬 폴백 하이브리드 저장소

## 상태
Accepted

## 배경
- 실제 사용 시 “사용자/기기마다 데이터가 다르게 보인다”는 피드백이 발생했다.
- 기존 ADR 001 구조는 localStorage 중심이라 동일 URL이라도 사용자 간 게시판/홈/댓글이 공유되지 않았다.
- 제품 핵심 가치(링크 하나로 함께 쓰는 게시판)를 충족하려면 공용 저장소가 필요하다.

## 결정
- 클라이언트 데이터 계층(`src/data/mock.js`)을 **공용 API 우선** 구조로 변경한다.
  - 1순위: `/api/shared-data` 호출
  - 개발/프리뷰 런타임 실패/미구성 시: localStorage 자동 폴백
  - 운영(프로덕션) 런타임 실패/미구성 시: 로컬 폴백을 허용하지 않고 쓰기 작업을 차단
  - 개발/프리뷰 폴백 중 생성한 변경은 outbox(`friends_tell_pending_mutations_v1`)에 저장하고, API 복구 시 자동 재동기화한다.
- 서버리스 API(`api/shared-data.js`)를 추가한다.
  - 저장소: Upstash Redis (`UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`)
  - 데이터 키: `friends_tell:shared_db:v1` (백업 키: `friends_tell:shared_db:v1:backup`)
  - 지원 연산: `createHome`, `updateHome`, `addPost`, `increaseViews`, `addComment`, 전체 스냅샷 조회
- 키 복구 전략:
  - 읽기 시 `v1` + 레거시 키(`friends_tell:shared_db`, `friends_tell:shared_db:v0`) + 백업 키를 병합해 self-healing 한다.
  - 빈 스냅샷으로 기존 데이터가 덮어써지는 경우를 방지한다.
- 닉네임 저장은 기존처럼 sessionStorage를 유지한다(개인 입력 편의 목적).

## 결과
- 장점:
  - 공용 DB 구성 시 사용자/기기 간 동일 홈·게시판·글·댓글을 볼 수 있다.
  - 공용 DB 장애 시에도 localStorage 폴백으로 최소 기능이 유지된다.
- 트레이드오프:
  - 로그인/권한 체계가 없으므로 강한 동시성 제어와 정교한 충돌 해결은 제한적이다.
  - 배포 환경에 Redis 연동(환경변수)이 필요하다.

## 롤백
- 코드 롤백: ADR 002 적용 커밋 revert.
- 운영 롤백(일시): Vercel에서 `UPSTASH_REDIS_*` 환경변수를 제거하면 운영 런타임에서는 쓰기 차단 모드가 되며, 개발/프리뷰에서만 localStorage 폴백 모드로 동작한다.
- 데이터 키 호환: `friends_tell:shared_db:v1` 스키마 변경 시 `v2` 키로 분리해 점진 이전한다.

## 참고
- `src/data/mock.js`
- `api/shared-data.js`
- `docs/runbooks/DEPLOY.md`

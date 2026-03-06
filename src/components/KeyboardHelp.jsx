import './KeyboardHelp.css'

export default function KeyboardHelp() {
  return (
    <footer className="keyboard-help hitel-footer-bar" role="status" aria-label="키보드 사용법">
      <span>1~5: 메뉴 선택</span>
      <span>N: 새 프렌즈홈</span>
      <span>Enter: 확인</span>
      <span>↑↓: 메뉴 이동</span>
      <span>Tab: 포커스 이동</span>
      <span>Esc: 닫기</span>
    </footer>
  )
}

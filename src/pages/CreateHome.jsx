import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { createHome, getHomes, DEFAULT_BOARD_PASSWORD } from '../data/mock'
import './CreateHome.css'

export default function CreateHome() {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    const t = title.trim()
    if (!t) {
      setError('프렌즈홈 제목을 입력하세요.')
      return
    }
    const home = createHome({ title: t })
    navigate(`/home/${home.id}`, { replace: true })
  }

  const homes = getHomes()
  const firstHomeId = homes.length > 0 ? homes[0].id : null

  return (
    <div className="create-home hitel-card">
      <h2 className="hitel-section-basic">[ 새 프렌즈홈 만들기 ]</h2>
      <p className="create-home-desc">친구와 함께 쓸 게시판의 이름을 정해주세요.</p>
      <p className="create-home-pw-hint">4·5번 게시판 초기 비밀번호: <strong>{DEFAULT_BOARD_PASSWORD}</strong> (생성 후 메인 화면 설정에서 변경 가능)</p>
      <form onSubmit={handleSubmit} className="hitel-write-form">
        <label>
          <span>프렌즈홈 제목</span>
          <input
            type="text"
            className="hitel-input"
            placeholder="예: 우리 동네 모임"
            value={title}
            onChange={(e) => { setTitle(e.target.value); setError('') }}
            maxLength={50}
            autoFocus
            aria-label="프렌즈홈 제목"
          />
        </label>
        {error && <p className="hitel-error">{error}</p>}
        <div className="hitel-form-actions">
          <button type="submit" className="hitel-btn">[ 만들기 ]</button>
          {firstHomeId && (
            <button
              type="button"
              className="hitel-btn hitel-btn-secondary"
              onClick={() => navigate(`/home/${firstHomeId}`)}
            >
              [ 취소 ]
            </button>
          )}
        </div>
      </form>
      {homes.length > 0 && (
        <p className="hitel-footer">
          <Link to="/" className="hitel-link">◀ 메인으로</Link>
        </p>
      )}
    </div>
  )
}

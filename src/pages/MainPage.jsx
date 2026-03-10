import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getHomes } from '../data/mock'
import { formatRelativeTime } from '../utils/formatRelativeTime'
import './MainPage.css'

export default function MainPage() {
  const [homes, setHomes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    const loadHomes = async () => {
      try {
        const list = await getHomes()
        if (mounted) setHomes(list)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    const handleDataUpdated = () => {
      loadHomes()
    }

    loadHomes()
    window.addEventListener('friends-data-updated', handleDataUpdated)
    return () => {
      mounted = false
      window.removeEventListener('friends-data-updated', handleDataUpdated)
    }
  }, [])

  const openAuthPanel = (mode) => {
    window.dispatchEvent(new CustomEvent('friends-auth-open-request', { detail: { mode } }))
  }

  return (
    <>
      <section className="main-page-intro hitel-card">
        <h1 className="hitel-section-basic">[ 프렌즈텔 메인 ]</h1>
        <p>
          프렌즈텔은 <strong>친구와 함께 쓰는 게시판</strong>입니다. 프렌즈홈을 만들고 링크를 공유하면
          공지사항, 자유게시판, 소식, 임시 게시판을 함께 쓸 수 있어요.
        </p>
        <p className="main-page-intro-sub">
          키보드 1~5, N, Enter, ↑↓, Tab, Esc 단축키도 그대로 사용할 수 있습니다.
        </p>
      </section>

      <section className="main-page-auth hitel-card" aria-label="로그인 및 회원가입">
        <h2 className="hitel-section-community">[ 로그인 / 회원가입 ]</h2>
        <p className="main-page-auth-desc">
          로그인하면 글/댓글 작성 시 계정 닉네임이 자동으로 적용됩니다.
        </p>
        <div className="main-page-auth-actions">
          <button type="button" className="hitel-btn" onClick={() => openAuthPanel('login')}>
            로그인
          </button>
          <button
            type="button"
            className="hitel-btn hitel-btn-secondary"
            onClick={() => openAuthPanel('signup')}
          >
            회원가입
          </button>
        </div>
      </section>

      <section className="main-page-homes hitel-card" aria-label="생성된 프렌즈홈 목록">
        <h2 className="hitel-section-basic">[ 생성된 프렌즈홈 ]</h2>
        {loading ? (
          <p className="hitel-hint">공용 프렌즈홈 목록을 불러오는 중...</p>
        ) : homes.length === 0 ? (
          <p className="hitel-hint">아직 생성된 프렌즈홈이 없습니다. 첫 홈을 만들어 보세요.</p>
        ) : (
          <ul className="main-page-home-list">
            {homes.map((home) => (
              <li key={home.id} className="main-page-home-item">
                <Link to={`/home/${home.id}`} className="main-page-home-link">
                  <span className="main-page-home-title">{home.title}</span>
                  <span className="main-page-home-time">{formatRelativeTime(home.createdAt)}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
        <div className="main-page-home-actions">
          <Link to="/create" className="hitel-btn">
            + 새 프렌즈홈 만들기
          </Link>
        </div>
      </section>
    </>
  )
}

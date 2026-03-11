import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getHomes } from '../data/mock'
import { formatRelativeTime } from '../utils/formatRelativeTime'
import './MainPage.css'

const GUIDE_HOME_EXAMPLES = [
  {
    title: '분당IT 모임 프렌즈홈',
    summary: '스터디/모임 멤버가 공지와 회고를 함께 적는 형태',
    samplePosts: [
      '공지사항: 3월 정기 모임 일정 공유',
      '자유게시판: 이번 주 업무 자동화 꿀팁',
      '소식 게시판: 새 AI 도구 테스트 후기',
    ],
  },
  {
    title: '가족 톡방 프렌즈홈',
    summary: '가족 일정과 안부를 게시판으로 정리하는 형태',
    samplePosts: [
      '공지사항: 이번 주말 가족 모임 장소',
      '자유게시판: 오늘 반찬 추천 받아요',
      '임시 게시판: 급한 전달사항 빠르게 공유',
    ],
  },
  {
    title: '프로젝트 팀 프렌즈홈',
    summary: '작은 팀이 진행 상황과 이슈를 가볍게 소통하는 형태',
    samplePosts: [
      '공지사항: 이번 스프린트 목표 정리',
      '소식 게시판: 기능 배포 완료 공유',
      '자유게시판: 개선 아이디어 투표',
    ],
  },
]

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
        <h1 className="hitel-section-basic">[ 프렌즈텔 소개 ]</h1>
        <p>
          프렌즈텔은 <strong>친구와 함께 쓰는 게시판</strong>입니다. 프렌즈홈을 만들고 링크를 공유하면
          공지사항, 자유게시판, 소식, 임시 게시판을 함께 쓸 수 있어요.
        </p>
        <p className="main-page-intro-sub">
          키보드 1~5, N, Enter, ↑↓, Tab, Esc 단축키도 그대로 사용할 수 있습니다.
        </p>
        <div className="main-page-guide-home">
          <h2 className="hitel-section-community">[ 프렌즈홈 예시 ]</h2>
          <p className="main-page-guide-home-desc">
            프렌즈홈은 한 링크 안에서 공지, 자유 대화, 소식을 함께 운영하는 공간입니다.
          </p>
          <ul className="main-page-guide-home-list">
            {GUIDE_HOME_EXAMPLES.map((example) => (
              <li key={example.title} className="main-page-guide-home-item">
                <h3 className="main-page-guide-home-title">{example.title}</h3>
                <p className="main-page-guide-home-summary">{example.summary}</p>
                <ul className="main-page-guide-home-post-list">
                  {example.samplePosts.map((post) => (
                    <li key={post} className="main-page-guide-home-post-item">
                      {post}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
          <p className="main-page-guide-home-tip">
            같은 방식으로 새 프렌즈홈을 만들고 링크를 공유하면 바로 우리만의 게시판을 시작할 수 있어요.
          </p>
        </div>
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

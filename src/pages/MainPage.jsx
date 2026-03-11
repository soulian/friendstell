import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { addComment, addPost, createHome, getHomes } from '../data/mock'
import { formatRelativeTime } from '../utils/formatRelativeTime'
import './MainPage.css'

const GUIDE_HOME_TITLES = [
  '왁자지껄 가상 캐릭터 프렌즈홈',
  '캐릭터 놀이터 프렌즈홈',
  '북적북적 캐릭터 마을 프렌즈홈',
]

const GUIDE_POSTS = [
  {
    boardId: 'free',
    title: '오늘 첫 방문한 친구들, 출석체크 해요!',
    body: '도토리, 하늘곰, 번개고양이, 멜론토끼가 모여서 인사 중이에요. 한 줄씩 남기고 가요!',
    author: '도토리',
  },
  {
    boardId: 'news',
    title: '오늘의 소식: 캐릭터 캠프파이어 오픈',
    body: '저녁 8시에 중앙 광장에서 수다 타임이 열려요. 자유롭게 근황 공유해요.',
    author: '하늘곰',
  },
  {
    boardId: 'temp',
    title: '임시 수다방: 오늘 제일 웃긴 일은?',
    body: '짧게 한 줄 토크! 답글로 이어가면 더 재밌어요.',
    author: '번개고양이',
  },
]

const GUIDE_COMMENTS = [
  { postIndex: 0, boardId: 'free', author: '멜론토끼', body: '출석! 오늘은 레트로 감성 배경이 너무 좋아요.' },
  { postIndex: 0, boardId: 'free', author: '밤비여우', body: '저도 왔어요. 다 같이 글 이어서 써요!' },
  { postIndex: 1, boardId: 'news', author: '우주다람쥐', body: '캠프파이어 전에 자유게시판에서 워밍업 수다 갑시다.' },
  { postIndex: 2, boardId: 'temp', author: '하늘곰', body: '점심에 떡볶이 먹다가 웃음 터진 썰 풀어볼게요.' },
]

function pickRandomGuideTitle() {
  return GUIDE_HOME_TITLES[Math.floor(Math.random() * GUIDE_HOME_TITLES.length)]
}

export default function MainPage() {
  const [homes, setHomes] = useState([])
  const [loading, setLoading] = useState(true)
  const [creatingGuideHome, setCreatingGuideHome] = useState(false)
  const [guideHome, setGuideHome] = useState(null)
  const [guideHomeError, setGuideHomeError] = useState('')

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

  const createGuideHome = async () => {
    if (creatingGuideHome) return
    setCreatingGuideHome(true)
    setGuideHome(null)
    setGuideHomeError('')
    try {
      const home = await createHome({ title: pickRandomGuideTitle() })
      const createdPosts = []
      for (const post of GUIDE_POSTS) {
        const createdPost = await addPost(home.id, post.boardId, {
          title: post.title,
          body: post.body,
          author: post.author,
        })
        createdPosts.push(createdPost)
      }
      for (const comment of GUIDE_COMMENTS) {
        const targetPost = createdPosts[comment.postIndex]
        if (!targetPost) continue
        await addComment(home.id, comment.boardId, targetPost.id, {
          body: comment.body,
          author: comment.author,
        })
      }
      const updatedHomes = await getHomes()
      setHomes(updatedHomes)
      setGuideHome(home)
    } catch {
      setGuideHomeError('샘플 프렌즈홈 생성에 실패했습니다. 잠시 후 다시 시도해 주세요.')
    } finally {
      setCreatingGuideHome(false)
    }
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
        <div className="main-page-guide-home" aria-live="polite">
          <h2 className="hitel-section-community">[ 안내용 샘플 프렌즈홈 ]</h2>
          <p className="main-page-guide-home-desc">
            가상 캐릭터 여러 명이 글과 댓글로 왁자지껄 대화하는 예시 홈을 자동으로 만들어 드립니다.
          </p>
          <button type="button" className="hitel-btn" onClick={createGuideHome} disabled={creatingGuideHome}>
            {creatingGuideHome ? '샘플 프렌즈홈 생성 중...' : '왁자지껄 샘플 프렌즈홈 만들기'}
          </button>
          {guideHome ? (
            <p className="main-page-guide-home-message">
              생성 완료: <strong>{guideHome.title}</strong>{' '}
              <Link to={`/home/${guideHome.id}`} className="main-page-guide-home-link">
                바로 입장하기
              </Link>
            </p>
          ) : null}
          {guideHomeError ? (
            <p className="main-page-guide-home-error" role="alert">
              {guideHomeError}
            </p>
          ) : null}
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

import { useState, useEffect, useCallback } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  getAuthSession,
  getPost,
  getComments,
  addComment,
  increaseViews,
  getHome,
  getSharedWriteErrorMessage,
  getStoredNickname,
  isSharedWriteError,
  setStoredNickname,
} from '../data/mock'
import AuthorName from '../components/AuthorName'
import './PostView.css'

export default function PostView() {
  const { homeId, boardId, postId } = useParams()
  const [boardName, setBoardName] = useState('')
  const [post, setPost] = useState(null)
  const [comments, setComments] = useState([])
  const [commentText, setCommentText] = useState('')
  const [commentNickname, setCommentNickname] = useState('')
  const [authSession, setAuthSession] = useState(() => getAuthSession())
  const [commentError, setCommentError] = useState('')
  const [loading, setLoading] = useState(true)
  const [submittingComment, setSubmittingComment] = useState(false)

  useEffect(() => {
    setCommentNickname(getStoredNickname())
  }, [])

  useEffect(() => {
    const handleAuthUpdated = () => {
      const nextAuth = getAuthSession()
      setAuthSession(nextAuth)
      setCommentNickname(nextAuth?.nickname || getStoredNickname())
    }
    window.addEventListener('friends-auth-updated', handleAuthUpdated)
    return () => window.removeEventListener('friends-auth-updated', handleAuthUpdated)
  }, [])

  const resolveBoardName = useCallback(async () => {
    const home = await getHome(homeId)
    if (boardId === 'news') return home ? `${home.title} 소식` : '소식'
    if (boardId === 'notice') return '공지사항'
    if (boardId === 'free') return '자유게시판'
    if (boardId === 'temp') return '임시 게시판'
    return boardId
  }, [homeId, boardId])

  const loadPost = useCallback(async (options = {}) => {
    const { withViewIncrease = false } = options
    setLoading(true)

    const p = await getPost(homeId, boardId, postId)
    if (p && withViewIncrease) {
      await increaseViews(homeId, boardId, postId)
    }

    const [nextPost, nextComments, nextBoardName] = await Promise.all([
      getPost(homeId, boardId, postId),
      getComments(homeId, boardId, postId),
      resolveBoardName(),
    ])

    setPost(nextPost)
    setComments(nextComments)
    setBoardName(nextBoardName)
    setLoading(false)
  }, [homeId, boardId, postId, resolveBoardName])

  useEffect(() => {
    loadPost({ withViewIncrease: true })
  }, [loadPost])

  useEffect(() => {
    const handleDataUpdated = () => {
      loadPost()
    }
    window.addEventListener('friends-data-updated', handleDataUpdated)
    return () => window.removeEventListener('friends-data-updated', handleDataUpdated)
  }, [loadPost])

  const handleSubmitComment = async (e) => {
    e.preventDefault()
    if (!commentText.trim()) return
    setCommentError('')
    const author = authSession?.nickname || commentNickname.trim() || '익명'
    setSubmittingComment(true)
    try {
      setStoredNickname(author)
      await addComment(homeId, boardId, postId, {
        body: commentText.trim(),
        author,
        authorMeta: authSession
          ? {
            userId: authSession.userId,
            isVerified: true,
          }
          : null,
      })
      const nextComments = await getComments(homeId, boardId, postId)
      setComments(nextComments)
      setCommentText('')
    } catch (err) {
      if (isSharedWriteError(err)) {
        setCommentError(getSharedWriteErrorMessage())
      } else {
        setCommentError('댓글 작성에 실패했습니다. 잠시 후 다시 시도해 주세요.')
      }
    } finally {
      setSubmittingComment(false)
    }
  }

  if (loading) {
    return (
      <div className="hitel-card hitel-post-missing">
        <p>게시글을 불러오는 중...</p>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="hitel-card hitel-post-missing">
        <p>글이 없거나 삭제되었습니다.</p>
        <Link to={`/home/${homeId}/board/${boardId}`}>[ 목록으로 ]</Link>
      </div>
    )
  }

  return (
    <div className="post-view hitel-card">
      <nav className="hitel-nav">
        <Link to={`/home/${homeId}/board/${boardId}`}>◀ 목록</Link>
        <span># {boardName}</span>
      </nav>
      <article className="hitel-article">
        <h1 className="hitel-post-title">{post.title}</h1>
        <div className="hitel-post-meta">
          <span><AuthorName name={post.author} verified={Boolean(post.authorVerified)} /></span>
          <span>조회 {post.views || 0}</span>
        </div>
        <div className="hitel-post-body">{post.body}</div>
      </article>

      <section className="hitel-comments">
        <h3 className="hitel-title">[ 댓글 ] ({comments.length})</h3>
        <ul className="hitel-comment-list">
          {comments.map((c) => (
            <li key={c.id} className="hitel-comment-item">
              <span className="hitel-comment-author">
                <AuthorName name={c.author} verified={Boolean(c.authorVerified)} />
              </span>
              <span className="hitel-comment-body">{c.body}</span>
            </li>
          ))}
        </ul>
        <form onSubmit={handleSubmitComment} className="hitel-comment-form">
          <label>
            <span>닉네임</span>
            <input
              type="text"
              className="hitel-input"
              placeholder={authSession ? '로그인 닉네임 자동 사용' : '닉네임 (미입력 시 익명)'}
              value={commentNickname}
              onChange={(e) => {
                setCommentNickname(e.target.value)
                setCommentError('')
              }}
              maxLength={20}
              disabled={submittingComment || Boolean(authSession)}
            />
          </label>
          <textarea
            className="hitel-textarea"
            placeholder="댓글을 입력하세요..."
            value={commentText}
            onChange={(e) => {
              setCommentText(e.target.value)
              setCommentError('')
            }}
            rows={3}
            disabled={submittingComment}
          />
          {commentError && <p className="hitel-error">{commentError}</p>}
          <button type="submit" className="hitel-btn" disabled={submittingComment}>
            {submittingComment ? '[ 작성중... ]' : '[ 댓글 쓰기 ]'}
          </button>
        </form>
      </section>
    </div>
  )
}

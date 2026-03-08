import { useState, useEffect, useCallback } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  getPost,
  getComments,
  addComment,
  increaseViews,
  getHome,
  getStoredNickname,
  setStoredNickname,
} from '../data/mock'
import './PostView.css'

export default function PostView() {
  const { homeId, boardId, postId } = useParams()
  const [boardName, setBoardName] = useState('')
  const [post, setPost] = useState(null)
  const [comments, setComments] = useState([])
  const [commentText, setCommentText] = useState('')
  const [commentNickname, setCommentNickname] = useState('')
  const [loading, setLoading] = useState(true)
  const [submittingComment, setSubmittingComment] = useState(false)

  useEffect(() => {
    setCommentNickname(getStoredNickname())
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
    const author = commentNickname.trim() || '익명'
    setSubmittingComment(true)
    try {
      setStoredNickname(author)
      await addComment(homeId, boardId, postId, { body: commentText.trim(), author })
      const nextComments = await getComments(homeId, boardId, postId)
      setComments(nextComments)
      setCommentText('')
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
          <span>{post.author}</span>
          <span>조회 {post.views || 0}</span>
        </div>
        <div className="hitel-post-body">{post.body}</div>
      </article>

      <section className="hitel-comments">
        <h3 className="hitel-title">[ 댓글 ] ({comments.length})</h3>
        <form onSubmit={handleSubmitComment} className="hitel-comment-form">
          <label>
            <span>닉네임</span>
            <input
              type="text"
              className="hitel-input"
              placeholder="닉네임 (미입력 시 익명)"
              value={commentNickname}
              onChange={(e) => setCommentNickname(e.target.value)}
              maxLength={20}
              disabled={submittingComment}
            />
          </label>
          <textarea
            className="hitel-textarea"
            placeholder="댓글을 입력하세요..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            rows={3}
            disabled={submittingComment}
          />
          <button type="submit" className="hitel-btn" disabled={submittingComment}>
            {submittingComment ? '[ 작성중... ]' : '[ 댓글 쓰기 ]'}
          </button>
        </form>
        <ul className="hitel-comment-list">
          {comments.map((c) => (
            <li key={c.id} className="hitel-comment-item">
              <span className="hitel-comment-author">{c.author}</span>
              <span className="hitel-comment-body">{c.body}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

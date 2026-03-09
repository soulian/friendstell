import './AuthorName.css'

export default function AuthorName({ name, verified = false }) {
  return (
    <span className="author-name-inline">
      <span>{name}</span>
      {verified && (
        <span className="author-verified-icon" aria-label="인증 사용자" title="인증 사용자">
          ✓
        </span>
      )}
    </span>
  )
}

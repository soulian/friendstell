export function formatRelativeTime(createdAt) {
  const createdAtMs = Number(createdAt)
  if (!Number.isFinite(createdAtMs)) return ''

  const diffMs = Math.max(0, Date.now() - createdAtMs)
  const minuteMs = 60 * 1000
  const hourMs = 60 * minuteMs
  const dayMs = 24 * hourMs
  const monthMs = 30 * dayMs
  const yearMs = 365 * dayMs

  if (diffMs < hourMs) {
    const minutes = Math.max(1, Math.floor(diffMs / minuteMs))
    return `${minutes}분 전`
  }
  if (diffMs < dayMs) {
    const hours = Math.floor(diffMs / hourMs)
    return `${hours}시간 전`
  }
  if (diffMs < monthMs) {
    const days = Math.floor(diffMs / dayMs)
    return `${days}일 전`
  }
  if (diffMs < yearMs) {
    const months = Math.floor(diffMs / monthMs)
    return `${months}달 전`
  }

  const years = Math.floor(diffMs / yearMs)
  return `${years}년 전`
}

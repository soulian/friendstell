import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { getHome } from './data/mock'

const DEFAULT_TITLE = '프렌즈텔 | 우리만의 프렌즈홈 게시판을 만들고 친구와 지금 바로 대화해요'
const DEFAULT_DESC = '프렌즈텔에서 우리 모임 전용 프렌즈홈을 만들고 링크 하나로 친구를 초대하세요. 공지, 자유글, 소식, 임시 게시판을 함께 쓰며 캠핑장 미니룸 활동까지 한눈에 확인할 수 있어요.'
const DEFAULT_IMAGE_PATH = '/api/og-image'

export function usePageMeta() {
  const { pathname } = useLocation()

  useEffect(() => {
    const descEl = document.querySelector('meta[name="description"]')
    const ogTitle = document.querySelector('meta[property="og:title"]')
    const ogDesc = document.querySelector('meta[property="og:description"]')
    const ogUrl = document.querySelector('meta[property="og:url"]')
    const ogImage = document.querySelector('meta[property="og:image"]')
    let cancelled = false

    const applyMeta = async () => {
      const match = pathname.match(/^\/home\/([^/]+)/)
      const homeId = match?.[1]
      const home = homeId ? await getHome(homeId) : null
      if (cancelled) return

      const title = home
        ? `${home.title} 프렌즈홈 | 친구들과 함께 쓰는 게시판에 지금 참여해요`
        : DEFAULT_TITLE
      const description = home
        ? `${home.title} 프렌즈홈에 초대합니다. 링크를 열면 공지, 자유글, 소식, 임시 게시판을 바로 함께 쓸 수 있어요. 지금 접속해 글과 댓글을 남기고 미니룸 분위기도 같이 키워보세요.`
        : DEFAULT_DESC

      document.title = title
      if (descEl) descEl.setAttribute('content', description)
      if (ogTitle) ogTitle.setAttribute('content', title)
      if (ogDesc) ogDesc.setAttribute('content', description)
      if (ogUrl && typeof window !== 'undefined') {
        ogUrl.setAttribute('content', window.location.origin + pathname)
      }
      if (ogImage && typeof window !== 'undefined') {
        const imagePath = homeId
          ? `/api/og-image?homeId=${encodeURIComponent(homeId)}`
          : DEFAULT_IMAGE_PATH
        ogImage.setAttribute('content', window.location.origin + imagePath)
      }
    }

    applyMeta()

    return () => {
      cancelled = true
      document.title = DEFAULT_TITLE
      if (descEl) descEl.setAttribute('content', DEFAULT_DESC)
      if (ogTitle) ogTitle.setAttribute('content', DEFAULT_TITLE)
      if (ogDesc) ogDesc.setAttribute('content', DEFAULT_DESC)
      if (ogImage && typeof window !== 'undefined') {
        ogImage.setAttribute('content', window.location.origin + DEFAULT_IMAGE_PATH)
      }
    }
  }, [pathname])
}

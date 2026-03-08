import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { getHome } from './data/mock'

const DEFAULT_TITLE = '프렌즈텔 - 친구와 함께 쓰는 게시판'
const DEFAULT_DESC = '친구와 함께 쓰는 게시판을 만들고, 링크를 공유해 보세요.'

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

      const title = home ? `프렌즈텔 - ${home.title}` : DEFAULT_TITLE
      const description = home
        ? `${home.title} - 친구와 함께 쓰는 프렌즈텔 게시판`
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
          : '/api/og-image'
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
      if (ogImage) ogImage.setAttribute('content', '')
    }
  }, [pathname])
}

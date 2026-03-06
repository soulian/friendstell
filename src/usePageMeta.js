import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { getHome } from './data/mock'

const DEFAULT_TITLE = '프렌즈텔 - 친구와 함께 쓰는 게시판'
const DEFAULT_DESC = '친구와 함께 쓰는 게시판을 만들고, 링크를 공유해 보세요.'

export function usePageMeta() {
  const { pathname } = useLocation()

  useEffect(() => {
    const match = pathname.match(/^\/home\/([^/]+)/)
    const homeId = match?.[1]
    const home = homeId ? getHome(homeId) : null

    const title = home ? `프렌즈텔 - ${home.title}` : DEFAULT_TITLE
    const description = home
      ? `${home.title} - 친구와 함께 쓰는 프렌즈텔 게시판`
      : DEFAULT_DESC

    document.title = title

    const descEl = document.querySelector('meta[name="description"]')
    if (descEl) descEl.setAttribute('content', description)

    const ogTitle = document.querySelector('meta[property="og:title"]')
    if (ogTitle) ogTitle.setAttribute('content', title)
    const ogDesc = document.querySelector('meta[property="og:description"]')
    if (ogDesc) ogDesc.setAttribute('content', description)
    const ogUrl = document.querySelector('meta[property="og:url"]')
    if (ogUrl && typeof window !== 'undefined') {
      ogUrl.setAttribute('content', window.location.origin + pathname)
    }

    return () => {
      document.title = DEFAULT_TITLE
      if (descEl) descEl.setAttribute('content', DEFAULT_DESC)
      if (ogTitle) ogTitle.setAttribute('content', DEFAULT_TITLE)
      if (ogDesc) ogDesc.setAttribute('content', DEFAULT_DESC)
    }
  }, [pathname])
}

import { useEffect, useRef, useState } from "react"

const ACTIVATION_THRESHOLD_PX = 50
const MIN_SCROLL_UP_THRESHOLD_PX = 10

export function useAutoScroll(dependencies: React.DependencyList) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const previousScrollTop = useRef<number | null>(null)
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true)

  function scrollToBottom() {
    const container = containerRef.current
    if (!container) return
    container.scrollTop = container.scrollHeight
  }

  function handleScroll() {
    const container = containerRef.current
    if (!container) return

    const { scrollTop, scrollHeight, clientHeight } = container
    const distanceFromBottom = Math.abs(scrollHeight - scrollTop - clientHeight)
    const priorTop = previousScrollTop.current
    const isScrollingUp = priorTop !== null ? scrollTop < priorTop : false
    const scrollUpDistance = priorTop !== null ? priorTop - scrollTop : 0
    const isDeliberateScrollUp =
      isScrollingUp && scrollUpDistance > MIN_SCROLL_UP_THRESHOLD_PX

    if (isDeliberateScrollUp) {
      setShouldAutoScroll(false)
    } else {
      setShouldAutoScroll(distanceFromBottom < ACTIVATION_THRESHOLD_PX)
    }

    previousScrollTop.current = scrollTop
  }

  function handleTouchStart() {
    setShouldAutoScroll(false)
  }

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    previousScrollTop.current = container.scrollTop
  }, [])

  useEffect(() => {
    if (!shouldAutoScroll) return
    scrollToBottom()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- caller supplies scroll triggers
  }, dependencies)

  useEffect(() => {
    const container = containerRef.current
    const content = container?.firstElementChild
    if (!content) return

    const observer = new ResizeObserver(() => {
      if (!shouldAutoScroll) return
      scrollToBottom()
    })
    observer.observe(content)
    return () => observer.disconnect()
  }, [shouldAutoScroll])

  return {
    containerRef,
    scrollToBottom,
    handleScroll,
    shouldAutoScroll,
    handleTouchStart,
  }
}

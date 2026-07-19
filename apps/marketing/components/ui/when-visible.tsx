"use client"

import { type ReactNode, useEffect, useRef, useState } from "react"

/** Mount children only once the container nears the viewport (e.g. Rive canvases). */
export function WhenVisible({
  children,
  fallback = null,
  rootMargin = "200px",
  className,
}: {
  children: ReactNode
  fallback?: ReactNode
  rootMargin?: string
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (show) return

    const el = ref.current
    if (!el || !("IntersectionObserver" in window)) {
      setShow(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return
        observer.disconnect()
        setShow(true)
      },
      { rootMargin }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [rootMargin, show])

  return (
    <div ref={ref} className={className}>
      {show ? children : fallback}
    </div>
  )
}

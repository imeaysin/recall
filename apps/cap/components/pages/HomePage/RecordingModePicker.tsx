"use client"

import { AnimatePresence, motion } from "framer-motion"
import { useCallback, useEffect, useRef, useState } from "react"
import { InstantIcon, ScreenshotIcon, StudioIcon } from "./modeIcons"

type ModeId = "instant" | "studio" | "screenshot"

interface ModeOption {
  id: ModeId
  title: string
  description: string
  icon: (props: { className?: string }) => React.JSX.Element
}

const modes: ModeOption[] = [
  {
    id: "instant",
    title: "Instant",
    description:
      "Share instantly with a link. Your recording uploads as you record, so you can share it immediately when you're done.",
    icon: InstantIcon,
  },
  {
    id: "studio",
    title: "Studio",
    description:
      "Record locally in the highest quality for editing later. Perfect for creating polished content with effects and transitions.",
    icon: StudioIcon,
  },
  {
    id: "screenshot",
    title: "Screenshot",
    description:
      "Capture and annotate screenshots instantly. Great for quick captures, bug reports, and visual communication.",
    icon: ScreenshotIcon,
  },
]

const AUTO_CYCLE_INTERVAL = 3500

const PILL_GAP = { base: 16, md: 20 }
const PILL_PADDING = { base: 12, md: 14 }
const CIRCLE_SIZE = { base: 72, md: 88 }

const RecordingModePicker = () => {
  const [selected, setSelected] = useState<ModeId>("instant")
  const [userInteracted, setUserInteracted] = useState(false)
  const [isInView, setIsInView] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleSelect = useCallback((id: ModeId) => {
    setUserInteracted(true)
    setSelected(id)
  }, [])

  useEffect(() => {
    if (userInteracted || !isInView) return

    const interval = setInterval(() => {
      setSelected((prev) => {
        const currentIndex = modes.findIndex((m) => m.id === prev)
        const nextMode = modes[(currentIndex + 1) % modes.length]
        return nextMode ? nextMode.id : prev
      })
    }, AUTO_CYCLE_INTERVAL)

    return () => clearInterval(interval)
  }, [userInteracted, isInView])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry) {
          setIsInView(entry.isIntersecting)
        }
      },
      { threshold: 0.3 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const selectedMode = modes.find((m) => m.id === selected)

  return (
    <div ref={containerRef} className="mx-auto w-full max-w-[1000px] px-5">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6 }}
        className="mb-8 text-center md:mb-14"
      >
        <span className="text-gray-9 mb-3 inline-block text-xs font-semibold tracking-[0.2em] uppercase">
          3 Modes
        </span>
        <h2 className="text-gray-12 mb-3 text-3xl font-medium md:text-4xl">
          One app, every workflow
        </h2>
        <p className="text-gray-10 mx-auto max-w-[600px] text-base md:text-lg">
          Whether you need speed, studio quality, or a quick screenshot — Cap
          has a mode for it.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="flex flex-col items-center"
      >
        <div className="relative">
          <div
            className="border-gray-5 bg-gray-3 absolute top-0 right-0 left-0 rounded-full border md:hidden"
            style={{
              height: `${CIRCLE_SIZE.base + PILL_PADDING.base * 2}px`,
            }}
          />
          <div
            className="border-gray-5 bg-gray-3 absolute top-0 right-0 left-0 hidden rounded-full border md:block"
            style={{
              height: `${CIRCLE_SIZE.md + PILL_PADDING.md * 2}px`,
            }}
          />

          <div
            className="relative grid grid-cols-3 md:hidden"
            style={{
              gap: `${PILL_GAP.base}px`,
              padding: `${PILL_PADDING.base}px`,
            }}
          >
            {modes.map((mode) => {
              const isSelected = selected === mode.id

              return (
                <div
                  key={mode.id}
                  className="flex flex-col items-center"
                  style={{ width: `${CIRCLE_SIZE.base}px` }}
                >
                  <motion.button
                    type="button"
                    onClick={() => handleSelect(mode.id)}
                    className="relative flex cursor-pointer items-center justify-center rounded-full"
                    style={{
                      width: `${CIRCLE_SIZE.base}px`,
                      height: `${CIRCLE_SIZE.base}px`,
                    }}
                    animate={{
                      backgroundColor: isSelected
                        ? "var(--gray-7)"
                        : "var(--gray-3)",
                    }}
                    whileHover={{
                      backgroundColor: "var(--gray-7)",
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    {isSelected && (
                      <motion.div
                        className="absolute inset-0 rounded-full"
                        layoutId="modeRing"
                        style={{
                          boxShadow:
                            "0 0 0 3px var(--gray-1), 0 0 0 5px var(--blue-9)",
                        }}
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 30,
                        }}
                      />
                    )}
                    <mode.icon
                      className={`size-7 transition-colors duration-200 ${
                        isSelected ? "text-gray-12" : "text-gray-10"
                      }`}
                    />
                  </motion.button>

                  <motion.span
                    className="mt-3 cursor-pointer text-sm font-medium whitespace-nowrap"
                    onClick={() => handleSelect(mode.id)}
                    animate={{
                      color: isSelected ? "var(--gray-12)" : "var(--gray-9)",
                      opacity: isSelected ? 1 : 0.6,
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    {mode.title}
                  </motion.span>
                </div>
              )
            })}
          </div>

          <div
            className="relative hidden grid-cols-3 md:grid"
            style={{
              gap: `${PILL_GAP.md}px`,
              padding: `${PILL_PADDING.md}px`,
            }}
          >
            {modes.map((mode) => {
              const isSelected = selected === mode.id

              return (
                <div
                  key={mode.id}
                  className="flex flex-col items-center"
                  style={{ width: `${CIRCLE_SIZE.md}px` }}
                >
                  <motion.button
                    type="button"
                    onClick={() => handleSelect(mode.id)}
                    className="relative flex cursor-pointer items-center justify-center rounded-full"
                    style={{
                      width: `${CIRCLE_SIZE.md}px`,
                      height: `${CIRCLE_SIZE.md}px`,
                    }}
                    animate={{
                      backgroundColor: isSelected
                        ? "var(--gray-7)"
                        : "var(--gray-3)",
                    }}
                    whileHover={{
                      backgroundColor: "var(--gray-7)",
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    {isSelected && (
                      <motion.div
                        className="absolute inset-0 rounded-full"
                        layoutId="modeRingMd"
                        style={{
                          boxShadow:
                            "0 0 0 3px var(--gray-1), 0 0 0 5.5px var(--blue-9)",
                        }}
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 30,
                        }}
                      />
                    )}
                    <mode.icon
                      className={`size-8 transition-colors duration-200 ${
                        isSelected ? "text-gray-12" : "text-gray-10"
                      }`}
                    />
                  </motion.button>

                  <motion.span
                    className="mt-4 cursor-pointer text-[15px] font-medium whitespace-nowrap"
                    onClick={() => handleSelect(mode.id)}
                    animate={{
                      color: isSelected ? "var(--gray-12)" : "var(--gray-9)",
                      opacity: isSelected ? 1 : 0.6,
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    {mode.title}
                  </motion.span>
                </div>
              )
            })}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {selectedMode && (
            <motion.div
              key={selectedMode.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="mt-6 max-w-[480px] px-2 text-center md:mt-8"
            >
              <p className="text-gray-10 text-base leading-relaxed">
                {selectedMode.description}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

export default RecordingModePicker

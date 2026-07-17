// million-ignore

"use client"

import { useClickAway } from "@uidotdev/usehooks"
import { motion } from "framer-motion"
import type React from "react"

interface Props {
  setVideoToggled: React.Dispatch<React.SetStateAction<boolean>>
}

const VideoModal = ({ setVideoToggled }: Props) => {
  const ref = useClickAway<HTMLDivElement>(() => setVideoToggled(false))
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[500] flex h-screen w-screen items-center justify-center bg-black/20 backdrop-blur-md"
    >
      <motion.div
        initial={{ filter: "blur(20px)", y: 50 }}
        animate={{ filter: "blur(0px)", y: 0 }}
        exit={{ filter: "blur(20px)", y: 50 }}
        transition={{
          type: "spring",
          bounce: 0.3,
          stiffness: 250,
          damping: 20,
        }}
        ref={ref}
        className="bg-gray-1 w-[calc(100%-20px)] max-w-[960px] overflow-hidden rounded-[16px]"
      >
        <div
          style={{
            position: "relative",
            width: "100%",
            paddingTop: "56.25%",
          }}
        >
          <iframe
            src="https://www.rend.so/embed/10512af0-b922-4efa-8974-f8f14fc1886a?autoplay=1&muted=0&accent=3e63dd"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              border: 0,
            }}
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            title="Cap demo video"
          />
        </div>
      </motion.div>
    </motion.div>
  )
}

export default VideoModal

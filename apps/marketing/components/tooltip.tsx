"use client"

import { cn as classNames } from "@workspace/ui/lib/utils"
import { Kbd, KbdGroup } from "@workspace/ui/components/kbd"
import {
  Tooltip as TooltipRoot,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip"
import type * as React from "react"

const Tooltip = ({
  children,
  content,
  className,
  position = "top",
  kbd,
  disable,
  delayDuration,
}: {
  children: React.ReactNode
  content: string
  className?: string
  position?: "top" | "bottom" | "left" | "right"
  kbd?: string[]
  disable?: boolean
  delayDuration?: number
}) => {
  if (disable) {
    return <>{children}</>
  }
  return (
    <TooltipProvider delay={delayDuration}>
      <TooltipRoot>
        <TooltipTrigger render={children as React.ReactElement} />
        <TooltipContent
          side={position}
          className={classNames("flex items-center gap-2", className)}
          sideOffset={5}
        >
          {content}
          {kbd && (
            <KbdGroup>
              {kbd.map((key, index) => (
                <Kbd key={index.toString()}>{key}</Kbd>
              ))}
            </KbdGroup>
          )}
        </TooltipContent>
      </TooltipRoot>
    </TooltipProvider>
  )
}

export { Tooltip }

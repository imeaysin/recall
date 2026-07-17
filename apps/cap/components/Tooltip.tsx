"use client"

import { cn as classNames } from "@workspace/ui-shadcn/lib/utils"
import {
  Tooltip as TooltipRoot,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@workspace/ui-shadcn/components/tooltip"
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
            <div className="flex items-center gap-1">
              {kbd.map((key, index) => (
                <div
                  className="bg-gray-3 border-gray-4 shadow-gray-3/50 flex size-5 min-w-fit items-center justify-center rounded-md border px-1 shadow-sm"
                  key={index.toString()}
                >
                  <kbd className="text-gray-10 text-[11px]">{key}</kbd>
                </div>
              ))}
            </div>
          )}
        </TooltipContent>
      </TooltipRoot>
    </TooltipProvider>
  )
}

export { Tooltip }

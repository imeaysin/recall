"use client"

import { cn as classNames } from "@workspace/ui-shadcn/lib/utils"

interface BillingToggleOption {
  value: string
  label: string
  badge?: string
}

interface BillingToggleProps {
  options: readonly [BillingToggleOption, BillingToggleOption]
  value: string
  onChange: (value: string) => void
  ariaLabel?: string
}

export const BillingToggle = ({
  options,
  value,
  onChange,
  ariaLabel,
}: BillingToggleProps) => {
  const activeIndex = Math.max(
    0,
    options.findIndex((option) => option.value === value)
  )

  return (
    <fieldset
      aria-label={ariaLabel}
      className="bg-gray-3 relative m-0 grid grid-cols-2 rounded-lg border-0 p-1"
    >
      <div
        aria-hidden
        className="bg-gray-1 border-gray-4 absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-md border shadow-sm transition-transform duration-300 ease-out"
        style={{
          transform: activeIndex === 1 ? "translateX(100%)" : "translateX(0%)",
        }}
      />
      {options.map((option) => {
        const isActive = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(option.value)}
            className={classNames(
              "relative z-10 flex h-8 items-center justify-center gap-1.5 rounded-md px-3 text-sm font-medium transition-colors",
              isActive ? "text-gray-12" : "text-gray-10 hover:text-gray-12"
            )}
          >
            {option.label}
            {option.badge ? (
              <span
                className={classNames(
                  "rounded-full px-1.5 py-0.5 text-[10px] leading-none font-semibold transition-colors",
                  isActive
                    ? "bg-blue-500 text-white"
                    : "bg-blue-500/10 text-blue-600"
                )}
              >
                {option.badge}
              </span>
            ) : null}
          </button>
        )
      })}
    </fieldset>
  )
}

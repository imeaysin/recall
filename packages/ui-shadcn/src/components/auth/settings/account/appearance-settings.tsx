"use client"

import { useTheme } from "@workspace/ui-shadcn/components/theme-provider"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui-shadcn/components/card"
import { Label } from "@workspace/ui-shadcn/components/label"
import {
  RadioGroup,
  RadioGroupItem,
} from "@workspace/ui-shadcn/components/radio-group"
import { cn } from "@workspace/ui-shadcn/lib/utils"

const themes = [
  { label: "System", value: "system" },
  { label: "Light", value: "light" },
  { label: "Dark", value: "dark" },
] as const

type ThemeValue = (typeof themes)[number]["value"]

const themePreviews: Record<ThemeValue, React.ReactNode> = {
  dark: (
    <svg
      aria-hidden
      className="size-full"
      fill="none"
      viewBox="0 0 88 70"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path className="fill-neutral-900" d="M0 0h88v70H0z" />
      <path
        className="fill-neutral-800 shadow-sm"
        d="M10 12a4 4 0 0 1 4-4h74v62H10V12Z"
      />
      <circle className="fill-neutral-600" cx="28" cy="26" r="8" />
      <rect
        className="fill-neutral-700"
        height="4"
        rx="2"
        width="58"
        x="20"
        y="42"
      />
      <rect
        className="fill-neutral-700"
        height="4"
        rx="2"
        width="58"
        x="20"
        y="49"
      />
      <rect
        className="fill-neutral-700"
        height="4"
        rx="2"
        width="29"
        x="20"
        y="56"
      />
    </svg>
  ),
  light: (
    <svg
      aria-hidden
      className="size-full"
      fill="none"
      viewBox="0 0 88 70"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path className="fill-neutral-200" d="M0 0h88v70H0z" />
      <path
        className="fill-white shadow-sm"
        d="M10 12a4 4 0 0 1 4-4h74v62H10V12Z"
      />
      <circle className="fill-neutral-300" cx="28" cy="26" r="8" />
      <rect
        className="fill-neutral-200"
        height="4"
        rx="2"
        width="58"
        x="20"
        y="42"
      />
      <rect
        className="fill-neutral-200"
        height="4"
        rx="2"
        width="58"
        x="20"
        y="49"
      />
      <rect
        className="fill-neutral-200"
        height="4"
        rx="2"
        width="29"
        x="20"
        y="56"
      />
    </svg>
  ),
  system: (
    <svg
      aria-hidden
      className="size-full"
      fill="none"
      viewBox="0 0 88 70"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path className="fill-neutral-200" d="M0 0h44v70H0z" />
      <path className="fill-neutral-900" d="M44 0h44v70H44z" />
      <path
        className="fill-white shadow-sm"
        d="M10 12a4 4 0 0 1 4-4h30v62H10V12Z"
      />
      <circle className="fill-neutral-300" cx="28" cy="26" r="8" />
      <path
        className="fill-neutral-200"
        d="M20 44a2 2 0 0 1 2-2h22v4H22a2 2 0 0 1-2-2ZM20 51a2 2 0 0 1 2-2h22v4H22a2 2 0 0 1-2-2ZM20 58a2 2 0 0 1 2-2h22v4H22a2 2 0 0 1-2-2Z"
      />
      <path
        className="fill-neutral-800 shadow-sm"
        d="M54 12a4 4 0 0 1 4-4h30v62H54V12Z"
      />
      <circle className="fill-neutral-600" cx="72" cy="26" r="8" />
      <path
        className="fill-neutral-700"
        d="M64 44a2 2 0 0 1 2-2h22v4H66a2 2 0 0 1-2-2ZM64 51a2 2 0 0 1 2-2h22v4H66a2 2 0 0 1-2-2ZM64 58a2 2 0 0 1 2-2h22v4H66a2 2 0 0 1-2-2Z"
      />
    </svg>
  ),
}

export function AppearanceSettings() {
  const { theme = "system", setTheme } = useTheme()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Appearance</CardTitle>
        <CardDescription>Choose how Theo looks on your device.</CardDescription>
      </CardHeader>
      <CardContent>
        <RadioGroup
          value={theme}
          onValueChange={setTheme}
          className="flex flex-row gap-4"
        >
          {themes.map((item) => (
            <Label
              key={item.value}
              htmlFor={`theme-${item.value}`}
              className="flex cursor-pointer flex-col items-center gap-2"
            >
              <div
                className={cn(
                  "relative block h-[70px] w-[88px] overflow-hidden rounded-lg shadow-xs transition-all",
                  theme === item.value
                    ? "ring-2 ring-primary ring-offset-1 ring-offset-background"
                    : "opacity-80 hover:opacity-100"
                )}
              >
                {themePreviews[item.value]}
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem
                  id={`theme-${item.value}`}
                  value={item.value}
                  className="sr-only"
                />
                <span
                  className={cn(
                    "text-sm",
                    theme !== item.value && "text-muted-foreground"
                  )}
                >
                  {item.label}
                </span>
              </div>
            </Label>
          ))}
        </RadioGroup>
      </CardContent>
    </Card>
  )
}

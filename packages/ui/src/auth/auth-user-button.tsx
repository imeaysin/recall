"use client"

import { useAuthUiConfig, useSession } from "@workspace/auth/react"
import type { LucideIcon } from "lucide-react"
import { ChevronsUpDown, LogOut, Settings } from "lucide-react"
import { useState } from "react"
import { buttonVariants } from "@workspace/ui/components/button"
import {
  Menu,
  MenuGroup,
  MenuGroupLabel,
  MenuItem,
  MenuPopup,
  MenuSeparator,
  MenuTrigger,
} from "@workspace/ui/components/menu"
import { cn } from "@workspace/ui/lib/utils"
import { AuthUserAvatar } from "./auth-user-avatar"
import { AuthUserView } from "./auth-user-view"

export interface AuthUserButtonMenuItem {
  label: string
  href?: string
  icon?: LucideIcon
  onClick?: () => void
  variant?: "default" | "destructive"
}

export interface AuthUserButtonProps {
  className?: string
  size?: "icon" | "default" | "compact"
  align?: "start" | "center" | "end"
  menuItems?: AuthUserButtonMenuItem[]
  hideSettings?: boolean
  onSignOut?: () => void
}

export function AuthUserButton({
  className,
  size = "default",
  align = "end",
  menuItems = [],
  hideSettings = false,
  onSignOut,
}: AuthUserButtonProps) {
  const config = useAuthUiConfig()
  const { data: session, isPending } = useSession()
  const [open, setOpen] = useState(false)
  const { Link } = config

  const user = session?.user ?? null

  const handleSignOut = () => {
    if (onSignOut) {
      onSignOut()
      return
    }
    config.navigate(config.routes.signOut)
  }

  const isIconOnly = size === "icon"

  return (
    <Menu onOpenChange={setOpen} open={open}>
      <MenuTrigger
        aria-label={isIconOnly ? "Account menu" : undefined}
        className={
          isIconOnly
            ? cn("rounded-full", className)
            : cn(
                buttonVariants({
                  variant: "ghost",
                  size: size === "compact" ? "sm" : "lg",
                }),
                "inline-flex h-auto max-w-full items-center font-normal",
                size === "compact" ? "gap-1 py-1" : "py-2.5",
                className
              )
        }
        disabled={isPending && !user}
        render={<button type="button" />}
      >
        {isIconOnly ? (
          <AuthUserAvatar loading={isPending} user={user} />
        ) : (
          <>
            <AuthUserView
              className="min-w-0 flex-1"
              loading={isPending}
              user={user}
            />
            <ChevronsUpDown className="ml-auto size-4 shrink-0 text-muted-foreground" />
          </>
        )}
      </MenuTrigger>

      <MenuPopup align={align} className="min-w-56">
        {user ? (
          <>
            <MenuGroup>
              <MenuGroupLabel className="p-0 font-normal">
                <AuthUserView className="px-2 py-1.5" user={user} />
              </MenuGroupLabel>
            </MenuGroup>

            <MenuSeparator />

            {menuItems.map((item) => {
              const Icon = item.icon
              const content = (
                <>
                  {Icon ? <Icon className="text-muted-foreground" /> : null}
                  {item.label}
                </>
              )

              if (item.href) {
                return (
                  <MenuItem
                    key={item.label}
                    render={
                      <Link
                        className="flex w-full items-center gap-2"
                        to={item.href}
                      />
                    }
                    variant={item.variant}
                  >
                    {content}
                  </MenuItem>
                )
              }

              return (
                <MenuItem
                  key={item.label}
                  onClick={item.onClick}
                  variant={item.variant}
                >
                  {content}
                </MenuItem>
              )
            })}

            {!hideSettings ? (
              <MenuItem
                onClick={() => config.navigate(config.routes.settingsAccount)}
              >
                <Settings className="text-muted-foreground" />
                Settings
              </MenuItem>
            ) : null}

            <MenuSeparator />

            <MenuItem onClick={handleSignOut}>
              <LogOut className="text-muted-foreground" />
              Sign out
            </MenuItem>
          </>
        ) : null}
      </MenuPopup>
    </Menu>
  )
}

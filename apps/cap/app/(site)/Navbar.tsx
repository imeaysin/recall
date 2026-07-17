import { Button, Logo } from "@/components/cap-ui"
import Image from "next/image"
import Link from "next/link"
import MobileMenu from "@/components/ui/MobileMenu"
import { DesktopNavLinks } from "./DesktopNavLinks"

interface NavbarProps {
  stars?: string
}

export const Navbar = ({ stars }: NavbarProps) => {
  return (
    <header className="fixed top-4 right-0 left-0 z-[51] lg:top-6">
      <nav className="relative mx-auto h-fit w-full max-w-[calc(100%-20px)] rounded-full border border-zinc-200 bg-white p-2 lg:max-w-fit">
        <div className="mx-auto flex h-full max-w-5xl items-center justify-between gap-12 transition-all">
          <div className="flex items-center">
            <Link passHref href="/home">
              <Logo
                className="transition-all duration-200 ease-out"
                viewBoxDimensions="0 0 120 40"
                style={{
                  width: 90,
                  height: 40,
                }}
              />
            </Link>
            <div className="hidden lg:flex">
              <DesktopNavLinks />
            </div>
          </div>
          <div className="hidden items-center space-x-2 lg:flex">
            <Button
              variant="outline"
              icon={
                <Image src="/github.svg" alt="Github" width={16} height={16} />
              }
              target="_blank"
              href="https://github.com/CapSoftware/Cap"
              size="sm"
              className="w-full font-medium sm:w-auto"
            >
              {`GitHub${stars ? ` (${stars})` : ""}`}
            </Button>
            <Button
              variant="gray"
              href="/login"
              size="sm"
              className="w-full font-medium sm:w-auto"
            >
              Login
            </Button>
            <Button
              variant="dark"
              href="/signup"
              size="sm"
              className="w-full font-medium sm:w-auto"
            >
              Sign Up
            </Button>
          </div>
          <div className="lg:hidden">
            <MobileMenu stars={stars} />
          </div>
        </div>
      </nav>
    </header>
  )
}

"use client"

import { Button } from "@/components/cap-ui"
import { useDetectPlatform } from "hooks/useDetectPlatform"
import Link from "next/link"
import { getPlatformIcon } from "@/utils/platform"
import { homepageCopy } from "../data/homepage-copy"
import UpgradeToPro from "./pages/_components/UpgradeToPro"

export function ReadyToGetStarted() {
  const { platform } = useDetectPlatform()
  const loading = platform === null

  return (
    <div
      className="border-gray-5 relative mx-auto my-[150px] flex min-h-[300px] w-[calc(100%-20px)] max-w-[1000px] flex-col justify-center overflow-hidden rounded-[20px] border bg-white p-8 md:my-[200px] md:bg-center lg:my-[250px]"
      style={{
        backgroundImage: "url('/illustrations/ctabg.svg')",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="wrapper relative z-10 mx-auto flex h-full flex-col items-center justify-center">
        <div className="mx-auto mb-8 max-w-[800px] text-center">
          <h2 className="text-gray-12 mb-3 text-3xl md:text-4xl">
            {homepageCopy.readyToGetStarted.title}
          </h2>
        </div>
        <div className="mb-8 flex w-full flex-col items-center justify-center space-y-4 sm:flex-row sm:space-y-0 sm:space-x-2">
          <Button
            variant="dark"
            href="/pricing"
            size="lg"
            className="w-fit font-medium"
          >
            {!loading && getPlatformIcon(platform)}
            {homepageCopy.readyToGetStarted.buttons.secondary}
          </Button>
          <UpgradeToPro text={homepageCopy.header.cta.primaryButton} />
        </div>
        <div>
          <p>
            or,{" "}
            <Link
              href="/loom-alternative"
              className="hover:text-gray-12 font-semibold underline"
            >
              Switch from Loom
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

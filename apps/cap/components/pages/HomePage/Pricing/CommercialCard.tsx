"use client"

import { Button } from "@/components/cap-ui"
import { faCircleInfo } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import NumberFlow from "@number-flow/react"
import { useRef, useState } from "react"
import { Tooltip } from "@/components/Tooltip"
import { WhenVisible } from "@/components/ui/WhenVisible"
import { homepageCopy } from "../../../../data/homepage-copy"
import { BillingToggle } from "./BillingToggle"
import { CommercialArt, type CommercialArtRef } from "./CommercialArt"
import { PlanFeature } from "./PlanFeature"
import { Stepper } from "./Stepper"

const copy = homepageCopy.pricing.commercial

export const CommercialCard = () => {
  const [licenses, setLicenses] = useState(1)
  const [isYearly, setIsYearly] = useState(true)
  const artRef = useRef<CommercialArtRef>(null)

  const perLicense = isYearly ? copy.pricing.yearly : copy.pricing.lifetime
  const total = licenses * perLicense

  const incrementLicenses = () => setLicenses((prev) => prev + 1)
  const decrementLicenses = () =>
    setLicenses((prev) => (prev > 1 ? prev - 1 : 1))

  return (
    <article
      onMouseEnter={() => artRef.current?.playHoverAnimation()}
      onMouseLeave={() => artRef.current?.playDefaultAnimation()}
      className="bg-gray-1 border-gray-5 flex flex-col rounded-2xl border p-8"
    >
      <div className="mb-4 -ml-3 size-14">
        <WhenVisible className="size-full">
          <CommercialArt ref={artRef} />
        </WhenVisible>
      </div>
      <div className="flex items-center gap-1.5">
        <h3 className="text-gray-12 text-lg font-semibold">{copy.title}</h3>
        <Tooltip
          position="top"
          delayDuration={150}
          className="max-w-[260px] items-start text-left leading-relaxed"
          content="A commercial license to use Cap on your desktop — unlimited local recording and editing, plus 20 cloud shareable links per month. No cloud subscription required."
        >
          <button
            type="button"
            aria-label="What's included in the Desktop License?"
            className="text-gray-9 hover:text-gray-11 transition-colors"
          >
            <FontAwesomeIcon icon={faCircleInfo} className="size-3.5" />
          </button>
        </Tooltip>
      </div>
      <p className="text-gray-10 mt-1.5 min-h-[40px] text-sm leading-relaxed">
        {copy.description}
      </p>

      <div className="mt-6 flex items-baseline gap-1.5">
        <span className="text-gray-12 text-4xl font-semibold tracking-tight tabular-nums">
          $<NumberFlow value={perLicense} />
        </span>
        <span className="text-gray-10 text-sm">/ license</span>
      </div>
      <p className="text-gray-10 mt-1 text-sm">
        {isYearly ? "billed yearly" : "one-time payment"}
      </p>

      <div className="mt-6 min-h-[120px] space-y-3">
        <BillingToggle
          ariaLabel="Billing option for Desktop License"
          value={isYearly ? "yearly" : "lifetime"}
          onChange={(value) => setIsYearly(value === "yearly")}
          options={[
            { value: "yearly", label: "Annual" },
            { value: "lifetime", label: "Lifetime" },
          ]}
        />
        <Stepper
          label="Licenses"
          value={licenses}
          onIncrement={incrementLicenses}
          onDecrement={decrementLicenses}
          decrementLabel="Decrease license count"
          incrementLabel="Increase license count"
        />
        <p className="text-gray-10 text-sm">
          <span className="text-gray-12 font-medium">
            $<NumberFlow value={total} />
          </span>{" "}
          {isYearly ? "billed yearly" : "one-time"}
        </p>
      </div>

      <Button
        variant="outline"
        size="lg"
        href="/signup"
        className="mt-6 w-full font-medium"
        aria-label="Purchase Commercial License"
      >
        {copy.cta}
      </Button>

      <div className="border-gray-4 mt-8 border-t pt-8">
        <p className="text-gray-12 mb-4 text-sm font-medium">What's included</p>
        <ul className="space-y-3">
          {copy.features.map((feature) => (
            <PlanFeature key={feature}>{feature}</PlanFeature>
          ))}
        </ul>
        <a
          href="/docs/commercial-license"
          className="text-gray-10 hover:text-gray-12 mt-5 inline-block text-sm underline transition-colors"
        >
          Learn more about the commercial license
        </a>
      </div>
    </article>
  )
}

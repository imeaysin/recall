"use client"

import { Button } from "@/components/cap-ui"
import NumberFlow from "@number-flow/react"
import { useRef, useState } from "react"
import { WhenVisible } from "@/components/ui/WhenVisible"
import { homepageCopy } from "../../../../data/homepage-copy"
import { BillingToggle } from "./BillingToggle"
import { PlanFeature } from "./PlanFeature"
import { ProArt, type ProArtRef } from "./ProArt"
import { Stepper } from "./Stepper"

const copy = homepageCopy.pricing.pro

export const ProCard = () => {
  const [users, setUsers] = useState(1)
  const [isAnnually, setIsAnnually] = useState(false)
  const artRef = useRef<ProArtRef>(null)

  const perUser = isAnnually ? copy.pricing.annual : copy.pricing.monthly
  const monthlyTotal = perUser * users
  const yearlyTotal = Math.round(copy.pricing.annual * 12) * users

  const incrementUsers = () => setUsers((prev) => prev + 1)
  const decrementUsers = () => setUsers((prev) => (prev > 1 ? prev - 1 : 1))

  return (
    <article
      onMouseEnter={() => artRef.current?.playHoverAnimation()}
      onMouseLeave={() => artRef.current?.playDefaultAnimation()}
      className="bg-gray-1 relative flex flex-col rounded-2xl p-8 shadow-xl ring-2 shadow-blue-500/10 ring-blue-500"
    >
      <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-blue-500 px-3 py-1 text-xs font-semibold whitespace-nowrap text-white">
        Most popular
      </span>

      <div className="mb-4 -ml-3 size-14">
        <WhenVisible className="size-full">
          <ProArt ref={artRef} />
        </WhenVisible>
      </div>
      <h3 className="text-gray-12 text-lg font-semibold">{copy.title}</h3>
      <p className="text-gray-10 mt-1.5 min-h-[40px] text-sm leading-relaxed">
        Everything in Desktop, plus unlimited cloud sharing, AI, and team
        collaboration.
      </p>

      <div className="mt-6 flex items-baseline gap-1.5">
        <span className="text-gray-12 text-4xl font-semibold tracking-tight tabular-nums">
          $<NumberFlow value={perUser} />
        </span>
        <span className="text-gray-10 text-sm">/ user / month</span>
      </div>
      <p className="text-gray-10 mt-1 text-sm">
        billed {isAnnually ? "annually" : "monthly"}
      </p>

      <div className="mt-6 min-h-[120px] space-y-3">
        <BillingToggle
          ariaLabel="Billing cycle for Cap Pro"
          value={isAnnually ? "annual" : "monthly"}
          onChange={(value) => setIsAnnually(value === "annual")}
          options={[
            { value: "monthly", label: "Monthly" },
            { value: "annual", label: "Annual", badge: "Save 32%" },
          ]}
        />
        <Stepper
          label="Users"
          value={users}
          onIncrement={incrementUsers}
          onDecrement={decrementUsers}
          decrementLabel="Decrease user count"
          incrementLabel="Increase user count"
        />
        <p className="text-gray-10 text-sm">
          Total:{" "}
          <span className="text-gray-12 font-medium">
            $<NumberFlow value={isAnnually ? yearlyTotal : monthlyTotal} />
          </span>{" "}
          {isAnnually ? "/ year" : "/ month"}
        </p>
      </div>

      <Button
        variant="blue"
        size="lg"
        href="/signup"
        className="mt-6 w-full font-medium"
        aria-label="Purchase Cap Pro License"
      >
        {copy.cta}
      </Button>

      <div className="border-gray-4 mt-8 border-t pt-8">
        <p className="text-gray-12 mb-4 text-sm font-medium">
          Everything in Desktop License, plus:
        </p>
        <ul className="space-y-3">
          {copy.features.slice(1).map((feature) => (
            <PlanFeature key={feature}>{feature}</PlanFeature>
          ))}
        </ul>
      </div>
    </article>
  )
}

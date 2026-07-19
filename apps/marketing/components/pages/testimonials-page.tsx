"use client"

import { ReadyToGetStarted } from "../ready-to-get-started"
import { Testimonials } from "../ui/testimonials"
import { homeContent } from "@/content/home"

export function TestimonialsPage({ amount }: { amount?: number }) {
  return (
    <>
      <div className="mx-auto w-full max-w-screen-2xl px-5 py-32 sm:px-8 md:py-40 lg:px-10">
        <Testimonials
          amount={amount}
          title={homeContent.testimonials.title}
          subtitle={homeContent.testimonials.subtitle}
        />
      </div>
      <div className="mx-auto w-full max-w-screen-2xl px-5 pb-28 sm:px-8 lg:px-10">
        <ReadyToGetStarted />
      </div>
    </>
  )
}

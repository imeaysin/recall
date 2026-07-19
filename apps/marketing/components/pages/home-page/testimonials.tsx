"use client"

import { Button } from "@/components/product-ui"
import { Testimonials } from "@/components/ui/testimonials"
import { homeContent } from "@/content/home"

export default function HomeTestimonials() {
  return (
    <div className="mx-auto w-full max-w-5xl px-5">
      <Testimonials amount={6} />
      <div className="mt-10 flex justify-center">
        <Button
          href="/testimonials"
          variant="outline"
          size="lg"
          className="w-fit font-medium"
        >
          {homeContent.testimonials.cta}
        </Button>
      </div>
    </div>
  )
}

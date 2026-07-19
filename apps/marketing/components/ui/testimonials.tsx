"use client"

import { homeContent } from "@/content/home"
import { type Testimonial, testimonials } from "@/content/testimonials"
import Image from "next/image"

type TestimonialsProps = {
  amount?: number
  title?: string
  subtitle?: string
  showHeader?: boolean
}

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <a
      href={testimonial.url}
      target="_blank"
      rel="noopener noreferrer"
      className="mb-3 block break-inside-avoid rounded-2xl border border-border/70 bg-background p-5 transition-colors hover:bg-muted/30 sm:p-6"
    >
      <p className="text-sm leading-relaxed text-foreground/85">
        {testimonial.content}
      </p>
      <div className="mt-4 flex items-center gap-3 border-t border-border/60 pt-4">
        <Image
          src={testimonial.image}
          alt=""
          width={36}
          height={36}
          className="size-9 rounded-full object-cover"
        />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-foreground">
            {testimonial.name}
          </p>
          {testimonial.handle ? (
            <p className="truncate text-xs text-muted-foreground">
              {testimonial.handle}
            </p>
          ) : null}
        </div>
      </div>
    </a>
  )
}

/** Shared testimonials list for pricing / testimonials pages. */
export function Testimonials({
  amount,
  title = homeContent.testimonials.title,
  subtitle = homeContent.testimonials.subtitle,
  showHeader = true,
}: TestimonialsProps) {
  const items = amount ? testimonials.slice(0, amount) : testimonials

  return (
    <div>
      {showHeader ? (
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-medium tracking-tight text-balance text-foreground md:text-4xl">
            {title}
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
            {subtitle}
          </p>
        </div>
      ) : null}

      <div className="columns-1 gap-3 md:columns-2 lg:columns-3">
        {items.map((testimonial) => (
          <TestimonialCard
            key={`${testimonial.name}:${testimonial.handle}`}
            testimonial={testimonial}
          />
        ))}
      </div>
    </div>
  )
}

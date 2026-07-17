import { Button } from "@/components/cap-ui"
import { motion } from "framer-motion"
import Image from "next/image"
import { useState } from "react"
import { homepageCopy } from "../../../data/homepage-copy"
import { testimonials } from "../../../data/testimonials"

// Combined type for testimonial data and its position/style configuration
interface TestimonialItem {
  name: string
  handle: string
  image: string
  content: string
  url: string
  position: { left?: string; right?: string; top?: string }
  rotation: number
  zIndex: number
}

// Card component props - now directly takes the TestimonialItem
interface TestimonialCardProps {
  item: TestimonialItem
}

// Testimonial card component
const TestimonialCard: React.FC<TestimonialCardProps> = ({ item }) => {
  const [isHovered, setIsHovered] = useState(false)
  // Destructure all properties from item, including position, rotation and zIndex
  const { name, handle, image, content, url, position, rotation, zIndex } = item

  return (
    <motion.a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="border-gray-5 h-fit min-w-[300px] cursor-pointer rounded-xl border bg-white p-6 shadow-lg transition-shadow duration-200 ease-in-out md:absolute md:h-auto md:w-full md:max-w-[300px] md:min-w-min"
      style={{
        ...position,
        transformOrigin: "center center",
        boxShadow: isHovered
          ? "0 20px 25px rgba(0, 0, 0, 0.1)"
          : "0 4px 10px rgba(0, 0, 0, 0.05)",
      }}
      initial={{
        rotate: rotation,
        zIndex: zIndex,
      }}
      whileHover={{
        rotate: 0,
        scale: 1.05,
        y: -5,
        zIndex: 50,
        transition: { duration: 0.3, ease: "easeOut" },
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <div className="mb-4 flex items-center">
        <div className="relative mr-3 h-12 w-12 overflow-hidden rounded-full border-2 border-gray-100">
          <Image
            src={image}
            key={image}
            alt={`${name}'s profile picture`}
            fill
            className="object-cover"
          />
        </div>
        <div>
          <h4 className="text-gray-12 text-lg font-semibold">{name}</h4>
          <p className="text-gray-10 text-sm">{handle}</p>
        </div>
      </div>
      <p className="text-gray-10 text-sm leading-relaxed">{content}</p>
    </motion.a>
  )
}

// Combined testimonial data with position and style configurations
const testimonialItems: TestimonialItem[] = [
  {
    ...testimonials[2],
    position: { right: "5%", top: "5%" },
    rotation: 8,
    zIndex: 4,
  },
  {
    ...testimonials[25],
    position: { right: "25%", top: "15%" },
    rotation: -5,
    zIndex: 3,
  },
  {
    ...testimonials[9],
    position: { left: "5%", top: "10%" },
    rotation: -8,
    zIndex: 2,
  },
  {
    ...testimonials[22],
    position: { left: "25%", top: "5%" },
    rotation: 5,
    zIndex: 1,
  },
  {
    ...testimonials[12],
    position: { right: "18%", top: "40%" },
    rotation: 8,
    zIndex: 3,
  },
  {
    ...testimonials[10],
    position: { left: "20%", top: "40%" },
    rotation: -4,
    zIndex: 0,
  },
]

// Main Testimonials component
const Testimonials = () => {
  return (
    <div className="mx-auto w-full max-w-[1200px] md:px-5">
      <div className="mb-16 px-5 text-center">
        <h2 className="text-gray-12 mx-auto mb-3 w-full text-4xl font-medium text-balance">
          {homepageCopy.testimonials.title}
        </h2>
        <p className="text-gray-10 mx-auto w-full max-w-[400px] text-lg leading-[1.75rem]">
          {homepageCopy.testimonials.subtitle}
        </p>
      </div>

      <div className="relative min-h-fit w-full overflow-x-auto px-5 py-10 md:h-[600px] md:px-0">
        {/* Card layout container */}
        <div className="flex h-full w-full flex-row md:relative">
          {testimonialItems.map((item) => (
            <TestimonialCard key={item.name} item={item} />
          ))}
        </div>
      </div>
      <Button
        href="/testimonials"
        className="mx-auto mt-10 w-fit md:mt-0"
        variant="dark"
        size="lg"
      >
        {homepageCopy.testimonials.cta}
      </Button>
    </div>
  )
}

export default Testimonials

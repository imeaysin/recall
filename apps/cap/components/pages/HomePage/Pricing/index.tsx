import { faHeart } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { homepageCopy } from "../../../../data/homepage-copy"
import { CommercialCard } from "./CommercialCard"
import { ProCard } from "./ProCard"

export { CommercialCard } from "./CommercialCard"
export { ProCard } from "./ProCard"

const Pricing = () => {
  return (
    <div className="mx-auto w-full max-w-[960px] px-5">
      <div className="mb-14 px-5 text-center">
        <h2 className="text-gray-12 mb-3 w-full text-4xl font-medium tracking-tight">
          {homepageCopy.pricing.title}
        </h2>
        <p className="text-gray-10 mx-auto w-full max-w-[640px] text-lg leading-[1.75rem]">
          {homepageCopy.pricing.subtitle}
        </p>
        <div className="bg-gray-1 border-gray-5 mx-auto mt-6 flex w-fit items-center justify-center gap-2 rounded-full border px-5 py-2.5">
          <FontAwesomeIcon className="size-3.5 text-red-500" icon={faHeart} />
          <p className="text-gray-12 font-medium">
            {homepageCopy.pricing.lovedBy}
          </p>
        </div>
      </div>
      <div className="grid items-stretch gap-6 pt-3 md:grid-cols-2">
        <CommercialCard />
        <ProCard />
      </div>
    </div>
  )
}

export default Pricing

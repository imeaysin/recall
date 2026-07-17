import { homepageCopy } from "../../../data/homepage-copy"

const Faq = () => {
  return (
    <div className="mx-auto max-w-[1000px] px-5">
      <h2 className="text-gray-12 mb-10 text-4xl">{homepageCopy.faq.title}</h2>
      <div className="space-y-4">
        {homepageCopy.faq.items.map((item, index) => (
          <details
            key={index.toString()}
            className="group border-gray-5 bg-gray-1 text-gray-12 hover:bg-gray-3 overflow-hidden rounded-xl border transition-colors duration-200 open:bg-blue-500 open:text-white open:hover:bg-blue-500"
          >
            <summary className="block cursor-pointer list-none px-6 py-4 text-left marker:hidden [&::-webkit-details-marker]:hidden">
              <div className="flex items-center justify-between">
                <p className="text-gray-12 group-open:text-gray-1 text-lg font-medium">
                  {item.question}
                </p>
                <span className="ml-4 flex-shrink-0 text-2xl leading-none group-open:hidden">
                  +
                </span>
                <span className="text-gray-1 ml-4 hidden flex-shrink-0 text-2xl leading-none group-open:block">
                  -
                </span>
              </div>
            </summary>
            <p className="text-gray-3 px-6 pb-4">{item.answer}</p>
          </details>
        ))}
      </div>
    </div>
  )
}

export default Faq

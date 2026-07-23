import { useEffect, useState } from "react"
import { ImageIcon } from "lucide-react"
import { AspectRatio } from "@workspace/ui/components/aspect-ratio"
import { EmptyMedia } from "@workspace/ui/components/empty"
import { LIBRARY_CARD_MEDIA_RATIO } from "@/features/library/components/library-card-shared"

export function LibraryCardMedia(props: {
  readonly src?: string
  readonly alt: string
}) {
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    setFailed(false)
  }, [props.src])

  const showCover = Boolean(props.src) && !failed

  return (
    <AspectRatio
      ratio={LIBRARY_CARD_MEDIA_RATIO}
      className="overflow-hidden rounded-lg bg-muted"
    >
      {showCover && props.src ? (
        <CoverImage
          src={props.src}
          alt={props.alt}
          onError={() => setFailed(true)}
        />
      ) : (
        <MediaPlaceholder />
      )}
    </AspectRatio>
  )
}

function CoverImage(props: {
  readonly src: string
  readonly alt: string
  readonly onError: () => void
}) {
  return (
    <>
      <img
        src={props.src}
        alt=""
        aria-hidden
        className="absolute inset-0 size-full scale-110 object-cover opacity-50 blur-2xl"
        onError={props.onError}
      />
      <img
        src={props.src}
        alt={props.alt}
        className="relative size-full object-contain"
        onError={props.onError}
      />
    </>
  )
}

function MediaPlaceholder() {
  return (
    <div
      role="img"
      aria-label="No preview"
      className="flex size-full items-center justify-center"
    >
      <EmptyMedia variant="icon" className="mb-0">
        <ImageIcon />
      </EmptyMedia>
    </div>
  )
}

export const MagicLinkEmail = ({ url }: { url: string }) => (
  <div>
    <h1>Your sign-in link</h1>
    <p>Click the link below to sign in:</p>
    <a href={url}>{url}</a>
  </div>
)

import { Html, Head, Body, Container } from "@react-email/components"

export const MagicLinkEmail = ({ url }: { url: string }) => (
  <Html>
    <Head />
    <Body>
      <Container>
        <div>
          <h1>Your sign-in link</h1>
          <p>Click the link below to sign in:</p>
          <a href={url}>{url}</a>
        </div>
      </Container>
    </Body>
  </Html>
)

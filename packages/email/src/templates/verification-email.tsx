import { Html, Head, Body, Container } from "@react-email/components"

export const VerificationEmail: React.FC<{ url: string }> = ({ url }) => (
  <Html>
    <Head />
    <Body>
      <Container>
        <div>
          <h1>Verify your email</h1>
          <p>Click the link below to verify your email address:</p>
          <a href={url}>{url}</a>
        </div>
      </Container>
    </Body>
  </Html>
)

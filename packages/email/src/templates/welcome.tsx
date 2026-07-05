import { Html, Head, Body, Container } from "@react-email/components"

export const WelcomeEmail = ({ name }: { name: string }) => {
  return (
    <Html>
      <Head />
      <Body>
        <Container>
          <div>
            <h1>Welcome, {name}!</h1>
            <p>Thanks for joining our application.</p>
          </div>
        </Container>
      </Body>
    </Html>
  )
}

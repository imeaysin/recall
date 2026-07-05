import { Html, Head, Body, Container } from "@react-email/components"

export const OtpEmail = ({ otp }: { otp: string }) => (
  <Html>
    <Head />
    <Body>
      <Container>
        <div>
          <h1>Your verification code</h1>
          <p>Use this code to continue:</p>
          <p
            style={{ fontSize: "24px", fontWeight: 700, letterSpacing: "4px" }}
          >
            {otp}
          </p>
        </div>
      </Container>
    </Body>
  </Html>
)

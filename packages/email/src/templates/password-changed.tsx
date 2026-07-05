import { Html, Head, Body, Container } from "@react-email/components"

export const PasswordChangedEmail = ({
  appName = "Theo",
}: {
  appName?: string
}) => (
  <Html>
    <Head />
    <Body>
      <Container>
        <div>
          <h1>Your password was changed</h1>
          <p>
            The password for your {appName} account was updated successfully.
          </p>
          <p>
            If you did not make this change, reset your password immediately.
          </p>
        </div>
      </Container>
    </Body>
  </Html>
)

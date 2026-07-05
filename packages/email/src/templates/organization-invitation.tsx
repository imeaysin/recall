import { Html, Head, Body, Container } from "@react-email/components"

export const OrganizationInvitationEmail = ({
  organizationName,
  inviterName,
  url,
}: {
  organizationName: string
  inviterName: string
  url: string
}) => (
  <Html>
    <Head />
    <Body>
      <Container>
        <div>
          <h1>Join {organizationName}</h1>
          <p>{inviterName} invited you to join their organization.</p>
          <p>Click the link below to accept:</p>
          <a href={url}>{url}</a>
        </div>
      </Container>
    </Body>
  </Html>
)

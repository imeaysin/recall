import { Html, Head, Body, Container } from "@react-email/components"

export const NewDeviceEmail = ({
  appName = "Theo",
  device,
  location,
  time,
}: {
  appName?: string
  device?: string
  location?: string
  time?: string
}) => (
  <Html>
    <Head />
    <Body>
      <Container>
        <div>
          <h1>New sign-in to {appName}</h1>
          <p>We noticed a new sign-in to your account.</p>
          {device ? <p>Device: {device}</p> : null}
          {location ? <p>Location: {location}</p> : null}
          {time ? <p>Time: {time}</p> : null}
          <p>If this was not you, secure your account immediately.</p>
        </div>
      </Container>
    </Body>
  </Html>
)

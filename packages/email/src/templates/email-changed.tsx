export const EmailChangedEmail = ({
  email,
  appName = "Theo",
}: {
  email: string
  appName?: string
}) => (
  <div>
    <h1>Your email was changed</h1>
    <p>
      The email address for your {appName} account was changed to {email}.
    </p>
    <p>If you did not make this change, contact support immediately.</p>
  </div>
)

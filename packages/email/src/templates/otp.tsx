export const OtpEmail = ({ otp }: { otp: string }) => (
  <div>
    <h1>Your verification code</h1>
    <p>Use this code to continue:</p>
    <p style={{ fontSize: "24px", fontWeight: 700, letterSpacing: "4px" }}>
      {otp}
    </p>
  </div>
)

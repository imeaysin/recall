import { Link, useNavigate, useParams } from "react-router-dom"
import { useState } from "react"
import { authClient, useSession } from "@workspace/auth/client"
import { Button } from "@workspace/ui/components/button"
import { Spinner } from "@workspace/ui/components/spinner"
import {
  acceptInvitationPath,
  defaultAuthenticatedRoute,
  routes,
} from "@/config/routes"
import { AuthPageBody } from "@/features/auth/components/auth-page-body"
import { AuthPageHeader } from "@/features/auth/components/auth-page-header"
import { withAuthRedirectQuery } from "@/routing/safe-redirect"

const INVITATION_ERROR = "Unable to accept invitation"

export function AcceptInvitationPage() {
  const { invitationId } = useParams()
  if (!invitationId) return <InvalidInvitation />
  return <AcceptInvitationBody invitationId={invitationId} />
}

function AcceptInvitationBody({
  invitationId,
}: {
  readonly invitationId: string
}) {
  const { data: session, isPending } = useSession()
  if (isPending) return <PendingSession />
  if (!session) return <SignInRequired invitationId={invitationId} />
  return <AcceptInvitationActions invitationId={invitationId} />
}

function AcceptInvitationActions({
  invitationId,
}: {
  readonly invitationId: string
}) {
  const navigate = useNavigate()
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [isAccepting, setIsAccepting] = useState(false)

  async function acceptInvitation() {
    setIsAccepting(true)
    setStatusMessage(null)
    const result = await authClient.organization.acceptInvitation({
      invitationId,
    })
    setIsAccepting(false)
    if (result.error) {
      setStatusMessage(result.error.message ?? INVITATION_ERROR)
      return
    }
    navigate(defaultAuthenticatedRoute, { replace: true })
  }

  return (
    <AuthPageBody>
      <AuthPageHeader
        description="Join the organization using the invitation sent to your email."
        title="Accept invitation"
      />
      {statusMessage ? (
        <p className="text-center text-sm text-destructive">{statusMessage}</p>
      ) : null}
      <Button
        className="w-full"
        disabled={isAccepting}
        size="lg"
        onClick={() => void acceptInvitation()}
      >
        {isAccepting ? <Spinner data-icon="inline-start" /> : null}
        {isAccepting ? "Accepting…" : "Accept invitation"}
      </Button>
    </AuthPageBody>
  )
}

function SignInRequired({ invitationId }: { readonly invitationId: string }) {
  const redirectTarget = acceptInvitationPath(invitationId)
  return (
    <AuthPageBody>
      <AuthPageHeader
        description="Sign in to join this organization."
        title="Accept invitation"
      />
      <div className="flex flex-col gap-2">
        <Button
          className="w-full"
          nativeButton={false}
          size="lg"
          render={
            <Link
              to={withAuthRedirectQuery(routes.signIn, {
                redirect: redirectTarget,
                fallback: defaultAuthenticatedRoute,
              })}
            />
          }
        >
          Sign in
        </Button>
        <Button
          className="w-full"
          nativeButton={false}
          size="lg"
          render={
            <Link
              to={withAuthRedirectQuery(routes.signUp, {
                redirect: redirectTarget,
                fallback: defaultAuthenticatedRoute,
              })}
            />
          }
          variant="outline"
        >
          Create account
        </Button>
      </div>
    </AuthPageBody>
  )
}

function PendingSession() {
  return (
    <AuthPageBody>
      <AuthPageHeader title="Checking session…" />
      <div className="flex justify-center">
        <Spinner />
      </div>
    </AuthPageBody>
  )
}

function InvalidInvitation() {
  return (
    <AuthPageBody>
      <AuthPageHeader
        description="This invitation link is incomplete."
        title="Invalid invitation"
      />
    </AuthPageBody>
  )
}

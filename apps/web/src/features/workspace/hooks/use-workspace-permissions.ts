import { useOrgPermissionFlags } from "@/hooks/use-org-permission"

const WORKSPACE_CHECKS = [
  { key: "settingsUpdate", permissions: { settings: ["update"] } },
  { key: "memberUpdate", permissions: { member: ["update"] } },
  { key: "memberDelete", permissions: { member: ["delete"] } },
  { key: "invitationCreate", permissions: { invitation: ["create"] } },
  { key: "invitationCancel", permissions: { invitation: ["cancel"] } },
  { key: "acCreate", permissions: { ac: ["create"] } },
  { key: "acUpdate", permissions: { ac: ["update"] } },
  { key: "acDelete", permissions: { ac: ["delete"] } },
  { key: "acRead", permissions: { ac: ["read"] } },
] as const

export function useWorkspacePermissions(
  organizationId: string | null | undefined
) {
  const { flags, isPending } = useOrgPermissionFlags(
    WORKSPACE_CHECKS,
    organizationId
  )

  return {
    canUpdateSettings: flags.settingsUpdate === true,
    canAssignRoles: flags.memberUpdate === true,
    canRemoveMembers: flags.memberDelete === true,
    canInvite: flags.invitationCreate === true,
    canCancelInvites: flags.invitationCancel === true,
    canCreateRoles: flags.acCreate === true,
    canUpdateRoles: flags.acUpdate === true,
    canDeleteRoles: flags.acDelete === true,
    canListRoles: flags.acRead === true,
    isPending,
  }
}

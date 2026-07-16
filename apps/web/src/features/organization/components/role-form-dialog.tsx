import { Dialog, DialogContent } from "@workspace/ui-shadcn/components/dialog"
import type { OrganizationRole } from "@/features/organization/hooks/use-organization-roles"
import { RoleFormBody } from "@/features/organization/components/role-form-body"

type RoleFormDialogProps = {
  readonly open: boolean
  readonly onOpenChange: (open: boolean) => void
  readonly editingRole: OrganizationRole | null
  readonly onSaved: () => void
}

export function RoleFormDialog({
  open,
  onOpenChange,
  editingRole,
  onSaved,
}: RoleFormDialogProps) {
  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="sm:max-w-xl">
        {open ? (
          <RoleFormBody
            key={editingRole?.id ?? "new-role"}
            editingRole={editingRole}
            onOpenChange={onOpenChange}
            onSaved={onSaved}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

import { Button } from "@workspace/ui-shadcn/components/button"
import { Checkbox } from "@workspace/ui-shadcn/components/checkbox"
import {
  PERMISSION_RESOURCE_LABELS,
  ROLE_PERMISSION_CATALOG,
  formatActionLabel,
  isPermissionResource,
  type PermissionResource,
} from "@/features/organization/lib/organization-roles"

export type PermissionState = Partial<Record<PermissionResource, Set<string>>>

type RolePermissionPickerProps = {
  readonly disabled?: boolean
  readonly permissionState: PermissionState
  readonly onToggleAction: (
    resource: PermissionResource,
    action: string
  ) => void
  readonly onToggleResource: (resource: PermissionResource) => void
}

export function emptyPermissionState(): PermissionState {
  return {}
}

export function permissionStateFromRole(permission: Record<string, string[]>) {
  const next = emptyPermissionState()
  for (const [resource, actions] of Object.entries(permission)) {
    if (!isPermissionResource(resource)) continue
    next[resource] = new Set(actions)
  }
  return next
}

export function toPermissionPayload(
  state: PermissionState
): Record<string, string[]> {
  const permission: Record<string, string[]> = {}
  for (const [resource, actions] of Object.entries(state)) {
    if (!isPermissionResource(resource) || !actions || actions.size === 0) {
      continue
    }
    permission[resource] = [...actions]
  }
  return permission
}

export function countSelectedPermissions(state: PermissionState) {
  return Object.values(state).reduce(
    (total, actions) => total + (actions?.size ?? 0),
    0
  )
}

export function RolePermissionPicker({
  disabled,
  permissionState,
  onToggleAction,
  onToggleResource,
}: RolePermissionPickerProps) {
  return (
    <div className="flex flex-col gap-4">
      {Object.entries(ROLE_PERMISSION_CATALOG).map(([resource, actions]) => {
        if (!isPermissionResource(resource)) return null
        const selected = permissionState[resource] ?? new Set<string>()
        const allSelected = actions.every((action) => selected.has(action))

        return (
          <div key={resource} className="rounded-lg border border-border p-3">
            <div className="mb-2 flex items-center justify-between gap-3">
              <p className="text-sm font-medium">
                {PERMISSION_RESOURCE_LABELS[resource]}
              </p>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                disabled={disabled}
                onClick={() => onToggleResource(resource)}
              >
                {allSelected ? "Clear" : "Select all"}
              </Button>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              {actions.map((action) => {
                const checked = selected.has(action)
                return (
                  <label
                    className="flex items-center gap-2 text-sm"
                    key={`${resource}-${action}`}
                  >
                    <Checkbox
                      checked={checked}
                      disabled={disabled}
                      onCheckedChange={() => onToggleAction(resource, action)}
                    />
                    {formatActionLabel(action)}
                  </label>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

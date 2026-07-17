import { Badge } from "@workspace/ui-shadcn/components/badge"
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "@workspace/ui-shadcn/components/item"
import {
  BUILT_IN_ROLE_DESCRIPTIONS,
  STATIC_ORG_ROLES,
  formatRoleLabel,
  isAssignableBuiltInRole,
} from "@/features/organization/lib/organization-roles"
import { SectionHeader } from "@/components/page-header"

export function BuiltInRolesSection() {
  return (
    <div className="flex flex-col gap-3">
      <SectionHeader
        description="Defined in code for every organization. Owner cannot be assigned via invite."
        title="Built-in roles"
      />

      <ItemGroup>
        {STATIC_ORG_ROLES.map((role) => (
          <Item key={role} role="listitem" variant="outline">
            <ItemContent>
              <ItemTitle className="gap-2">
                {formatRoleLabel(role)}
                {!isAssignableBuiltInRole(role) ? (
                  <Badge variant="secondary">System</Badge>
                ) : null}
              </ItemTitle>
              <ItemDescription>
                {BUILT_IN_ROLE_DESCRIPTIONS[role]}
              </ItemDescription>
            </ItemContent>
          </Item>
        ))}
      </ItemGroup>
    </div>
  )
}

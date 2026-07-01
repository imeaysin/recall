import { authCollections } from "../permissions/collections"
import { ensureAuthMongoConnected, getAuthDb, toMongoId } from "../db/mongo"

export { toMongoId } from "../db/mongo"

export async function findOrganizationMemberRole(
  organizationId: string,
  userId: string
) {
  await ensureAuthMongoConnected()

  const member = await getAuthDb()
    .collection(authCollections.member)
    .findOne({
      organizationId: toMongoId(organizationId),
      userId: toMongoId(userId),
    })

  return typeof member?.role === "string" ? member.role : null
}

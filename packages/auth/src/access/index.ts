export enum Roles {
  admin = "admin",
  user = "user",
  owner = "owner",
  member = "member",
  viewer = "viewer",
}

export {
  ac,
  ownerRole,
  adminRole,
  memberRole,
  viewerRole,
  organizationRoles,
  platformRoles,
} from "./roles"

export {
  MAXIMUM_ROLES_PER_ORGANIZATION,
  MAXIMUM_TEAMS_PER_ORGANIZATION,
  AUTH_BASE_PATH,
  NATIVE_APP_SCHEME,
  NATIVE_STORAGE_PREFIX,
  WEB_TWO_FACTOR_PATH,
  WEB_ACCEPT_INVITATION_PATH_PREFIX,
  SESSION_EXPIRES_IN_SECONDS,
  SESSION_UPDATE_AGE_SECONDS,
} from "./constants"

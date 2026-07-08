function mockRole() {
  return {
    statements: {},
    authorize: () => ({ success: true }),
  }
}

function mockAccessControl() {
  return {
    newRole: () => mockRole(),
  }
}

jest.mock(
  "better-auth/plugins/access",
  () => ({
    createAccessControl: () => mockAccessControl(),
    role: () => mockRole(),
  }),
  { virtual: true }
)

jest.mock(
  "better-auth/plugins/admin/access",
  () => ({
    defaultStatements: {},
    adminAc: mockAccessControl(),
  }),
  { virtual: true }
)

jest.mock(
  "better-auth/plugins/organization/access",
  () => ({
    ownerAc: mockAccessControl(),
    adminAc: mockAccessControl(),
    memberAc: mockAccessControl(),
  }),
  { virtual: true }
)

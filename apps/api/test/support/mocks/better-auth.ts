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
    userAc: mockAccessControl(),
  }),
  { virtual: true }
)

/**
 * Placeholder seed — notes seeding removed with the template Notes module.
 * Sign up via OAuth, then save URLs from the Library UI.
 * Run: pnpm --filter api seed
 */
async function main() {
  console.log(
    "No seed data for CogniVault yet. Sign in with OAuth and save a URL from Library."
  )
}

main().catch((error: unknown) => {
  console.error(error)
  process.exit(1)
})

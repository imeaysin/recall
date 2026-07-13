import { parseMarketingEnv } from "@workspace/config/client"

export const env = parseMarketingEnv(process.env)

export const marketingEnv = {
  appUrl: env.marketingUrl || "https://app.midday.ai",
}

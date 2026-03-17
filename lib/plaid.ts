/**
 * Plaid client — used to link seller bank accounts securely.
 * The seller logs in via Plaid Link; we get a processor token
 * that we forward to Stripe to create an External Account.
 *
 * Flow:
 * 1. GET /api/plaid/link-token   → returns link_token for Plaid Link UI
 * 2. Plaid Link completes        → client has public_token + account_id
 * 3. POST /api/plaid/exchange    → exchange public_token for access_token
 *                                  then create processor_token for Stripe
 * 4. POST /api/plaid/attach      → pass processor_token to Stripe to create
 *                                  ExternalAccount on the seller's Connected Account
 */
import {
  Configuration,
  PlaidApi,
  PlaidEnvironments,
  Products,
  CountryCode,
} from "plaid";

const ENV = (process.env.PLAID_ENV as "sandbox" | "development" | "production") || "sandbox";

const config = new Configuration({
  basePath: PlaidEnvironments[ENV],
  baseOptions: {
    headers: {
      "PLAID-CLIENT-ID": process.env.PLAID_CLIENT_ID || "",
      "PLAID-SECRET": process.env.PLAID_SECRET || "",
    },
  },
});

export const plaidClient = process.env.PLAID_CLIENT_ID ? new PlaidApi(config) : null;

/**
 * Create a Plaid Link token for the front-end to initialize Plaid Link.
 */
export async function createLinkToken(userId: string) {
  if (!plaidClient) throw new Error("Plaid not configured");

  const response = await plaidClient.linkTokenCreate({
    user: { client_user_id: userId },
    client_name: "Fleeper",
    products: [Products.Auth],
    country_codes: [CountryCode.Us, CountryCode.Gb],
    language: "en",
    redirect_uri: process.env.PLAID_REDIRECT_URI,
  });

  return response.data.link_token;
}

/**
 * Exchange a public_token (from Plaid Link) for a permanent access_token,
 * then create a Stripe processor token for the chosen account.
 */
export async function exchangeForProcessorToken(
  publicToken: string,
  accountId: string
) {
  if (!plaidClient) throw new Error("Plaid not configured");

  // Step 1: Exchange public_token → access_token
  const exchangeResponse = await plaidClient.itemPublicTokenExchange({
    public_token: publicToken,
  });
  const accessToken = exchangeResponse.data.access_token;

  // Step 2: Create a Stripe processor token
  const processorResponse = await plaidClient.processorStripeBankAccountTokenCreate({
    access_token: accessToken,
    account_id: accountId,
  });

  return {
    accessToken, // Store encrypted — needed for future balance checks
    processorToken: processorResponse.data.stripe_bank_account_token,
  };
}

/**
 * Fetch account details (name, mask) for display in the dashboard.
 */
export async function getAccountDetails(accessToken: string) {
  if (!plaidClient) throw new Error("Plaid not configured");

  const response = await plaidClient.accountsGet({ access_token: accessToken });
  return response.data.accounts.map((a) => ({
    id: a.account_id,
    name: a.name,
    officialName: a.official_name,
    mask: a.mask,
    type: a.type,
    subtype: a.subtype,
  }));
}

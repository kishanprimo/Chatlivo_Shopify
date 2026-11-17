import {
  BillingInterval,
  type AdminApiContext,
} from "@shopify/shopify-app-react-router/server";

// Shopify Billing plans. Prices match chatlivo.com/pricing (yearly = 2 months
// free). Each key is also the subscription name Shopify stores, and maps to a
// subscription_plans row (plan_name + billing_cycle) in chatlivo-api.
export const PLANS = {
  "Pro Monthly": {
    plan_name: "Pro",
    billing_cycle: "monthly",
    amount: 12,
    interval: BillingInterval.Every30Days,
  },
  "Pro Yearly": {
    plan_name: "Pro",
    billing_cycle: "yearly",
    amount: 120,
    interval: BillingInterval.Annual,
  },
  "Business Monthly": {
    plan_name: "Business",
    billing_cycle: "monthly",
    amount: 24,
    interval: BillingInterval.Every30Days,
  },
  "Business Yearly": {
    plan_name: "Business",
    billing_cycle: "yearly",
    amount: 240,
    interval: BillingInterval.Annual,
  },
} as const;

export type PlanKey = keyof typeof PLANS;

export const PLAN_KEYS = Object.keys(PLANS) as PlanKey[];

export const TRIAL_DAYS = 7;

// Development stores can't be charged: keep SHOPIFY_BILLING_TEST=true there
export const IS_TEST_BILLING = process.env.SHOPIFY_BILLING_TEST === "true";

export function isPlanKey(value: unknown): value is PlanKey {
  return typeof value === "string" && value in PLANS;
}

// Statuses of a subscription the merchant actually approved (so its trial
// started). DECLINED and PENDING never ran.
const STARTED_STATUSES = new Set(["ACTIVE", "CANCELLED", "EXPIRED", "FROZEN"]);
const DAY_MS = 24 * 60 * 60 * 1000;

export type BillingContext = {
  // Test charges for development stores (they can't be really charged) or
  // when SHOPIFY_BILLING_TEST=true
  isTest: boolean;
  // Free-trial days still owed to this shop. Shopify would otherwise give a
  // full trial on every new subscription (plan change, cancel + resubscribe).
  trialDaysRemaining: number;
};

// Read from Shopify, not our database: the shop's plan and its own
// subscription history are the source of truth.
export async function getBillingContext(
  admin: Pick<AdminApiContext, "graphql">,
): Promise<BillingContext> {
  try {
    const response = await admin.graphql(`
      query ChatlivoBillingContext {
        shop {
          plan {
            partnerDevelopment
          }
        }
        currentAppInstallation {
          allSubscriptions(first: 50, sortKey: CREATED_AT) {
            nodes {
              name
              status
              trialDays
              createdAt
            }
          }
        }
      }
    `);
    const { data } = await response.json();

    const isTest =
      IS_TEST_BILLING || data?.shop?.plan?.partnerDevelopment === true;

    type Sub = { name: string; status: string; trialDays: number; createdAt: string };
    const nodes: Sub[] = data?.currentAppInstallation?.allSubscriptions?.nodes ?? [];
    // The first Chatlivo subscription the merchant approved started the trial
    const first = nodes.find(
      (sub) => isPlanKey(sub.name) && STARTED_STATUSES.has(sub.status),
    );

    let trialDaysRemaining = TRIAL_DAYS;
    if (first) {
      const trialEnds =
        new Date(first.createdAt).getTime() + first.trialDays * DAY_MS;
      trialDaysRemaining = Math.max(
        0,
        Math.ceil((trialEnds - Date.now()) / DAY_MS),
      );
    }

    return { isTest, trialDaysRemaining };
  } catch (error) {
    console.error(
      "Billing context query failed:",
      error instanceof Error ? error.message : String(error),
    );
    return { isTest: IS_TEST_BILLING, trialDaysRemaining: TRIAL_DAYS };
  }
}

const plan = (key: PlanKey) => ({
  trialDays: TRIAL_DAYS,
  lineItems: [
    {
      amount: PLANS[key].amount,
      currencyCode: "USD",
      interval: PLANS[key].interval,
    },
  ],
});

export const billingConfig = {
  "Pro Monthly": plan("Pro Monthly"),
  "Pro Yearly": plan("Pro Yearly"),
  "Business Monthly": plan("Business Monthly"),
  "Business Yearly": plan("Business Yearly"),
};

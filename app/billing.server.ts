import { BillingInterval } from "@shopify/shopify-app-react-router/server";

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

import type {
  ActionFunctionArgs,
  HeadersFunction,
  LoaderFunctionArgs,
} from "react-router";
import { useState } from "react";
import { useFetcher, useLoaderData } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import {
  getBillingContext,
  isPlanKey,
  PLAN_KEYS,
  PLANS,
  TRIAL_DAYS,
} from "../billing.server";
import { chatlivoBackendFetch } from "../services/chatlivoBackend.server";

const FREE_PLAN_LABEL = "Free (1 agent, 25 conversations / month)";

function logBackendError(error: unknown) {
  console.warn(
    "Could not reach backend billing API:",
    error instanceof Error ? error.message : String(error),
  );
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin, billing, session } = await authenticate.admin(request);
  const { isTest, trialDaysRemaining } = await getBillingContext(admin);

  // Always ask Shopify; a local record is never proof of an active plan
  const { appSubscriptions } = await billing.check({
    plans: PLAN_KEYS,
    isTest,
  });
  const active = appSubscriptions[0] ?? null;

  // Merchant lands here again after approving a charge: sync right away
  // instead of waiting for the app_subscriptions/update webhook.
  if (active && isPlanKey(active.name)) {
    try {
      await chatlivoBackendFetch("/shopify/billing", {
        shop_domain: session.shop,
        shopify_subscription_id: active.id,
        status: active.status,
        plan_name: PLANS[active.name].plan_name,
        billing_cycle: PLANS[active.name].billing_cycle,
      });
    } catch (error) {
      logBackendError(error);
    }
  }

  // Shopify adds charge_id to the return URL after the approval page. Only
  // used to pick the message; the plan shown comes from billing.check above.
  const returnedFromShopify = new URL(request.url).searchParams.has("charge_id");

  return {
    active: active ? { id: active.id, name: active.name } : null,
    returnResult: returnedFromShopify ? (active ? "approved" : "not_active") : null,
    // Sent from here: the component can't import billing.server
    plans: PLAN_KEYS.map((key) => ({
      key,
      amount: PLANS[key].amount,
      yearly: PLANS[key].billing_cycle === "yearly",
    })),
    trialDays: TRIAL_DAYS,
    trialDaysRemaining,
  };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin, billing, session } = await authenticate.admin(request);
  const { isTest, trialDaysRemaining } = await getBillingContext(admin);
  const formData = await request.formData();
  const intent = formData.get("intent");

  // The browser never says which subscription is active: read it from Shopify
  const { appSubscriptions } = await billing.check({ plans: PLAN_KEYS, isTest });
  const active = appSubscriptions[0] ?? null;

  if (intent === "cancel") {
    if (!active) return { error: "You are already on the Free plan." };

    try {
      await billing.cancel({ subscriptionId: active.id, isTest, prorate: true });
    } catch (error) {
      console.error(
        `Billing cancel failed for ${session.shop}:`,
        error instanceof Error ? error.message : String(error),
      );
      return { error: "We couldn't cancel your plan. Please try again." };
    }

    try {
      await chatlivoBackendFetch("/shopify/billing", {
        shop_domain: session.shop,
        shopify_subscription_id: active.id,
        status: "CANCELLED",
      });
    } catch (error) {
      logBackendError(error);
    }

    return { error: null, cancelled: true };
  }

  const plan = formData.get("plan");
  if (!isPlanKey(plan)) return { error: "Unknown plan." };
  if (active?.name === plan) return { error: "You are already on this plan." };

  // Redirects to Shopify's approval page. Selecting another plan while one is
  // active replaces it once the merchant approves.
  return billing.request({
    plan,
    isTest,
    trialDays: trialDaysRemaining,
    // Uses the client ID, which admin always resolves. The app handle is set
    // in the Partner Dashboard and a wrong handle here showed admin's 404.
    returnUrl: `https://admin.shopify.com/store/${session.shop.replace(".myshopify.com", "")}/apps/${process.env.SHOPIFY_API_KEY}/app/billing`,
  });
};

export default function Billing() {
  const { active, returnResult, plans, trialDays, trialDaysRemaining } =
    useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();

  // One request at a time: no duplicate approval pages or charges
  const busy = fetcher.state !== "idle";
  const pendingPlan = busy ? fetcher.formData?.get("plan") : null;
  const cancelling = busy && fetcher.formData?.get("intent") === "cancel";

  // Asked in the page itself: Shopify admin's sandboxed iframe blocks
  // window.confirm(), which made the cancel button silently do nothing
  const [confirmingCancel, setConfirmingCancel] = useState(false);

  const choose = (plan: string) => fetcher.submit({ plan }, { method: "post" });
  const cancel = () => {
    setConfirmingCancel(false);
    fetcher.submit({ intent: "cancel" }, { method: "post" });
  };
  const cancelled =
    fetcher.state === "idle" && fetcher.data && "cancelled" in fetcher.data;

  const trialNote =
    trialDaysRemaining >= trialDays
      ? `Paid plans start with a ${trialDays}-day free trial.`
      : trialDaysRemaining > 0
        ? `You have ${trialDaysRemaining} day${trialDaysRemaining === 1 ? "" : "s"} of your free trial left.`
        : "Your free trial has been used. Paid plans are billed from the day you subscribe.";

  return (
    <s-page heading="Chatlivo plans">
      {returnResult === "approved" && (
        <s-banner tone="success" heading="Plan activated">
          You are now on {active?.name}.
        </s-banner>
      )}
      {returnResult === "not_active" && (
        <s-banner tone="warning" heading="Plan not activated">
          The charge was not approved, so you are still on the Free plan. You
          can choose a plan again at any time.
        </s-banner>
      )}
      {cancelled && !active && (
        <s-banner tone="success" heading="Plan cancelled">
          This store is now on the Free plan.
        </s-banner>
      )}
      {fetcher.data?.error && (
        <s-banner tone="critical">{fetcher.data.error}</s-banner>
      )}

      <s-section heading="Current plan">
        <s-stack direction="inline" gap="base" alignItems="center">
          <s-badge tone={active ? "success" : "neutral"}>
            {active ? "Active" : "Free"}
          </s-badge>
          <s-text>{active?.name ?? FREE_PLAN_LABEL}</s-text>
        </s-stack>
        <s-paragraph>{trialNote}</s-paragraph>
      </s-section>

      <s-section heading="Choose a plan">
        <s-grid gridTemplateColumns="repeat(auto-fit, minmax(180px, 1fr))" gap="base">
          <s-box
            padding="base"
            border="base"
            borderRadius="base"
            background={active ? "base" : "subdued"}
          >
            <s-stack gap="small-200">
              <s-stack direction="inline" gap="small-200" alignItems="center">
                <s-heading>Free</s-heading>
                {!active && <s-badge tone="success">Current</s-badge>}
              </s-stack>
              <s-text type="strong">$0</s-text>
              <s-text color="subdued">1 agent, 25 conversations / month</s-text>
              <s-button
                variant="secondary"
                disabled={busy || !active}
                onClick={() => setConfirmingCancel(true)}
                accessibilityLabel="Switch to the Free plan"
              >
                {active ? "Switch to Free" : "Current plan"}
              </s-button>
            </s-stack>
          </s-box>
          {plans.map(({ key, amount, yearly }) => {
            const current = active?.name === key;
            return (
              <s-box
                key={key}
                padding="base"
                border="base"
                borderRadius="base"
                background={current ? "subdued" : "base"}
              >
                <s-stack gap="small-200">
                  <s-stack direction="inline" gap="small-200" alignItems="center">
                    <s-heading>{key}</s-heading>
                    {current && <s-badge tone="success">Current</s-badge>}
                  </s-stack>
                  <s-text type="strong">
                    ${amount} / {yearly ? "year" : "month"}
                  </s-text>
                  {yearly && <s-text color="subdued">2 months free</s-text>}
                  <s-button
                    variant={current ? "secondary" : "primary"}
                    disabled={busy || current}
                    loading={pendingPlan === key}
                    onClick={() => choose(key)}
                    accessibilityLabel={`Choose ${key}`}
                  >
                    {current ? "Current plan" : "Choose"}
                  </s-button>
                </s-stack>
              </s-box>
            );
          })}
        </s-grid>
      </s-section>

      {active && (
        <s-section heading="Cancel plan">
          {confirmingCancel ? (
            <s-stack gap="base">
              <s-banner tone="warning" heading={`Cancel ${active.name}?`}>
                This store moves to {FREE_PLAN_LABEL} right away. You can
                choose a paid plan again at any time.
              </s-banner>
              <s-stack direction="inline" gap="base">
                <s-button tone="critical" variant="primary" onClick={cancel}>
                  Yes, cancel plan
                </s-button>
                <s-button onClick={() => setConfirmingCancel(false)}>
                  Keep my plan
                </s-button>
              </s-stack>
            </s-stack>
          ) : (
            <s-stack gap="base">
              <s-paragraph>
                Cancelling moves this store back to {FREE_PLAN_LABEL}.
              </s-paragraph>
              <s-button
                tone="critical"
                disabled={busy}
                loading={cancelling}
                onClick={() => setConfirmingCancel(true)}
              >
                Cancel plan
              </s-button>
            </s-stack>
          )}
        </s-section>
      )}
    </s-page>
  );
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};

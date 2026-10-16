import type {
  ActionFunctionArgs,
  HeadersFunction,
  LoaderFunctionArgs,
} from "react-router";
import { Form, useActionData, useLoaderData, useNavigation } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import {
  IS_TEST_BILLING,
  isPlanKey,
  PLAN_KEYS,
  PLANS,
  TRIAL_DAYS,
} from "../billing.server";
import { chatlivoBackendFetch } from "../services/chatlivoBackend.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { billing, session } = await authenticate.admin(request);

  const { appSubscriptions } = await billing.check({
    plans: PLAN_KEYS,
    isTest: IS_TEST_BILLING,
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
      console.warn("Could not reach backend billing API:", error instanceof Error ? error.message : String(error));
    }
  }

  return {
    active: active ? { id: active.id, name: active.name } : null,
  };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { billing, session } = await authenticate.admin(request);
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "cancel") {
    const subscriptionId = String(formData.get("subscription_id") || "");
    if (!subscriptionId) return { error: "No active plan to cancel." };

    await billing.cancel({
      subscriptionId,
      isTest: IS_TEST_BILLING,
      prorate: true,
    });

    try {
      await chatlivoBackendFetch("/shopify/billing", {
        shop_domain: session.shop,
        shopify_subscription_id: subscriptionId,
        status: "CANCELLED",
      });
    } catch (error) {
      console.warn("Could not reach backend billing API:", error instanceof Error ? error.message : String(error));
    }

    return { error: null };
  }

  const plan = formData.get("plan");
  if (!isPlanKey(plan)) return { error: "Unknown plan." };

  // Throws a redirect to Shopify's charge approval page
  return billing.request({
    plan,
    isTest: IS_TEST_BILLING,
    returnUrl: `https://admin.shopify.com/store/${session.shop.replace(".myshopify.com", "")}/apps/${process.env.SHOPIFY_APP_HANDLE || "chatlivo"}/app/billing`,
  });
};

export default function Billing() {
  const { active } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const busy = navigation.state === "submitting";

  return (
    <div style={{ padding: 40, fontSize: 16, maxWidth: 720 }}>
      <p style={{ fontSize: 18 }}>Chatlivo plans</p>
      <p>
        {active
          ? `Current plan: ${active.name}`
          : "Current plan: Free (1 agent, 25 conversations / month)"}
      </p>
      <p>Paid plans start with a {TRIAL_DAYS}-day free trial.</p>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginTop: 24 }}>
        {PLAN_KEYS.map((key) => (
          <div
            key={key}
            style={{
              border: "1px solid #ccc",
              borderRadius: 8,
              padding: 16,
              minWidth: 150,
            }}
          >
            <h3 style={{ margin: 0 }}>{key}</h3>
            <p>
              ${PLANS[key].amount} /{" "}
              {PLANS[key].billing_cycle === "yearly" ? "year" : "month"}
            </p>
            <Form method="post">
              <input type="hidden" name="plan" value={key} />
              <button
                type="submit"
                disabled={busy || active?.name === key}
                style={{ padding: "8px 16px", fontSize: 16 }}
              >
                {active?.name === key ? "Current plan" : "Choose"}
              </button>
            </Form>
          </div>
        ))}
      </div>

      {active && (
        <Form method="post" style={{ marginTop: 32 }}>
          <input type="hidden" name="intent" value="cancel" />
          <input type="hidden" name="subscription_id" value={active.id} />
          <button
            type="submit"
            disabled={busy}
            style={{ padding: "8px 16px", fontSize: 16 }}
          >
            Cancel plan (back to Free)
          </button>
        </Form>
      )}

      {actionData?.error && (
        <p style={{ color: "#d72c0d", marginTop: 12 }}>{actionData.error}</p>
      )}
    </div>
  );
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};

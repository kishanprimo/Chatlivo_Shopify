# Prompt: Fix Shopify App Store Billing Requirement 1.2.2 for Chatlivo

## Role

Act as a senior Shopify app developer specializing in Shopify's GraphQL
Admin API, app subscriptions, OAuth, embedded apps, and App Store review
compliance.

Your task is to inspect the existing **Chatlivo: AI Chat & Live Chat**
Shopify app codebase and fix the billing implementation so it meets
Shopify App Store requirement **1.2.2 -- Implement Shopify App Pricing
or the Shopify Billing API correctly**.

Do not assume the current framework, routing structure, authentication
flow, or billing implementation. Inspect the repository first and adapt
the solution to the existing architecture.

------------------------------------------------------------------------

## 1. Shopify review feedback

Shopify paused the app submission after repeated failures to resolve a
core requirement.

The reviewer reported this specific problem:

> While testing the billing flow, successfully subscribing to the plan
> redirected us to a "404 - There's no page at this address" error page.

Shopify also requires the Billing API flow to correctly support:

-   Merchants subscribing to a plan.
-   Merchants declining or cancelling a subscription.
-   Merchants uninstalling and reinstalling the app.
-   Correctly requesting approval for charges again on reinstall when
    required.
-   Merchants transitioning between plans seamlessly.

App details:

-   **App name:** Chatlivo: AI Chat & Live Chat
-   **Shopify review requirement:** 1.2.2
-   **Review reference:** 143204
-   **Reported issue:** Subscription approval redirects to a 404 page.
-   **Review status in the email:** Paused until November 11, 2026.
    Verify the current status in the Partner Dashboard; do not assume it
    is still paused.

------------------------------------------------------------------------

## 2. Primary objective

Fix the complete Shopify subscription lifecycle, with particular focus
on the post-approval redirect.

After a merchant approves a subscription on Shopify, the merchant must
return to a valid Chatlivo app route. The app must then verify the
subscription status with Shopify and show the correct plan/status in the
UI.

Do not merely hide the 404 page or redirect every response to the
dashboard. Correctly implement and validate the billing lifecycle.

------------------------------------------------------------------------

## 3. Initial repository investigation

Before changing code:

1.  Inspect the project structure, package files, environment variable
    names, app configuration, routing, OAuth/session handling, and
    existing billing code.
2.  Identify whether the app uses:
    -   Shopify GraphQL Admin API or legacy REST billing endpoints.
    -   Shopify App Bridge.
    -   Shopify's official app framework or a custom integration.
    -   Node.js, Laravel, Next.js, or another backend/frontend stack.
3.  Find all routes involved in:
    -   Plan selection.
    -   Subscription creation.
    -   Shopify approval/confirmation.
    -   Billing callback or return handling.
    -   Subscription status checks.
    -   Cancellation.
    -   App uninstall webhooks.
    -   Reinstallation and OAuth.
4.  Trace the exact redirect URL returned by Shopify and determine why
    it resolves to a 404.
5.  Check whether the callback route is registered, reachable,
    authenticated correctly, and compatible with the app's embedded-app
    navigation.
6.  Review server logs and existing tests if available.

Produce a short diagnosis with the relevant file paths and root cause
before implementing changes.

**Important:** Do not invent route names, environment variables, API
versions, or configuration values. Reuse the project's actual
conventions. Do not expose access tokens, client secrets, API keys, or
other credentials in logs or output.

------------------------------------------------------------------------

## 4. Required billing implementation

Use Shopify's currently supported billing approach for this app and its
configured API version. Prefer the Shopify GraphQL Admin API where
appropriate. Check current Shopify documentation before relying on
deprecated endpoints or old examples.

### A. Create a subscription

Implement or correct the subscription creation flow.

Requirements:

1.  Merchant selects a plan in Chatlivo.
2.  Backend validates the merchant's authenticated Shopify session.
3.  Backend creates the subscription using the correct Shopify API
    mutation and plan configuration.
4.  Backend obtains Shopify's confirmation URL.
5.  Backend returns that URL safely to the frontend.
6.  Frontend redirects the merchant to Shopify's confirmation/approval
    page using the navigation method appropriate for the app's embedded
    or non-embedded setup.
7.  Do not redirect to a locally constructed or hardcoded Shopify
    approval URL.

Use the actual plan configuration already present in the project. If
plan details are missing or inconsistent, report that and ask for
confirmation instead of inventing prices, billing intervals, trial
periods, or plan names.

### B. Handle subscription approval and return

This is the highest-priority fix.

1.  Identify the exact return URL configured when creating the
    subscription.
2.  Ensure it points to a real, registered backend/frontend route.
3.  Ensure the route works in production and does not depend on a
    development-only URL.
4.  Handle Shopify's returned parameters according to the current
    Shopify API flow.
5.  Validate the merchant/session and verify the subscription with
    Shopify's API. Do not trust query parameters alone as proof of
    payment or approval.
6.  Persist the verified subscription ID, plan, status, and relevant
    billing dates/terms using the existing database conventions.
7.  Redirect the merchant to a valid Chatlivo page that exists.
8.  Show a clear success, pending, declined, or error state.
9.  Prevent redirect loops and avoid returning a 404 for valid billing
    outcomes.
10. Ensure embedded-app navigation works correctly if the app is
    embedded.

Do not mark a subscription as active simply because the merchant visited
the callback URL. Only use a verified Shopify subscription status.

### C. Declined, cancelled, and expired subscriptions

Handle all supported billing outcomes:

-   Merchant approves the subscription.
-   Merchant declines the subscription.
-   Merchant cancels an existing subscription.
-   Subscription is pending or otherwise not active.
-   Subscription expires or is replaced, where applicable.

Keep the app's entitlements consistent with the verified subscription
status. Do not grant paid features to merchants whose subscription is
not active.

### D. Uninstall and reinstall

Implement a reliable lifecycle:

1.  Verify the app's uninstall webhook configuration and handler.
2.  On uninstall, clean up or invalidate app session/access data
    securely according to Shopify requirements and the app's
    data-retention obligations.
3.  Preserve only the billing/customer records that the app is legally
    and technically permitted to retain.
4.  On reinstall, complete OAuth and establish a new valid session.
5.  Query Shopify for the merchant's current subscription state.
6.  If a valid active subscription exists, restore the correct plan and
    entitlements without creating a duplicate charge.
7.  If Shopify requires the merchant to approve a new charge, initiate
    the correct approval flow.
8.  Never assume that a database record alone proves that a subscription
    is currently active.

### E. Plan changes

Support transitions between plans:

-   Free to paid.
-   Paid to a higher plan.
-   Paid to a lower plan.
-   Paid to free, if supported by the existing product model.
-   Cancellation and resubscription.

Use Shopify's current rules for subscription replacement, proration,
confirmation, and cancellation. Clearly handle any required merchant
approval. Avoid duplicate active subscriptions and inconsistent
entitlements.

------------------------------------------------------------------------

## 5. Security and reliability requirements

-   Authenticate every billing operation using the app's established
    Shopify session mechanism.
-   Verify Shopify webhooks using the correct HMAC verification process.
-   Make webhook processing idempotent.
-   Do not trust merchant IDs, shop domains, subscription IDs, or status
    values supplied by the browser without server-side validation.
-   Validate and safely construct redirect destinations; prevent open
    redirects.
-   Do not expose Shopify access tokens or secrets to the frontend.
-   Use safe database transactions where multiple records must change
    together.
-   Handle Shopify API errors, network failures, rate limits, and
    retryable webhook deliveries.
-   Add structured logs without secrets or sensitive customer data.
-   Preserve existing app functionality and avoid unrelated refactoring.

------------------------------------------------------------------------

## 6. Testing requirements

Add or update automated tests using the test framework already present
in the repository. Mock Shopify API responses where appropriate; do not
use a real merchant account for automated tests.

Test at least these scenarios:

  -----------------------------------------------------------------------
  Scenario                            Expected result
  ----------------------------------- -----------------------------------
  New merchant selects a paid plan    Subscription is created

  Shopify returns a confirmation URL  Merchant is redirected correctly

  Merchant approves the plan          Callback succeeds; no 404

  Callback is opened with invalid or  Safe error handling; no false
  missing data                        activation

  Merchant declines approval          App does not grant paid access

  Merchant cancels a subscription     Entitlements update correctly

  Merchant reinstalls with an active  Existing subscription is detected;
  subscription                        no duplicate charge

  Merchant reinstalls without an      Correct subscription/approval flow
  active subscription                 is offered

  Merchant upgrades or downgrades     Plan transition follows Shopify's
                                      current rules

  Webhook is delivered more than once Processing remains idempotent

  Shopify API is temporarily          Graceful error and retry behavior
  unavailable                         
  -----------------------------------------------------------------------

Also perform a manual end-to-end test on a Shopify development/test
store:

1.  Install the app.
2.  Select a paid plan.
3.  Approve the subscription on Shopify.
4.  Confirm the merchant returns to Chatlivo successfully.
5.  Confirm the subscription is verified and persisted.
6.  Refresh the app and confirm the plan remains correct.
7.  Cancel the subscription and verify entitlements.
8.  Uninstall and reinstall the app.
9.  Confirm the correct subscription state is recovered.
10. Test plan changes.

Never claim a scenario passed unless it was actually executed and its
result observed.

------------------------------------------------------------------------

## 7. Shopify documentation and compliance

Use current official Shopify documentation for:

-   App pricing and billing requirements.
-   GraphQL Admin API subscription creation and cancellation.
-   Subscription confirmation and return behavior.
-   OAuth and embedded-app navigation.
-   App uninstall webhooks.
-   App review requirements.

Start with the official Shopify developer documentation:

-   https://shopify.dev/docs/apps/billing
-   https://shopify.dev/docs/api/admin-graphql
-   https://shopify.dev/docs/apps/build/authentication-authorization
-   https://shopify.dev/docs/apps/build/webhooks

Documentation URLs and API behavior can change. Confirm the relevant
documentation for the app's configured API version before
implementation.

------------------------------------------------------------------------

## 8. Deliverables

After inspecting and fixing the project, provide:

1.  **Root-cause report**
    -   Why Shopify's subscription approval flow ended at a 404.
    -   Exact route/configuration or code responsible.
2.  **Files changed**
    -   List every modified or added file and explain its purpose.
3.  **Implementation summary**
    -   Subscription creation.
    -   Approval callback/return.
    -   Status verification and persistence.
    -   Cancellation.
    -   Reinstall handling.
    -   Plan transitions.
    -   Webhook handling.
4.  **Database changes**
    -   Migrations and schema changes, if required.
    -   Explain how existing merchant subscription records are handled.
5.  **Environment/configuration changes**
    -   List required variable names and configuration updates.
    -   Never include real secret values.
6.  **Tests**
    -   Commands executed.
    -   Actual results.
    -   Any scenarios not tested and why.
7.  **Manual Shopify test instructions**
    -   Exact steps to verify the complete flow on a development store.
8.  **Review readiness checklist**
    -   Confirm which Shopify requirements are addressed.
    -   Identify anything still requiring manual configuration or
        Shopify Partner Dashboard action.

------------------------------------------------------------------------

## 9. Implementation rules

-   Work with the existing codebase; do not replace the application
    architecture.
-   Do not rewrite unrelated modules.
-   Do not introduce a second billing system.
-   Do not use an external payment gateway as a substitute for Shopify
    App Store billing when Shopify's billing requirements apply.
-   Do not hardcode production domains or callback URLs.
-   Do not use deprecated API examples without confirming their current
    support.
-   Do not fake successful billing responses.
-   Do not mark subscriptions active without server-side verification.
-   Do not delete existing merchant data or migrations without
    explaining the impact.
-   Keep changes focused, maintainable, typed where the project supports
    TypeScript, and consistent with existing code style.
-   If a critical detail is missing, inspect the repository first. Ask a
    focused question only when the missing information cannot be
    determined from the codebase or Shopify configuration.

## Final goal

Make Chatlivo's Shopify billing lifecycle reliable and compliant so a
merchant can subscribe, approve, return to the app without a 404,
cancel, reinstall, and change plans correctly.

The most important acceptance criterion is:

**After Shopify subscription approval, the merchant must land on a valid
Chatlivo route, and the backend must verify the subscription with
Shopify before enabling paid features.**

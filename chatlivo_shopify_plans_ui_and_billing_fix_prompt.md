# Chatlivo Shopify App – Tidio-Style Plans Page + Shopify Billing Fix

## Role
Act as a senior Shopify app developer specializing in embedded apps, Shopify Admin GraphQL API, App Bridge, OAuth, subscriptions, webhooks, and App Store review compliance.

Inspect the existing **Chatlivo: AI Chat & Live Chat** repository first. Implement a Tidio-inspired Plans page inside Shopify Admin and fix the Shopify billing review issue. Adapt to the existing framework, routes, database, and coding conventions. Do not replace the architecture or refactor unrelated modules.

## 1. Shopify review feedback
Shopify paused the app submission under requirement **1.2.2 – Implement Shopify App Pricing or the Shopify Billing API correctly**.

The reviewer reported:
> While testing the billing flow, successfully subscribing to the plan redirected us to a "404 - There's no page at this address" error page.

Shopify expects merchants to be able to subscribe, approve or decline charges, cancel subscriptions, uninstall/reinstall without duplicate charges, re-approve charges when required, and transition between plans.

- App: Chatlivo: AI Chat & Live Chat
- Review reference: 143204
- Email pause end date: November 11, 2026. Check the current status in Partner Dashboard; do not assume it remains paused.

## 2. Tidio-inspired Plans page inside Shopify Admin
Use the user's supplied Tidio screenshot as the visual reference. Build a clean, responsive Plans page within the installed Chatlivo embedded app. Do not copy Tidio branding.

### Page heading and current plan
Show:
- Heading: **Chatlivo plans**
- Current plan, e.g. **Current plan: Free (1 agent, 25 conversations / month)**
- Note: **Paid plans start with a 7-day free trial.**

### Plan cards
The screenshot shows these reference plan names and prices:

| Plan | Reference price |
|---|---:|
| Pro Monthly | $12 / month |
| Pro Yearly | $120 / year |
| Business Monthly | $24 / month |
| Business Yearly | $240 / year |

Each card should show plan name, price, billing interval, and a **Choose** button. Indicate the merchant's current plan. Add feature summaries only when actual feature limits are known.

The screenshot's Free plan example is **1 agent, 25 conversations / month**. The screenshot also says paid plans start with a 7-day free trial.

**Pricing safety:** These values are transcribed from the screenshot and are reference values only—not proof of final approved commercial pricing or configured Shopify subscription amounts. Inspect the existing plan configuration, Shopify Partner Dashboard, and backend billing code. If values differ or are missing, report the mismatch and ask for confirmation. Do not silently change prices, intervals, trials, or limits. Keep frontend plan cards and backend billing logic driven by one trusted source of truth.

### UI behavior
- Load the merchant's current plan and verified subscription status from the backend.
- Show loading, empty, success, and error states.
- Disable/show progress on a Choose button while processing.
- Prevent repeated clicks from creating duplicate subscriptions.
- Do not create a charge when the merchant selects their current plan.
- Use the correct Shopify plan-change flow when a different plan is selected.
- Explain the 7-day trial only if the actual Shopify subscription configuration supports it.
- Use existing Shopify Polaris/design system if available; do not add a redundant UI framework.
- Keep the app responsive, accessible, keyboard-friendly, and correctly embedded in Shopify Admin.

## 3. Inspect the repository before coding
Inspect:
1. Project structure, package files, framework and versions.
2. Shopify app configuration, API version, OAuth/session handling, App Bridge and Polaris usage.
3. Current pricing page, plan definitions, billing routes, database models, and webhooks.
4. Subscription creation, confirmation/return callback, cancellation, status checks, uninstall, and reinstall logic.
5. The exact return URL passed to Shopify and why it currently leads to a 404.
6. Existing plan prices/intervals/trial settings and compare them with the screenshot reference.

First provide a concise diagnosis with exact file paths and root cause. Do not invent route names, environment variables, API versions, prices, or configuration. Never print secrets or access tokens.

## 4. Billing implementation

Use Shopify's currently supported billing approach for the app's configured API version. Verify current official documentation; prefer the supported GraphQL Admin API approach where appropriate.

### A. Subscription creation
When a merchant clicks Choose:
1. Frontend sends a trusted plan identifier to backend.
2. Backend authenticates the merchant's Shopify session.
3. Backend validates the plan and obtains price/interval from server-side configuration, never browser-supplied price.
4. Backend creates the subscription using the appropriate Shopify GraphQL Admin API mutation.
5. Backend returns Shopify's actual confirmation URL.
6. Frontend navigates to that URL using the correct embedded-app navigation method.
7. Prevent duplicate requests and duplicate charges.

Do not construct Shopify confirmation URLs manually.

### B. Approval callback / return URL – highest priority
Fix the reported 404:
1. Identify the exact return URL passed during subscription creation.
2. Ensure it points to a real registered route in production.
3. Confirm domain, HTTPS, path, deployment routing, and embedded-app navigation are correct.
4. Handle returned parameters according to the current Shopify API behavior.
5. Validate merchant/session context.
6. Verify subscription state server-side with Shopify; do not trust query parameters alone.
7. Persist verified subscription ID, plan, status, and relevant billing dates/terms using existing database conventions.
8. Redirect to a valid Chatlivo route that exists.
9. Show clear approved, pending, declined, or error feedback.
10. Prevent redirect loops and 404s.
11. Never grant paid entitlements just because the browser visited the callback.

### C. Subscription state and entitlements
- Treat Shopify as the source of truth for Shopify subscription status.
- Keep local records synchronized with verified Shopify state.
- Grant paid features only when the verified status permits it.
- Handle pending, active, cancelled, declined, expired, and replaced states as applicable.
- Handle Shopify API errors without incorrectly treating the subscription as cancelled.

### D. Cancellation
Implement a clear cancellation path if supported by the product. Cancel server-side through the supported Shopify API, verify the resulting state, update local plan/entitlements, and show the merchant the result.

### E. Uninstall and reinstall
1. Verify uninstall webhook configuration and signature validation.
2. On uninstall, invalidate session credentials securely and follow Shopify data-retention requirements.
3. Retain only records the app is permitted to retain.
4. On reinstall, complete OAuth and establish a fresh session.
5. Query Shopify for current subscription state.
6. Restore a valid active subscription without creating a duplicate charge.
7. If fresh approval is required, initiate the correct billing flow.
8. Never treat a stale local record as proof of an active subscription.

### F. Plan changes
Support product-supported transitions such as Free to paid, Pro Monthly to Pro Yearly, Pro to Business, monthly/yearly changes, upgrades, downgrades, and paid-to-Free/cancellation if offered. Follow Shopify's current replacement, proration, trial, confirmation, and cancellation rules. Avoid duplicate active subscriptions and keep entitlements consistent with verified state.

## 5. Intended end-to-end flow

```text
Shopify Admin → Open Chatlivo → Plans page loads
       → Backend returns current verified plan
       → Merchant clicks Choose
       → Backend validates merchant and plan
       → Shopify subscription is created
       → Merchant opens Shopify confirmationUrl
       → Merchant approves or declines
       → Shopify returns to registered returnUrl
       → Backend verifies subscription with Shopify
       → Persist verified state
       → Redirect to valid Chatlivo route
       → Show correct plan and entitlements
```

## 6. Security and reliability
- Authenticate every billing operation.
- Verify webhook HMAC signatures.
- Make webhook processing idempotent.
- Do not trust shop domains, merchant IDs, plan IDs, prices, subscription IDs, or status values supplied by the browser.
- Prevent open redirects.
- Never expose access tokens/secrets to frontend code.
- Use transactions where related database changes must be atomic.
- Handle API errors, rate limits, network failures, and webhook retries.
- Log diagnostics without secrets or unnecessary customer data.
- Preserve existing app functionality.

## 7. Testing
Use the project's existing test framework and mock Shopify API calls where appropriate.

| Scenario | Expected result |
|---|---|
| Open Chatlivo in Shopify Admin | Embedded Plans page loads |
| Current-plan request succeeds | Correct verified plan shown |
| Choose a paid plan | Intended subscription created |
| Shopify returns confirmation URL | Correct navigation occurs |
| Merchant approves | Return route works; no 404 |
| Merchant declines | No paid access |
| Invalid callback data | Safe error; no false activation |
| Repeated Choose clicks | No duplicate charge |
| Choose current plan | No duplicate charge |
| Cancel subscription | State and entitlements update |
| Reinstall with active subscription | Existing subscription detected |
| Reinstall without active subscription | Correct approval flow offered |
| Change plan | Shopify transition handled correctly |
| Duplicate webhook | Idempotent processing |
| Shopify API unavailable | Graceful error/retry behavior |

Manual test on a Shopify development store:
1. Install Chatlivo and open it from Shopify Admin.
2. Confirm the Plans page and current plan load.
3. Select a paid plan and approve it on Shopify.
4. Confirm return to a valid Chatlivo page with no 404.
5. Confirm backend verification and persistence.
6. Refresh/reopen and confirm plan remains correct.
7. Cancel and verify entitlements.
8. Uninstall/reinstall and verify billing state.
9. Test a plan transition.

Never claim a test passed unless it was actually executed and observed.

## 8. Official Shopify documentation
Use current official documentation and verify compatibility with the app's configured API version:
- https://shopify.dev/docs/apps/billing
- https://shopify.dev/docs/api/admin-graphql
- https://shopify.dev/docs/apps/build/authentication-authorization
- https://shopify.dev/docs/apps/build/webhooks

Do not rely on deprecated API examples without confirming current support.

## 9. Deliverables
After implementation, provide:
1. Root-cause report explaining the 404 with exact route/config/code paths.
2. Plans UI files/components changed and embedded navigation behavior.
3. Billing implementation summary: create, approval return, verification, cancellation, reinstall, plan transitions, webhooks.
4. Actual configured plan names, prices, intervals, trials, and limits; flag mismatches with screenshot values.
5. Database migrations/schema changes and impact on existing records.
6. Required environment/configuration changes (names only; never secret values).
7. Tests/commands executed and actual results; list anything untested.
8. Manual Shopify development-store test guide.
9. Review-readiness checklist and remaining Partner Dashboard actions.

## 10. Implementation rules
- Inspect first; implement second.
- Work within existing architecture and conventions.
- Do not rewrite unrelated modules or introduce a second billing system.
- Do not use an external payment gateway as a substitute for Shopify billing when Shopify requirements apply.
- Do not hardcode production domains or callback URLs.
- Do not fake billing success or activate paid features without Shopify verification.
- Do not silently change prices, trial periods, or plan limits.
- Do not delete existing data/migrations without explaining impact.
- Ask a focused question if a critical value cannot be determined from the repository or Shopify configuration.

## Final acceptance criteria
The task is complete only when:
1. Chatlivo displays a clean Tidio-inspired Plans page inside Shopify Admin.
2. The page shows the merchant's actual current plan and configured plan options.
3. Choose starts the correct Shopify subscription approval flow.
4. After approval, the merchant returns to a valid Chatlivo route with no 404.
5. Backend verifies the subscription with Shopify before enabling paid features.
6. Cancellation, reinstall, and plan transitions behave correctly.
7. Tests and manual verification results are honestly documented.

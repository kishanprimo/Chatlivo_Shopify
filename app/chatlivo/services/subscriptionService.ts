import apiClient from "./apiClient";
import { ActivePlanRes, SubscriptionPlansRes } from "@/app/store/types/ResTypes";

export interface VisitorUsageStatus {
  monthly_limit: number;
  used_visitors: number;
  remaining_visitors: number;
  limit_reached: boolean;
  plan_name: string;
}

export type EntitlementFeature =
  | "number_of_agents"
  | "monthly_chat_visitors"
  | "numbers_of_domains"
  | "numbers_of_tags";

export interface EntitlementResult {
  allowed: boolean;
  current_usage: number;
  plan_limit: number;
  remaining: number;
  plan_name: string;
  is_unlimited: boolean;
  upgrade_required: boolean;
  message?: string;
}

export const subscriptionService = {
  getSubscriptionPlans: () =>
    apiClient.get<SubscriptionPlansRes>("/subscription_plan/get-subscription-plan").then((r) => r.data),

  getPublicSubscriptionPlans: () =>
    apiClient.get<SubscriptionPlansRes>("/subscription_plan/public").then((r) => r.data),

  getActivePlan: () =>
    apiClient.get<ActivePlanRes>("/subscription_plan/active-plan").then((r) => r.data),

  getVisitorUsageStatus: () =>
    apiClient.get<{ success: boolean; data: VisitorUsageStatus }>("/subscription_plan/visitor-usage-status").then((r) => r.data),

  checkEntitlement: (feature: EntitlementFeature, amount = 1) =>
    apiClient
      .get<{ success: boolean; data: EntitlementResult }>("/subscription_plan/entitlement", {
        params: { feature, amount },
      })
      .then((r) => r.data.data),
};

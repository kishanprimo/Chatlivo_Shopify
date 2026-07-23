"use client";
import { useQuery } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { subscriptionService } from "@/services";
import type { EntitlementFeature } from "@/services/subscriptionService";

export const useSubscriptionPlans = () => {
  const token = Cookies.get("chat_saas_auth_token");
  return useQuery({
    queryKey: ["/subscription_plan/get-subscription-plan"],
    queryFn: () => subscriptionService.getSubscriptionPlans(),
    enabled: !!token,
    staleTime: 5 * 60 * 1000,
  });
};

// Public, unauthenticated variant for the marketing pricing page — no token gating.
export const usePublicSubscriptionPlans = () => {
  return useQuery({
    queryKey: ["/subscription_plan/public"],
    queryFn: () => subscriptionService.getPublicSubscriptionPlans(),
    staleTime: 5 * 60 * 1000,
  });
};

export const useEntitlement = (feature: EntitlementFeature, amount = 1) => {
  const token = Cookies.get("chat_saas_auth_token");
  return useQuery({
    queryKey: ["entitlement", feature, amount],
    queryFn: () => subscriptionService.checkEntitlement(feature, amount),
    enabled: !!token,
    staleTime: 30 * 1000,
  });
};

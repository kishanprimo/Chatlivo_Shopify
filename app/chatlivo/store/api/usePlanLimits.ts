"use client";
import { useActivePlan } from "./useActivePlan";
import { SubscriptionPlansData } from "@/app/store/types/ResTypes";

export interface PlanLimits {
  plan: SubscriptionPlansData | null;
  isLoading: boolean;
  canAddTag: boolean;
  canAddAgent: boolean;
  canAddShortcut: (currentCount: number) => boolean;
  hasWhatsApp: boolean;
  hasBlockVisitor: boolean;
  hasOfficeHours: boolean;
}

function isUnlimited(value: number): boolean {
  return value === -1;
}

function withinLimit(current: number, limit: number): boolean {
  if (isUnlimited(limit)) return true;
  return current < limit;
}

export function usePlanLimits(): PlanLimits {
  const { data, isLoading } = useActivePlan();
  const plan = data?.data?.plan ?? null;  
  return {
    plan,
    isLoading,
    canAddTag: plan ? (isUnlimited(plan.numbers_of_tags) || plan.numbers_of_tags > 0) : false,
    canAddAgent: plan ? (isUnlimited(plan.numbers_of_agents) || plan.numbers_of_agents > 0) : false,
    canAddShortcut: (currentCount: number) =>
      plan ? withinLimit(currentCount, plan.max_shortcuts) : false,
    hasWhatsApp: plan?.whatsapp_channel === true,
    hasBlockVisitor: plan?.block_visitor === true,
    hasOfficeHours: plan?.office_hours === true,
  };
}

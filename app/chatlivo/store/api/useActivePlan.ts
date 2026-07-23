"use client";
import { useQuery } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { subscriptionService } from "@/services";
import { ActivePlanRes } from "@/app/store/types/ResTypes";

export const useActivePlan = () => {
  const token = Cookies.get("chat_saas_auth_token");

  return useQuery<ActivePlanRes, Error>({
    queryKey: ["/subscription_plan/active-plan"],
    queryFn: () => subscriptionService.getActivePlan(),
    enabled: !!token,
    staleTime: 5 * 60 * 1000,
  });
};

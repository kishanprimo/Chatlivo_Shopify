"use client";
import { useEffect } from "react";
import { useUserProfile } from "@/app/store/api/useUserProfile";
import { useNavProgress } from "@/app/hooks/useNavProgress";

// Billing and subscription management are owner-only — Admin gets owner-level
// access everywhere else, but must not reach these pages even via direct URL.
export function useRequireOwner() {
  const { data, isLoading } = useUserProfile();
  const { push } = useNavProgress();
  const role = data?.data?.role;

  useEffect(() => {
    if (isLoading) return;
    if (role && role !== "owner") {
      push("/dashboard");
    }
  }, [isLoading, role, push]);

  return { isLoading, isOwner: role === "owner" };
}

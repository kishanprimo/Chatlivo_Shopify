"use client";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

export function useNavProgress() {
  const router = useRouter();

  const push = useCallback(
    (href: string) => {
      window.dispatchEvent(new Event("nav-start"));
      router.push(href);
    },
    [router],
  );

  return { push };
}

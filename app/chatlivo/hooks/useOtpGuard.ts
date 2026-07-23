"use client";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Cookies from "js-cookie";

export const useOtpGuard = () => {
  const router = useRouter();
  const rawPathname = usePathname();
  const pathname = rawPathname.replace(/\/+$/, "") || "/";

  useEffect(() => {
    window.history.pushState(null, "", window.location.href);
    const handlePopState = () => {
      window.history.pushState(null, "", window.location.href);
      router.replace("/auth/verify-otp");
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [router]);

  useEffect(() => {
    if (pathname === "/auth/register" || pathname === "/auth/login") {
      window.history.replaceState(null, "", pathname);
    }
  }, [pathname]);
}

export const getOtpEmail = (): string => {
  return Cookies.get("otp_pending_email") || "";
}

export const clearOtpEmail = () => {
  Cookies.remove("otp_pending_email");
}
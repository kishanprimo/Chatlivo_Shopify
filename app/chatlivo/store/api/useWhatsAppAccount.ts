"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/services/apiClient";

// ── Types ──────────────────────────────────────────────────────────────────────

export interface WhatsAppAccount {
  id: number;
  phone_number_id: string;
  business_account_id: string;
  phone_number: string;
  display_name: string;
  business_name?: string;
  app_name?: string;
  access_token: string;
  webhook_verify_token: string;
  is_active: boolean;
  status: string;
  connected: boolean;
  createdAt: string;
}

export interface WhatsAppAccountStatusRes {
  success: boolean;
  message: string;
  data: WhatsAppAccount | { connected: false };
}

export interface WhatsAppAccountPayload {
  phone_number_id: string;
  business_account_id: string;
  phone_number: string;
  display_name?: string;
  access_token: string;
  webhook_verify_token: string;
  is_active?: boolean;
  status?: string;
}

export interface DisconnectWhatsAppAccountRes {
  success: boolean;
  message: string;
}

export interface EmbeddedSignupPayload {
  code: string;
  redirect_uri?: string;
  session_info_phone_number_id?: string;
  session_info_waba_id?: string;
  session_info_business_manager_id?: string;
  catalog_ids?: string[];
}

// ── Account status ─────────────────────────────────────────────────────────────

export const useWhatsAppAccountStatus = (options?: { enabled?: boolean }) => {
  return useQuery<WhatsAppAccountStatusRes>({
    queryKey: ["whatsapp-account-status"],
    queryFn: () =>
      apiClient
        .get<WhatsAppAccountStatusRes>("/whatsapp/account/status")
        .then((r) => r.data),
    staleTime: 60 * 1000,
    retry: false,
    enabled: options?.enabled ?? true,
  });
};

// ── Save / update account (manual connection) ─────────────────────────────────

export const useSaveWhatsAppAccount = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: WhatsAppAccountPayload) =>
      apiClient
        .post("/whatsapp/account", payload)
        .then((r) => r.data),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["whatsapp-account-status"] }),
  });
};

// ── Disconnect account (deactivate — keeps the row, does not delete it) ───────

export const useDisconnectWhatsAppAccount = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () =>
      apiClient
        .post<DisconnectWhatsAppAccountRes>("/whatsapp/account/disconnect")
        .then((r) => r.data),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["whatsapp-account-status"] }),
  });
};

// ── Embedded signup connect (Facebook OAuth flow) ─────────────────────────────

export const useEmbeddedSignupConnect = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: EmbeddedSignupPayload) =>
      apiClient
        .post("/whatsapp/embedded-signup/connect", payload)
        .then((r) => r.data),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["whatsapp-account-status"] }),
  });
};

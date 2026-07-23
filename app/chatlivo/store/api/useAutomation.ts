"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { automationService } from "@/services";
import type { Automation } from "@/app/store/types/automation.type";

export type { Automation };

export const useAutomationList = () => {
  const token = Cookies.get("chat_saas_auth_token");

  return useQuery<Automation[]>({
    queryKey: ["automations"],
    queryFn: () => automationService.list(),
    enabled: !!token,
  });
};

export const useAutomation = (id: number | null) => {
  const token = Cookies.get("chat_saas_auth_token");

  return useQuery<Automation>({
    queryKey: ["automation", id],
    queryFn: () => automationService.get(id!),
    enabled: !!token && !!id,
  });
};

export const useCreateAutomation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      name: string;
      description: string;
      trigger_type: "manual" | "on_chat_start" | "on_message" | "scheduled" | "chat_start";
      is_active?: boolean;
      metadata?: any;
    }) => automationService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["automations"] });
      // Invalidate entitlement so limit badge + modal reflect the new count immediately
      queryClient.invalidateQueries({ queryKey: ["entitlement", "number_of_agents"] });
    },
  });
};

export const useUpdateAutomation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      id: number;
      name?: string;
      description?: string;
      trigger_type?: "manual" | "on_chat_start" | "on_message" | "scheduled" | "chat_start";
      is_active?: boolean;
      metadata?: any;
    }) => automationService.update(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["automations"] });
      queryClient.invalidateQueries({ queryKey: ["automation", variables.id] });
    },
  });
};

export const useDeleteAutomation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => automationService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["automations"] });
      // Invalidate entitlement so freed slot is reflected immediately
      queryClient.invalidateQueries({ queryKey: ["entitlement", "number_of_agents"] });
    },
  });
};

export const useSaveFlow = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      automation_id: number;
      nodes: any[];
      edges: any[];
      files?: File[];
    }) => automationService.saveFlow(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["automation", variables.automation_id] });
      queryClient.invalidateQueries({ queryKey: ["automations"] });
    },
  });
};

export const useUpdateNodePosition = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { node_id: number; position_x: number; position_y: number }) =>
      automationService.updateNodePosition(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["automations"] });
    },
  });
};

export const useUpdateNodeConfig = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { node_id: number; config: any }) =>
      automationService.updateNodeConfig(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["automations"] });
    },
  });
};

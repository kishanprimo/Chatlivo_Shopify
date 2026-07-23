import apiClient from "./apiClient";
import { Automation } from "@/app/store/api/useAutomation";

interface AutomationListResponse {
  success: boolean;
  message: string;
  data: Automation[];
  statusCode: number;
}

interface AutomationResponse {
  success: boolean;
  message: string;
  data: Automation;
  statusCode: number;
}

export interface CreateAutomationPayload {
  name: string;
  description: string;
  trigger_type: "manual" | "on_chat_start" | "on_message" | "scheduled" | "chat_start";
  is_active?: boolean;
  metadata?: unknown;
}

export interface UpdateAutomationPayload {
  id: number;
  name?: string;
  description?: string;
  trigger_type?: "manual" | "on_chat_start" | "on_message" | "scheduled" | "chat_start";
  is_active?: boolean;
  metadata?: unknown;
}

export interface SaveFlowPayload {
  automation_id: number;
  nodes: unknown[];
  edges: unknown[];
}

export const automationService = {
  list: () =>
    apiClient.get<AutomationListResponse>("/automation/list").then((r) => r.data.data || []),

  get: (id: number) =>
    apiClient.get<AutomationResponse>(`/automation/get?id=${id}`).then((r) => r.data.data),

  create: (payload: CreateAutomationPayload) =>
    apiClient.post<AutomationResponse>("/automation/create", payload).then((r) => r.data.data),

  update: (payload: UpdateAutomationPayload) =>
    apiClient.put<AutomationResponse>("/automation/update", payload).then((r) => r.data.data),

  delete: (id: number) =>
    apiClient.delete("/automation/delete", { data: { id } }).then((r) => r.data),

  saveFlow: (data: SaveFlowPayload) => {
    const formData = new FormData();
    formData.append("automation_id", data.automation_id.toString());

    const nodesWithoutFiles = (data.nodes as Array<{
      config?: { file?: File; fileIndex?: number };
    }>).map((node, index) => {
      if (node.config?.file && node.config.file instanceof File) {
        formData.append(`node_${index}_file`, node.config.file);
        return {
          ...node,
          config: { ...node.config, fileIndex: index, file: undefined },
        };
      }
      return node;
    });

    formData.append("nodes", JSON.stringify(nodesWithoutFiles));
    formData.append("edges", JSON.stringify(data.edges));

    return apiClient
      .post("/automation/save-flow", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data);
  },

  updateNodePosition: (data: { node_id: number; position_x: number; position_y: number }) =>
    apiClient.patch("/automation/node/position", data).then((r) => r.data),

  updateNodeConfig: (data: { node_id: number; config: unknown }) =>
    apiClient.patch("/automation/node/config", data).then((r) => r.data),
};

import apiClient from "./apiClient";
import {
  AccountSettingsRes,
  AgentListRes,
  OnlineAgentsRes,
  UpdateAgentRes,
} from "@/app/store/types/ResTypes";

export interface UpdateOrganizationPayload {
  domain?: string;
  time_zone?: string;
  conversation_history?: number;
  powered_by?: string;
  powered_by_url?: string;
  whatsapp_widget_enabled?:boolean;
  office_hours?: Array<{
    day: string;
    status: boolean;
    start_time: string;
    end_time: string;
  }>;
}

export const organizationService = {
  getMyOrgs: () =>
    apiClient.get<AccountSettingsRes>("/organization").then((r) => r.data),

  update: (payload: UpdateOrganizationPayload) =>
    apiClient
      .put<AccountSettingsRes>("/organization/update", payload)
      .then((r) => r.data),

  getAllAgents: (pagination: {
    page_no: number;
    limit: number;
    search?: string;
  }) =>
    apiClient
      .post<AgentListRes>("/organization/all-agents", {
        page_no: pagination.page_no,
        limit: pagination.limit,
        search: pagination.search,
      })
      .then((r) => r.data),

  updateAgent: (payload: {
    user_id: string;
    name: string;
    role: string;
    is_active: boolean;
  }) =>
    apiClient
      .post<UpdateAgentRes>("/organization/update-agent", payload)
      .then((r) => r.data),

  getOnlineAgents: () =>apiClient.get<OnlineAgentsRes>("/organization/online-agents").then((r) => r.data),
  
  removeUserFromChat: (payload: {
    chat_id: string;
    chat_bot_id: string;
    organization_id: string | number;
    target_user_id: string;
  }) =>
    apiClient.post("/chat/remove-user-from-chat", payload).then((r) => r.data),
  addUserToChat: (payload: {
    chat_id: string;
    organization_id: any;
    chat_bot_id: string;
    target_user_id?: string;
  }) => apiClient.post("/chat/add-user-to-chat", payload).then((r) => r.data),
};

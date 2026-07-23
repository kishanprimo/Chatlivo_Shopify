// services/invitation.service.ts
import { UpdateAgentStatusRes } from "@/app/store/types/AgentResTypes";
import apiClient from "./apiClient";
import { InviteAgentRes } from "@/app/store/types/ResTypes";

export const invitationService = {
  inviteAgent: (data: { email: string; name: string; role: string }) =>
    apiClient.post<InviteAgentRes>("/invitation/invite-agent", data).then((r) => r.data),

  updateAgentStatus: (user_id: string, is_active: boolean) =>
  apiClient.post<UpdateAgentStatusRes>("/invitation/update-agent-status", { user_id, is_active }).then((r) => r.data),

};
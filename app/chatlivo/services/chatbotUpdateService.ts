import apiClient from "./apiClient";
import { UpdateChatBotRes } from "@/app/store/types/ResTypes";

export const chatbotUpdateService = {
  updateChatbot: (body: Record<string, unknown>) =>
    apiClient.put<UpdateChatBotRes>("/chat-bot/update-chat-bot", body).then((r) => r.data),

  updateChatbotFormData: (formData: FormData): Promise<UpdateChatBotRes> =>
    
    apiClient
      .put<UpdateChatBotRes>("/chat-bot/update-chat-bot", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      
      .then((r) => r.data),
};

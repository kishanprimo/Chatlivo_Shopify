import apiClient from "./apiClient";
import { GetChatbotRes, GenerateScriptTagRes, GetBlockTypeRes } from "@/app/store/types/ResTypes";

export const chatbotService = {
  getChatbot: (chatbot_id: string) =>
    apiClient
      .post<GetChatbotRes>("/chat-bot/get-chat-bot", { chatbot_id })
      .then((r) => r.data),

  generateScriptTag: (chatbot_id: string | undefined) =>
    apiClient
      .post<GenerateScriptTagRes>("/chat-bot/generate-script-tag", { chatbot_id })
      .then((r) => r.data),

  getBlockTypes: () =>
    apiClient.get<GetBlockTypeRes>("/block-types/get-block-types").then((r) => r.data),
};

import { useQuery } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { GetChatbotRes } from "../types/ResTypes";
import { chatbotService } from "@/services";
import { getOrgIdFromToken } from "@/app/utils/tokenUtils";

export const useGetChatbot = () => {
  const token = Cookies.get("chat_saas_auth_token");
  const organizationId = getOrgIdFromToken();
  const chatbotId = Cookies.get("Chatbot_id");
  return useQuery<GetChatbotRes, Error>({
    queryKey: ["/chat-bot/get-chat-bot", organizationId, chatbotId],
    enabled: Boolean(token && organizationId && chatbotId),
    queryFn: () => chatbotService.getChatbot(chatbotId as string),
  });
};

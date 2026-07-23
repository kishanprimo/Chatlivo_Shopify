import { useQuery } from "@tanstack/react-query";
import apiClient from "@/services/apiClient";

interface GeneratePreviewUrlRes {
  success: boolean;
  data: { url: string };
}

export const usePreviewUrl = (chatbotId?: string | null) => {
  return useQuery<GeneratePreviewUrlRes, Error>({
    queryKey: ["/chat-bot/generate-live-preview-url", chatbotId],
    enabled: Boolean(chatbotId && chatbotId !== "undefined"),
    queryFn: () =>
      apiClient
        .post<GeneratePreviewUrlRes>("/chat-bot/generate-live-preview-url", {
          chatbot_id: Number(chatbotId),
        })
        .then((r) => r.data),
    staleTime: 5 * 60 * 1000,
  });
};

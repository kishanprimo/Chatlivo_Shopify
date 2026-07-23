"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppDispatch } from "@/app/utils/hooks";
import { updateCurrentConversation } from "@/app/store/Slices/CurrentConversationSlice";
import { updateConversationPartial } from "@/app/store/Slices/chatListSlice";
import { chatService } from "@/services";

interface CloseChatParams {
  chat_id: string;
  chat_bot_id: string;
}

export const useCloseChat = () => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ chat_id, chat_bot_id }: CloseChatParams) =>
      chatService.closeChat(chat_id, chat_bot_id),

    onSuccess: (data, variables) => {
      if (!data?.success) return;

      dispatch(updateCurrentConversation({ chat_status: "closed" }));
      dispatch(
        updateConversationPartial({
          id: variables.chat_id,
          chat_status: "closed",
        }),
      );

      // Refresh chat list so status shows instantly
      queryClient.invalidateQueries({ queryKey: ["chat-list"] });
    },
  });
};

import apiClient from "./apiClient";
import { ChatListRes } from "@/app/store/types/chatlist.type";
import { MessageListRes, CloseChatRes } from "@/app/store/types/ResTypes";
import type { StatusFilter } from "@/app/constants/statusFilter";

export const chatService = {
  getChatList: (
    pagination: {
      page_no: number;
      limit: number;
      sortField?: string;
      sortOrder?: string;
      fromDate?: string;
      toDate?: string;
      statusFilter?: StatusFilter;
      
      search?: string;
      channel?: string; // 'whatsapp' | 'live-chat' | undefined
    },
  ) =>
    apiClient.post<ChatListRes>("/chat/chat-list", {
        page_no: pagination.page_no,
        limit: pagination.limit,
        sortField: pagination.sortField,
        sortOrder: pagination.sortOrder,
        fromDate: pagination.fromDate,
        toDate: pagination.toDate,
        statusFilter: pagination.statusFilter,
        search: pagination.search,
        channel: pagination.channel,
      })
      .then((r) => r.data),

  closeChat: (chat_id: string, chat_bot_id: string) =>
    apiClient.post<CloseChatRes>("/chat/close-chat", { chat_id, chat_bot_id }).then((r) => r.data),

  getMessageList: (chat_id: string, page = "1", limit = "20") =>
    apiClient
      .post<MessageListRes>("/message/get-message-list", {
        chat_id,
        page,
        limit,
        sortOrder: "DESC",
      })
      .then((r) => r.data),
};

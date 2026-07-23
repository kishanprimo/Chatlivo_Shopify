import apiClient from "./apiClient";
import { WaConversation, WaMessage } from "@/app/store/types/whatsapp.type";

export interface WaConversationsRes {
  success: boolean;
  message: string;
  data: WaConversation[];
}

export interface WaMessagesRes {
  success: boolean;
  message: string;
  data: WaMessage[];
}

export interface WaSendRes {
  success: boolean;
  message: string;
  data: {
    message_id: string;
    whatsapp_message_id: number;
  };
}

export interface WaMarkReadRes {
  success: boolean;
  message: string;
}

export const whatsappService = {
  getConversations: (status?: "open" | "closed") =>
    apiClient
      .get<WaConversationsRes>("/whatsapp/conversations", {
        params: status ? { status } : undefined,
      })
      .then((r) => r.data),

  getMessages: (conversationId: number, limit = 50, offset = 0) =>
    apiClient
      .get<WaMessagesRes>(
        `/whatsapp/conversations/${conversationId}/messages`,
        { params: { limit, offset } },
      )
      .then((r) => r.data),

  sendMessage: (conversationId: number, message: string) =>
    apiClient
      .post<WaSendRes>("/whatsapp/send-from-crm", {
        chat_id: conversationId,
        message,
      })
      .then((r) => r.data),

  sendMedia: (
    conversationId: number,
    file: File,
    caption?: string,
    to?: string,
  ) => {
    const isImage = file.type.startsWith("image/");
    const type = isImage ? "image" : "document";
    const formData = new FormData();
    // Text fields must come before the file field so multer v2 parses req.body correctly
    formData.append("type", type);
    formData.append("conversation_id", String(conversationId));
    if (to) formData.append("to", to);
    if (caption) formData.append("caption", caption);
    formData.append("file", file);
    return apiClient
      .post<WaSendRes>("/whatsapp/send-media", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data);
  },

  markRead: (conversationId: number) =>
    apiClient
      .post<WaMarkReadRes>(
        `/whatsapp/conversations/${conversationId}/mark-read`,
      )
      .then((r) => r.data),

  getAccountStatus: () =>
    apiClient.get("/whatsapp/account/status").then((r) => r.data),

  joinConversation: (conversationId: number) =>
    apiClient
      .post(`/whatsapp/conversations/${conversationId}/join`)
      .then((r) => r.data),

  updateNotes: (conversationId: number, notes: string) =>
    apiClient
      .patch(`/whatsapp/conversations/${conversationId}/notes`, { notes })
      .then((r) => r.data),

  addUserToChat: (conversationId: number, targetUserId?: number) =>
    apiClient.post(`/whatsapp/conversations/${conversationId}/add-user`, {
      target_user_id: targetUserId,
    }),

  removeUserFromChat: (conversationId: number, targetUserId?: number) =>
    apiClient.post(`/whatsapp/conversations/${conversationId}/remove-user`, {
      target_user_id: targetUserId,
    }),

  getAssignees: (conversationId: number) =>
    apiClient
      .get(`/whatsapp/conversations/${conversationId}/assignees`)
      .then((r) => r.data),

  resolveConversation: (conversationId: number) =>
    apiClient.patch(`/whatsapp/conversations/${conversationId}`, { status: "closed" })
      .then((r) => r.data),
};

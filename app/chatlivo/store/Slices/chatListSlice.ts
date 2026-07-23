import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ConversationData, Lable } from "../types/chatlist.type";
import { Message } from "../types/ResTypes";
import { SocketMessage } from "../types/ResTypes";

const initialState: ConversationData[] = [];

const ChatListSlice = createSlice({
  name: "chatList",
  initialState,
  reducers: {
    updateChatList: (
      state,
      action: PayloadAction<
        { data: ConversationData[]; replace: boolean } | ConversationData[]
      >,
    ) => {
      // handle both old [] calls and new {data, replace} calls
      if (Array.isArray(action.payload)) return [];

      const { data, replace } = action.payload;
      if (replace) return data;

      const existing = new Set(state.map((x) => x.id));
      const newItems = data.filter((x) => !existing.has(x.id));
      state.push(...newItems);
    },
    // ✅ Update or insert conversation when new message arrives
    upsertConversation(
      state,
      action: PayloadAction<{
        message: SocketMessage | Message;
        isActiveChat: boolean;
        isSentByMe?: boolean;
        skipReorder?: boolean;
      }>,
    ) {
      const { message: newMessage, isActiveChat,isSentByMe } = action.payload;
      const chat = newMessage?.chat;

      // Find existing conversation
      const chatId = String(chat?.id);

      const existingIndex = state.findIndex((c) => String(c.id) === chatId);

      if (existingIndex !== -1) {
        // ✅ Prepend new message and update timestamp
        if (chat.visitor?.name || chat.visitor?.visitor_uuid) {
          state[existingIndex].visitor = {
            ...state[existingIndex].visitor,
            name:
              chat.visitor?.name || state[existingIndex].visitor?.name || "",
            visitor_uuid:
              chat.visitor?.visitor_uuid ||
              state[existingIndex].visitor?.visitor_uuid ||
              "",
          } as any;
        }
        const MAX_PREVIEW_MESSAGES = 50;
        const updated = [...state[existingIndex].message, newMessage as any];
        state[existingIndex].message =
          updated.length > MAX_PREVIEW_MESSAGES
            ? updated.slice(-MAX_PREVIEW_MESSAGES)
            : updated;
        state[existingIndex].updatedAt = newMessage.createdAt;
        if (chat.chat_status) {
          state[existingIndex].chat_status = chat.chat_status;
        }
        if (!isActiveChat && !isSentByMe) {
          state[existingIndex].owner_unread_count =
            (newMessage as any).owner_unread_count ??
            (state[existingIndex].owner_unread_count || 0) + 1;
          state[existingIndex].agent_unread_count =
            (newMessage as any).agent_unread_count ??
            (state[existingIndex].agent_unread_count || 0) + 1;
        }

        // ✅ Move conversation to top
        const updatedConversation = state.splice(existingIndex, 1)[0];
        state.unshift(updatedConversation);
      } else {
        // ✅ Create a new conversation entry
        const newConversation: ConversationData = {
          id: chat?.id,
          organization: {
            id: String(chat.organization_id),
            name: "", // fill if needed
            owner: "",
            createdAt: chat.createdAt,
            updatedAt: chat.updatedAt,
          },
          chat_bot: {
            id: chat.chat_bot_id,
            organization_id: String(chat.organization_id),
            chat_bot_name: "",
            main_color: "",
            chatbot_position: "",
            button_theme: "",
            button_text: "",
            theme_color: "",
            profile_pic: "",
            message_blocks: [],
            prechat_form: { is_enabled: false, fields: {} },
            status_data: [],
            agent_status: [],
            createdAt: chat.createdAt,
            updatedAt: chat.updatedAt,
            start_message_block_id: "",
          },
          visitor: {
            id: String(chat.visitor?.id || chat.visitor_id),
            visitor_uuid: chat.visitor?.visitor_uuid || "",
            organization: "",
            chat_bot: "",
            is_preview: chat?.visitor?.is_preview,
            email: chat.visitor?.email || "",
            name: chat.visitor?.name || "",
            phone: chat.visitor?.phone || "",
            country: chat.visitor?.country || "",
            navigation_tracking: chat.visitor?.navigation_tracking || [],
            role: chat.visitor?.role || "visitor",
            devices: chat.visitor?.devices || [],
            ip_address: chat.visitor?.ip_address || "",
            visits: chat.visitor?.visits || 0,
            socket_ids: chat.visitor?.socket_ids || [],
            createdAt: String(chat.visitor?.createdAt || ""),
            updatedAt: String(chat.visitor?.updatedAt || ""),
            blocked: chat.visitor?.blocked || false,
          },
          chat_status: chat.chat_status,
          channel: (chat as any).channel || "live-chat",
          user_ids: chat?.user_ids?.map((u) => ({
            user_id: u.user_id,
            status: u.status,
            id: u.id,
          })),
          createdAt: chat.createdAt,
          updatedAt: newMessage.createdAt,
          message: [newMessage as any],
          notes: "",
          is_restricted: chat.is_restricted ?? false,
          restrict_reason: chat.restrict_reason ?? null,
          owner_unread_count: isActiveChat || isSentByMe  ? 0 : 1,
          agent_unread_count: isActiveChat || isSentByMe  ? 0 : 1,
        };

        state.unshift(newConversation);
      }
    },
    // ✅ Update only partial fields for a given chat_id
    updateConversationPartial(
      state,
      action: PayloadAction<Partial<ConversationData>>,
    ) {
      const { id, ...updates } = action.payload;
      const chat = state.find((c) => String(c.id) === String(id));
      if (chat) {
        Object.assign(chat, updates); // merges provided keys into existing object
      }
    },

    upsertWaChatEntry(
      state,
      action: PayloadAction<{
        wa_conversation_id: number;
        organization_id: number;
        phone_number: string;
        contact_name?: string;
        chat_status: string;
        updatedAt: string;
        isActiveChat: boolean;
      }>,
    ) {
      const p = action.payload;
      if (
        state.some(
          (c) => String(c.wa_conversation_id) === String(p.wa_conversation_id),
        )
      )
        return;
      state.unshift({
        id: `wa_${p.wa_conversation_id}`,
        wa_conversation_id: p.wa_conversation_id,
        channel: "whatsapp",
        organization_id: p.organization_id,
        visitor: { phone: p.phone_number, name: p.contact_name || "" } as any,
        chat_status: p.chat_status,
        user_ids: [],
        message: [],
        createdAt: p.updatedAt,
        updatedAt: p.updatedAt,
        owner_unread_count: p.isActiveChat ? 0 : 1,
        agent_unread_count: p.isActiveChat ? 0 : 1,
        notes: "",
        is_restricted: false,
        restrict_reason: null,
      } as any);
    },

    updateUserLabelsInConversation(
      state,
      action: PayloadAction<{
        chatId: string;
        userId: string;
        updater: (labels: Lable[]) => Lable[];
      }>,
    ) {
      const { chatId, userId, updater } = action.payload;

      // find that conversation
      const conversation = state.find((c) => c.id === chatId);
      if (!conversation) return;

      // find that user in user_ids
      const user = conversation.user_ids.find(
        (item) => String(item.user_id?.uid) === String(userId),
      );
      // update that user labels
      if (user) {
        user.lable = updater(user.lable || []);
      }
    },
    removeConversation(state, action: PayloadAction<string>) {
      return state.filter((c) => String(c.id) !== String(action.payload));
    },
  },
});

export default ChatListSlice.reducer;
export const {
  updateChatList,
  upsertConversation,
  upsertWaChatEntry,
  updateConversationPartial,
  updateUserLabelsInConversation,
  removeConversation,
} = ChatListSlice.actions;

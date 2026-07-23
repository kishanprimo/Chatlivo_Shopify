import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { WaAssignee, WaConversation, WaMessage } from "@/app/store/types/whatsapp.type";

export type { WaAssignee, WaConversation, WaMessage };

interface WhatsAppState {
  conversations: WaConversation[];
  activeConversationId: number | null;
  messages: WaMessage[];
  messagesLoading: boolean;
  messagesLoadingMore: boolean;
  hasMoreMessages: boolean;
  messagesOffset: number;
  conversationsLoading: boolean;
  totalUnread: number;
}

const initialState: WhatsAppState = {
  conversations: [],
  activeConversationId: null,
  messages: [],
  messagesLoading: false,
  messagesLoadingMore: false,
  hasMoreMessages: false,
  messagesOffset: 0,
  conversationsLoading: false,
  totalUnread: 0,
};

const whatsappSlice = createSlice({
  name: "whatsapp",
  initialState,
  reducers: {
    setConversations(state, action: PayloadAction<WaConversation[]>) {
      state.conversations = action.payload;
      state.totalUnread = action.payload.reduce(
        (sum, c) => sum + (c.unread_count ?? 0),
        0,
      );
    },

    upsertConversation(state, action: PayloadAction<WaConversation>) {
      const idx = state.conversations.findIndex(
        (c) => c.id === action.payload.id,
      );
      if (idx >= 0) {
        const existingAssignees = state.conversations[idx].assignees;
        state.conversations[idx] = {
          ...action.payload,
          assignees: action.payload.assignees?.length
            ? action.payload.assignees
            : existingAssignees,
        };
        // move to top
        const updated = state.conversations[idx];
        state.conversations = [
          updated,
          ...state.conversations.filter((c) => c.id !== action.payload.id),
        ];
      } else {
        state.conversations.unshift(action.payload);
      }
      state.totalUnread = state.conversations.reduce(
        (sum, c) => sum + (c.unread_count ?? 0),
        0,
      );
    },

    incrementUnread(state, action: PayloadAction<number>) {
      const conv = state.conversations.find((c) => c.id === action.payload);
      if (conv) {
        conv.unread_count = (conv.unread_count ?? 0) + 1;
        state.totalUnread = state.conversations.reduce(
          (sum, c) => sum + (c.unread_count ?? 0),
          0,
        );
      }
    },

    resetUnread(state, action: PayloadAction<number>) {
      const conv = state.conversations.find((c) => c.id === action.payload);
      if (conv) {
        conv.unread_count = 0;
        state.totalUnread = state.conversations.reduce(
          (sum, c) => sum + (c.unread_count ?? 0),
          0,
        );
      }
    },
    incrementChatCount(state, action: PayloadAction<number>) {
      const conv = state.conversations.find((c) => c.id === action.payload);
      if (conv) {
        conv.chat_count = (conv.chat_count ?? 1) + 1;
      }
    },

    setActiveConversation(state, action: PayloadAction<number | null>) {
      state.activeConversationId = action.payload;
    },

    setMessages(
      state,
      action: PayloadAction<{ messages: WaMessage[]; hasMore: boolean }>,
    ) {
      state.messages = action.payload.messages;
      state.hasMoreMessages = action.payload.hasMore;
      state.messagesOffset = action.payload.messages.length;
    },

    setMessagesLoadingMore(state, action: PayloadAction<boolean>) {
      state.messagesLoadingMore = action.payload;
    },

    appendMessage(state, action: PayloadAction<WaMessage>) {
      const msg = action.payload;
      const exists = state.messages.some(
        (m) =>
          m.id === msg.id ||
          (msg.whatsapp_message_id &&
            m.whatsapp_message_id === msg.whatsapp_message_id),
      );
      if (!exists) {
        state.messages.push(msg);
      } else if (msg.whatsapp_message_id) {
        // Replace optimistic entry with real DB record (has correct id, media_url, caption)
        const idx = state.messages.findIndex(
          (m) => m.whatsapp_message_id === msg.whatsapp_message_id,
        );
        if (idx !== -1) state.messages[idx] = msg;
      }
    },

    prependMessages(
      state,
      action: PayloadAction<{ messages: WaMessage[]; hasMore: boolean }>,
    ) {
      const existingIds = new Set(state.messages.map((m) => m.id));
      const newOnes = action.payload.messages.filter(
        (m) => !existingIds.has(m.id),
      );
      state.messages = [...newOnes, ...state.messages];
      state.hasMoreMessages = action.payload.hasMore;
      state.messagesOffset = state.messages.length;
    },

    setMessagesLoading(state, action: PayloadAction<boolean>) {
      state.messagesLoading = action.payload;
    },

    setConversationsLoading(state, action: PayloadAction<boolean>) {
      state.conversationsLoading = action.payload;
    },
    updateConversationBlocked(
      state,
      action: PayloadAction<{ id: number; blocked: boolean }>,
    ) {
      const conv = state.conversations.find((c) => c.id === action.payload.id);
      if (conv) conv.blocked = action.payload.blocked;
    },

    updateConversationLastMessage(
      state,
      action: PayloadAction<{
        id: number;
        last_message: string;
        last_message_timestamp: string;
      }>,
    ) {
      const conv = state.conversations.find((c) => c.id === action.payload.id);
      if (conv) {
        conv.last_message = action.payload.last_message;
        conv.last_message_timestamp = action.payload.last_message_timestamp;
      }
    },

    updateConversationAssignees(
      state,
      action: PayloadAction<{
        conversation_id: number;
        assignees: WaAssignee[];
      }>,
    ) {
      const conv = state.conversations.find(
        (c) => c.id === action.payload.conversation_id,
      );
      if (conv) {
        conv.assignees = action.payload.assignees;
      }
    },

    updateConversationNotes(
      state,
      action: PayloadAction<{ id: number; notes: string }>,
    ) {
      const conv = state.conversations.find((c) => c.id === action.payload.id);
      if (conv) {
        conv.notes = action.payload.notes;
      }
    },

    updateMessageStatus(
      state,
      action: PayloadAction<{
        whatsapp_message_id: string;
        status: WaMessage["status"];
      }>,
    ) {
      const msg = state.messages.find(
        (m) => m.whatsapp_message_id === action.payload.whatsapp_message_id,
      );
      if (msg) {
        msg.status = action.payload.status;
      }
    },

  },
});

export const {
  setConversations,
  upsertConversation,
  incrementUnread,
  resetUnread,
  setActiveConversation,
  setMessages,
  appendMessage,
  prependMessages,
  setMessagesLoading,
  setMessagesLoadingMore,
  setConversationsLoading,
  updateConversationLastMessage,
  updateConversationAssignees,
  updateConversationNotes,
  updateMessageStatus,
  updateConversationBlocked,
  incrementChatCount
} = whatsappSlice.actions;

export default whatsappSlice.reducer;

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Message } from "../types/ResTypes";

interface MessageListState {
  messages: Message[];
  // set to true when visitor reads agent messages — used to mark newly appended agent messages seen immediately
  visitorHasRead: boolean;
}

const initialState: MessageListState = {
  messages: [],
  visitorHasRead: false,
};

const MessageListSlice = createSlice({
  name: "messageList",
  initialState,
  reducers: {
    updateMessageList(state, action: PayloadAction<Message[]>) {
      state.messages = action.payload;
      state.visitorHasRead = false;
    },
    prependMessages(state, action: PayloadAction<Message[]>) {
      const existingIds = new Set(state.messages.map((m) => String(m.id)));
      const newOnes = action.payload.filter(
        (m) => !existingIds.has(String(m.id)),
      );
      state.messages = [...newOnes, ...state.messages];
    },
    appendMessage(state, action: PayloadAction<Message>) {
      const exists = state.messages.some(
        (m) => String(m.id) === String(action.payload.id),
      );
      if (!exists) {
        const msg = { ...action.payload };
        // if visitor already read before this message arrived (race condition), mark it seen
        if (
          state.visitorHasRead &&
          (msg.sender_type === "agent" || msg.sender_type === "owner" || msg.sender_type === "admin")
        ) {
          msg.seen = true;
        }
        state.messages.push(msg);
      }
    },
    markChatMessagesRead: (state, action) => {
      const { role } = action.payload;
      if (role === "visitor") {
        state.visitorHasRead = true;
        state.messages.forEach((msg) => {
          if ((msg.sender_type === "agent" || msg.sender_type === "owner" || msg.sender_type === "admin") && !msg.seen) {
            msg.seen = true;
          }
        });
      } else {
        state.messages.forEach((msg) => {
          if (msg.sender_type === "visitor" && !msg.seen) {
            msg.seen = true;
          }
        });
      }
    },
  },
});

export default MessageListSlice.reducer;
export const {
  updateMessageList,
  prependMessages,
  appendMessage,
  markChatMessagesRead,
} = MessageListSlice.actions;

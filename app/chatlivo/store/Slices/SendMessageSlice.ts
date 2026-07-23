import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface SendMessageData {
  chat_bot_id?: number;
  organization_id?: string;
  chat_id?: number;
  message_type?: string;
  message_content?: string;
  showEmojiPicker?: boolean;
  selectedFile?: File | null;
}

const initialState: SendMessageData = {
  chat_bot_id: 0,
  organization_id: "",
  chat_id: 0,
  message_type: "",
  message_content: "",
  showEmojiPicker: false,
  selectedFile: null,
};

// Create a slice of the state
const SendMessageSlice = createSlice({
  name: "SendMessageData",
  initialState,
  reducers: {
    // Reducer to update the MessageList
    updateSendMessageData(
      state,
      action: PayloadAction<Partial<SendMessageData>>
    ) {
      return { ...state, ...action.payload };
    },
  },
});

// Export the reducer and actions
export default SendMessageSlice.reducer;
export const { updateSendMessageData } = SendMessageSlice.actions;

// for storing message which is shown in message section of chatbot =====================================================================
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface MessageState {
  message: string;
  askEmail: boolean;
  confirmationMessage: string;
}

const initialState: MessageState = {
  message: "Welcome to our store! 👋 Whether you have a specific question or need assistance, we’re here for you. 😉 What would you like to know?",
  askEmail: false,
  confirmationMessage: "",
};

const chatBoxMessageSlice = createSlice({
  name: "message",
  initialState,
  reducers: {
    setMessage(state, action: PayloadAction<string>) {
      state.message = action.payload;
    },
  },
});

export const { setMessage } = chatBoxMessageSlice.actions;

export default chatBoxMessageSlice.reducer;
   
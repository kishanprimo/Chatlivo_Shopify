// to store user's current chatbot layout  ===================================
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { GetAllChatbotsData } from "../ty\pes/ResTypes";

interface ChatBotState {
  loading: boolean;
  data: GetAllChatbotsData[] | null;
  error: string | null;
}

const initialState: ChatBotState = {
  loading: false,
  data: null,
  error: null,
};

const chatBotSlice = createSlice({
  name: "chatBot",
  initialState,
  reducers: {
    setChatBotLoading: (state) => {
      state.loading = true;
    },
    setChatBotData: (state, action: PayloadAction<GetAllChatbotsData[]>) => {
      state.data = action.payload;
      state.loading = false;
      state.error = null;
    },
    setChatBotError: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const { setChatBotLoading, setChatBotData, setChatBotError } =
  chatBotSlice.actions;
export default chatBotSlice.reducer;

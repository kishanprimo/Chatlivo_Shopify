import { createSlice } from "@reduxjs/toolkit";

const agentAccountStatusSlice = createSlice({
  name: "agentAccountStatus",
  initialState: { isDisconnected: false },
  reducers: {
    setAccountDisconnected: (state, action) => {
      state.isDisconnected = action.payload;
    },
  },
});

export const { setAccountDisconnected } = agentAccountStatusSlice.actions;
export default agentAccountStatusSlice.reducer;
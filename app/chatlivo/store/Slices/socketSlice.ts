import { createSlice } from "@reduxjs/toolkit";

interface SocketState {
  isConnected: boolean;
  hasConnectedOnce: boolean;
}

const initialState: SocketState = {
  isConnected: false,
  hasConnectedOnce: false,
};

const socketSlice = createSlice({
  name: "socket",
  initialState,
  reducers: {
    setSocketConnected(state) {
      state.isConnected = true;
      state.hasConnectedOnce = true;
    },
    setSocketDisconnected(state) {
      state.isConnected = false;
    },
  },
});

export const { setSocketConnected, setSocketDisconnected } = socketSlice.actions;
export default socketSlice.reducer;

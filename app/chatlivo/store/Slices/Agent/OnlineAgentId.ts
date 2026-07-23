import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface OnlineAgentsStore {
  onlineAgentsId: string[];
  unavailableAgentsId: string[];
}

const initialState: OnlineAgentsStore = {
  onlineAgentsId: [],
  unavailableAgentsId: [],
};

const OnlineAgentsIdSlice = createSlice({
  name: "onlineAgentsId",
  initialState,
  reducers: {
    // Store full array from API
    setOnlineAgents(state, action: PayloadAction<string[]>) {
      state.onlineAgentsId = action.payload;
    },

    // Add a new visitor (online)
    addOnlineAgent(state, action: PayloadAction<string>) {
      const id = action.payload;
      if (!state.onlineAgentsId.includes(id)) {
        state.onlineAgentsId.push(id);
      }
    },

    // Remove a visitor (offline)
    removeOnlineAgent(state, action: PayloadAction<string>) {
      state.onlineAgentsId = state.onlineAgentsId.filter(
        (v) => v !== action.payload
      );
    },

    setAgentAvailability(
      state,
      action: PayloadAction<{ user_id: string; is_available: boolean }>
    ) {
      const { user_id, is_available } = action.payload;
      state.unavailableAgentsId = state.unavailableAgentsId.filter(
        (id) => id !== user_id
      );
      if (!is_available) {
        state.unavailableAgentsId.push(user_id);
      }
    },
  },
});

export const {
  setOnlineAgents,
  addOnlineAgent,
  removeOnlineAgent,
  setAgentAvailability,
} = OnlineAgentsIdSlice.actions;

export default OnlineAgentsIdSlice.reducer;

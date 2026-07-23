import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface OnlineVisitorsState {
  onlineVisitorsId: string[];
  /** visitor_id → ISO last_seen string */
  lastSeenMap: Record<string, string>;
}

const initialState: OnlineVisitorsState = {
  onlineVisitorsId: [],
  lastSeenMap: {},
};

const OnlineVisitorsIdSlice = createSlice({
  name: "onlineVisitorsId",
  initialState,
  reducers: {
    setOnlineVisitors(state, action: PayloadAction<string[] | number[]>) {
      state.onlineVisitorsId = action.payload.map(String);
    },

    addOnlineVisitor(state, action: PayloadAction<string | number>) {
      const id = String(action.payload);
      if (!state.onlineVisitorsId.includes(id)) {
        state.onlineVisitorsId.push(id);
      }
      // Clear stale last_seen when visitor comes online
      delete state.lastSeenMap[id];
    },

    removeOnlineVisitor(
      state,
      action: PayloadAction<{ visitorId: string; lastSeen?: string }>,
    ) {
      const { visitorId, lastSeen } = action.payload;
      state.onlineVisitorsId = state.onlineVisitorsId.filter(
        (v) => v !== visitorId,
      );
      if (lastSeen) {
        state.lastSeenMap[visitorId] = lastSeen;
      }
    },

    setLastSeen(
      state,
      action: PayloadAction<{ visitorId: string; lastSeen: string }>,
    ) {
      state.lastSeenMap[action.payload.visitorId] = action.payload.lastSeen;
    },
  },
});

export const {
  setOnlineVisitors,
  addOnlineVisitor,
  removeOnlineVisitor,
  setLastSeen,
} = OnlineVisitorsIdSlice.actions;

export default OnlineVisitorsIdSlice.reducer;

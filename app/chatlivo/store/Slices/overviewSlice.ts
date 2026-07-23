import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { VisitorStats } from "../types/ResTypes";

interface OverviewState {
  stats: VisitorStats | null;
  selectedRange: "Last 30 days" | "Last 7 days";
}

const initialState: OverviewState = {
  stats: null,
  selectedRange: "Last 30 days",
};

const overviewSlice = createSlice({
  name: "overview",
  initialState,
  reducers: {
    setOverviewStats(state, action: PayloadAction<VisitorStats>) {
      state.stats = action.payload;
    },
    setRealtimeVisitors(state, action: PayloadAction<number>) {
      if (!state.stats) return;
      state.stats = { ...state.stats, realtime: { online_visitors: action.payload } };
    },
    incrementRealtimeVisitors(state) {
      if (!state.stats) return;
      const current = state.stats.realtime?.online_visitors ?? 0;
      state.stats = { ...state.stats, realtime: { online_visitors: current + 1 } };
    },
    decrementRealtimeVisitors(state) {
      if (!state.stats) return;
      const current = state.stats.realtime?.online_visitors ?? 0;
      state.stats = { ...state.stats, realtime: { online_visitors: Math.max(0, current - 1) } };
    },
    setSelectedRange(state, action: PayloadAction<"Last 30 days" | "Last 7 days">) {
      state.selectedRange = action.payload;
    },
  },
});

export const {
  setOverviewStats,
  setRealtimeVisitors,
  incrementRealtimeVisitors,
  decrementRealtimeVisitors,
  setSelectedRange,
} = overviewSlice.actions;
export default overviewSlice.reducer;

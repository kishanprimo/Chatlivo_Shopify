import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { STATUS_FILTER, type StatusFilter } from "@/app/constants/statusFilter";

export type ChannelFilter = "all" | "live-chat" | "whatsapp" | "email" | "messenger" | "instagram"; 
interface ChatFilterState {
  statusFilter: StatusFilter;
  sortOrder: "Newest" | "Oldest";
  channelFilter: ChannelFilter;
}
// just add here for new channels
const initialState: ChatFilterState = {
  statusFilter: STATUS_FILTER.ALL,
  sortOrder: "Newest",
  channelFilter:"all",
};

const conversationListFilterSlice = createSlice({
  name: "conversationListFilter",
  initialState,
  reducers: {
    setStatusFilter(
      state,
      action: PayloadAction<ChatFilterState["statusFilter"]>,
    ) {
      state.statusFilter = action.payload;
    },
    setSortOrder(state, action: PayloadAction<ChatFilterState["sortOrder"]>) {
      state.sortOrder = action.payload;
    },
    setChannelFilter: (state, action) => { state.channelFilter = action.payload; },
  },
});

export const { setStatusFilter, setSortOrder, setChannelFilter } = conversationListFilterSlice.actions;
export default conversationListFilterSlice.reducer;

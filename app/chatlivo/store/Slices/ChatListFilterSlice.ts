// ChatListFilterSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { STATUS_FILTER, type StatusFilter } from "@/app/constants/statusFilter";

interface FilterState {
  statusFilter: StatusFilter;
  sortOrder: string;
  fromDate: string;
  toDate: string;
}

const initialState: FilterState = {
  statusFilter: STATUS_FILTER.ALL,
  sortOrder: "desc",
  fromDate: "",
  toDate: "",
};

const chatListFilterSlice = createSlice({
  name: "chatListFilter",
  initialState,
  reducers: {
    setSortOrder: (state, action: PayloadAction<string>) => {
      state.sortOrder = action.payload;
    },
    setStatusFilter: (state, action: PayloadAction<StatusFilter>) => {
      state.statusFilter = action.payload;
    },
    setDateFilter: (state, action: PayloadAction<{ fromDate: string; toDate: string }>) => {
      state.fromDate = action.payload.fromDate;
      state.toDate = action.payload.toDate;
    },
  },
});

export const { setSortOrder, setStatusFilter, setDateFilter } = chatListFilterSlice.actions;
export default chatListFilterSlice.reducer;

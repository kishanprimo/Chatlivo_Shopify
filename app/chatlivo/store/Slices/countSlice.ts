import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface CountsState {
  total: number;
  open: number;
  unassigned: number;
  closed: number;
  total_whatsapp_chats?: number;
  unread: { all: number; open: number; unassigned: number; resolved: number };
  unreadSeeded: boolean;
}

const initialState: CountsState = {
  total: 0,
  open: 0,
  unassigned: 0,
  closed: 0,
  total_whatsapp_chats: 0,
  unread: { all: 0, open: 0, unassigned: 0, resolved: 0 },
  unreadSeeded: false
};

const countsSlice = createSlice({
  name: "counts",
  initialState,
  reducers: {
    setCounts: (state, action: PayloadAction<Partial<CountsState>>) => {
      Object.assign(state, action.payload);
    },

    resolveChat: (
      state,
      action: PayloadAction<{ wasUnassigned: boolean; wasJoinedByMe: boolean }>,
    ) => {
      state.total = Math.max(0, state.total - 1);
      state.closed += 1;
      if (action.payload.wasJoinedByMe) {
        state.open = Math.max(0, state.open - 1);
      }
      if (action.payload.wasUnassigned) {
        state.unassigned = Math.max(0, state.unassigned - 1);
      }
    },
    joinChat: (state, action: PayloadAction<{ wasUnassigned: boolean }>) => {
      state.open += 1;
      if (action.payload.wasUnassigned) {
        state.unassigned = Math.max(0, state.unassigned - 1);
      }
    },
    leaveChat: (state) => {
      state.open = Math.max(0, state.open - 1);
    },
    incrementTotal: (state) => {
      state.total += 1;
      state.unassigned += 1;
    },

    reopenChat: (state, action: PayloadAction<{ wasUnassigned: boolean }>) => {
      state.closed = Math.max(0, state.closed - 1);
      state.total += 1;
      if (action.payload.wasUnassigned) state.unassigned += 1;
      else state.open += 1;
    },

    // for unread chats count ==============================
    setUnreadCounts(
      state,
      action: PayloadAction<{
        all: number;
        open: number;
        unassigned: number;
        resolved: number;
      }>,
    ) {
      state.unread = action.payload;
      state.unreadSeeded = true;
    },
    incrementUnreadChat(
      state,
      action: PayloadAction<{
        chat_status: string;
        is_unassigned: boolean;
        already_unread: boolean;
      }>,
    ) {
      if (!action.payload.already_unread) {
        state.unread.all += 1;
        if (action.payload.chat_status !== "closed") {
          if (action.payload.is_unassigned) state.unread.unassigned += 1;
          else state.unread.open += 1;
        }
      }
    },
    decrementUnreadChat(
      state,
      action: PayloadAction<{ chat_status: string; is_unassigned: boolean }>,
    ) {
      state.unread.all = Math.max(0, state.unread.all - 1);
      if (action.payload.chat_status !== "closed") {
        if (action.payload.is_unassigned)
          state.unread.unassigned = Math.max(0, state.unread.unassigned - 1);
        else state.unread.open = Math.max(0, state.unread.open - 1);
      }
    },
    markUnassignedGlobal: (
      state,
      action: PayloadAction<{ isNowUnassigned: boolean }>,
    ) => {
      if (action.payload.isNowUnassigned) state.unassigned += 1;
    },
    updateChatState: (
  state,
  action: PayloadAction<{
    wasUnassigned?: boolean;
    isUnassigned?: boolean;
    wasMine?: boolean;
    isMine?: boolean;
    wasClosed?: boolean;
    isClosed?: boolean;
    isNew?: boolean;
    isWhatsapp?: boolean;
  }>,
) => {
  const { wasUnassigned, isUnassigned, wasMine, isMine, wasClosed, isClosed, isNew } = action.payload;
  if (isNew) {
    state.total += 1;
    state.unassigned += 1;
    return;
  }
  if (wasUnassigned !== undefined && isUnassigned !== undefined && wasUnassigned !== isUnassigned) {
    state.unassigned = Math.max(0, state.unassigned + (isUnassigned ? 1 : -1));
  }
  if (wasMine !== undefined && isMine !== undefined && wasMine !== isMine) {
    state.open = Math.max(0, state.open + (isMine ? 1 : -1));
  }
  if (wasClosed !== undefined && isClosed !== undefined && wasClosed !== isClosed) {
    state.closed = Math.max(0, state.closed + (isClosed ? 1 : -1));
    state.total = Math.max(0, state.total + (isClosed ? -1 : 1));
    if (action.payload.isWhatsapp && state.total_whatsapp_chats !== undefined) {
     state.total_whatsapp_chats = Math.max(0, state.total_whatsapp_chats + (isClosed ? -1 : 1));
   }
  }
},
  },
});

export const {
  setCounts,
  resolveChat,
  joinChat,
  leaveChat,
  incrementTotal,
  setUnreadCounts,
  incrementUnreadChat,
  decrementUnreadChat,
  reopenChat,
  markUnassignedGlobal,
  updateChatState
} = countsSlice.actions;
export default countsSlice.reducer;

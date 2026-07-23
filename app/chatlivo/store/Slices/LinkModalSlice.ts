// store/Slices/LinkModalSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface LinkModalState {
  savedRange: { index: number; length: number } | null;
  selectedText: string;
  url: string;
}

const initialState: LinkModalState = { savedRange: null, selectedText: "", url: "" };

const linkModalSlice = createSlice({
  name: "linkModal",
  initialState,
  reducers: {
    setLinkUrl: (state, action: PayloadAction<string>) => { state.url = action.payload; },
    setLinkSelectedText: (state, action: PayloadAction<string>) => { state.selectedText = action.payload; },
    setSavedRange: (state, action: PayloadAction<{ index: number; length: number } | null>) => { state.savedRange = action.payload; },
  },
});

export const { setLinkUrl, setLinkSelectedText,setSavedRange } = linkModalSlice.actions;
export default linkModalSlice.reducer;
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ShortcutState {
  shortcut_id?: number;
  shortcut_name?: string;
  shortcut_type?: string;
  shortcut_text?: string;
  shortcut_save_content?: string;
}

const initialState: ShortcutState = {
  shortcut_id: 0,
  shortcut_name: "",
  shortcut_type: "",
  shortcut_text: "",
  shortcut_save_content: "",
};

const ShortcutSlice = createSlice({
  name: "shortcut",
  initialState,
  reducers: {
    setShortcut(state, action: PayloadAction<Partial<ShortcutState>>) {
      Object.assign(state, action.payload);
    },
    clearShortcut() {
      return initialState;
    },
  },
});

export const { setShortcut, clearShortcut } = ShortcutSlice.actions;
export default ShortcutSlice.reducer;

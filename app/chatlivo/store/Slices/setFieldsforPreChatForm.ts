// select fields for pre chat from =============================
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface ComponentField {
  id: string;
  label: string;
  icon: string;
  required?: boolean;
  value?: string; // store user input value
  is_enabled: boolean;
}

interface ComponentsState {
  fields: ComponentField[];
  preChatEnabled: boolean; //main enable of pre-chat
  defaultMessage: string;
  preChatTitle: string;
  preChatDescription: string;
  showNotice: boolean;
  requireConsent: boolean;
  privacyLink: string;
}

const initialState: ComponentsState = {
  fields: [],
  preChatEnabled: false,
  defaultMessage: "Your form is submitted successfully, start your chat",
  preChatTitle: "",
  preChatDescription: "",
  showNotice: false,
  requireConsent: false,
  privacyLink: "",
};

const componentsSlice = createSlice({
  name: "components",
  initialState,
  reducers: {
    addField: (state, action: PayloadAction<ComponentField>) => {
      const exists = state.fields.find((f) => f.id === action.payload.id);
      if (!exists) state.fields.push(action.payload);
    },
    removeField: (state, action: PayloadAction<string>) => {
      state.fields = state.fields.filter((f) => f.id !== action.payload);
    },

    toggleEnabled: (state, action: PayloadAction<string>) => {
      const field = state.fields.find((f) => f.id === action.payload);
      if (field) field.is_enabled = !field.is_enabled;
    },
    // for initial set of values ===============
    setFields: (state, action: PayloadAction<ComponentField[]>) => {
      state.fields = action.payload;
    },
    setPreChat: (state, action) => {
      state.preChatEnabled = action.payload;
    },
    setDefaultMessage: (state, action: PayloadAction<string>) => {
      state.defaultMessage = action.payload;
    },
    setPreChatTitle: (state, action: PayloadAction<string>) => {
      state.preChatTitle = action.payload;
    },
    setPreChatDescription: (state, action: PayloadAction<string>) => {
      state.preChatDescription = action.payload;
    },

    setShowNotice: (state, action: PayloadAction<boolean>) => {
      state.showNotice = action.payload;
    },
    setRequireConsent: (state, action: PayloadAction<boolean>) => {
      state.requireConsent = action.payload;
    },
    setPrivacyLink: (state, action: PayloadAction<string>) => {
      state.privacyLink = action.payload;
    },

    reorderFields: (
      state,
      action: PayloadAction<{ sourceIndex: number; destinationIndex: number }>,
    ) => {
      const { sourceIndex, destinationIndex } = action.payload;
      const newFields = [...state.fields]; // ✅ create a shallow copy
      const [movedItem] = newFields.splice(sourceIndex, 1); // remove the dragged item
      newFields.splice(destinationIndex, 0, movedItem); // insert at new position
      state.fields = newFields; // ✅ update array safely (no mutation)
    },
  },
});

export const {
  addField,
  removeField,
  toggleEnabled,
  setFields,
  setPreChat,
  setDefaultMessage,
  setPreChatTitle,
  setPreChatDescription,
  setShowNotice,
  setRequireConsent,
  setPrivacyLink,
  reorderFields,
} = componentsSlice.actions;

export default componentsSlice.reducer;

// custom chat while creating chat bot ============================================
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { GetAllChatbotsData } from "../types/ResTypes";
import { setChatBotData } from "./ChatBotSlice";

interface ChatFields {
  title: string;
  status_label: string;
  textarea: string;
}

interface CustomChatState {
  mode: "online" | "offline";
  chatTheme: "light" | "dark";
  buttonType: "without_text" | "with_text";
  position: "right" | "left";
  buttontext: string;
  color: string;
  online: ChatFields;
  offline: ChatFields;
  language: string;
  status: string;
  icon: string;
  welcomeMessage: string;
}

const initialState: CustomChatState = {
  mode: "online",
  chatTheme: "light",
  buttonType: "without_text",
  position: "right",
  buttontext: "Chat",
  color: "",
  online: {
    title: "How can we help?",
    status_label: "We reply immediately",
    textarea: "Type your message here",
  },
  offline: {
    title: "Send us a message",
    status_label: "Happy to answer you later",
    textarea: "Type your message here",
  },
  language: "English",
  status: "Available",
  icon: "/home/available.svg",
  welcomeMessage: "",
};

const customChatSlice = createSlice({
  name: "chatMode",
  initialState,
  reducers: {
    hydrateFromApi(state, action: PayloadAction<GetAllChatbotsData>) {
      const apiData = action.payload;

      // ✅ map API → local state
      state.color = apiData?.main_color ?? state.color ?? "#007BFF";
      state.position =
        (apiData?.chatbot_position as "left" | "right") ?? state.position;
      state.buttonType =
        (apiData?.button_theme as "without_text" | "with_text") ??
        state.buttonType;
      state.buttontext = apiData?.button_text ?? state.buttontext;
      state.chatTheme =
        (apiData?.theme_color as "light" | "dark") ?? state.chatTheme;
      state.welcomeMessage = apiData?.welcome_message ?? state.welcomeMessage;

      // default to "offline" if not found
      const offlineData = apiData?.status_data?.find(
        (s) => s.status === "offline",
      );
      const onlineData = apiData?.status_data?.find(
        (s) => s.status === "online",
      );

      // ✅ hydrate offline
      if (offlineData) {
        state.offline = {
          title: offlineData.title ?? state.offline.title,
          status_label: offlineData.status_label ?? "Happy to answer you later",
          textarea: offlineData.text_area ?? state.offline.textarea,
        };
      }

      // ✅ hydrate online
      if (onlineData) {
        state.online = {
          title: onlineData.title ?? state.online.title,
          status_label: onlineData.status_label ?? "We reply immediately",
          textarea: onlineData.text_area ?? state.online.textarea,
        };
      }

      // ✅ set mode (default = offline if API doesn’t provide online)
      state.mode = onlineData ? "online" : "offline";
    },

    setMode(state, action: PayloadAction<"online" | "offline">) {
      state.mode = action.payload;
    },
    setChatTheme(state, action: PayloadAction<"light" | "dark">) {
      state.chatTheme = action.payload;
    },
    setButtonType(state, action: PayloadAction<"without_text" | "with_text">) {
      state.buttonType = action.payload;
    },
    setButtonText(state, action: PayloadAction<string>) {
      state.buttontext = action.payload;
    },
    setColor(state, action: PayloadAction<string>) {
      state.color = action.payload;
    },
    setPosition(state, action: PayloadAction<"right" | "left">) {
      state.position = action.payload;
    },
    updateField(
      state,
      action: PayloadAction<{ field: keyof ChatFields; value: string }>,
    ) {
      const { field, value } = action.payload;
      state[state.mode][field] = value;
    },
    // In reducers:
    setWelcomeMessage(state, action: PayloadAction<string>) {
      state.welcomeMessage = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(setChatBotData, (state, action) => {
      const apiData = action.payload?.[0];
      if (!apiData) return;
      state.color = apiData.main_color ?? state.color ?? "#007BFF";
      state.position =
        (apiData.chatbot_position as "left" | "right") ?? state.position;
      state.buttonType =
        (apiData.button_theme as "without_text" | "with_text") ??
        state.buttonType;
      state.buttontext = apiData.button_text ?? state.buttontext;
      state.chatTheme =
        (apiData.theme_color as "light" | "dark") ?? state.chatTheme;
      state.welcomeMessage = apiData.welcome_message ?? state.welcomeMessage;
      const offlineData = apiData.status_data?.find(
        (s) => s.status === "offline",
      );
      const onlineData = apiData.status_data?.find(
        (s) => s.status === "online",
      );
      if (offlineData) {
        state.offline = {
          title: offlineData.title ?? state.offline.title,
          status_label: offlineData.status_label ?? "Happy to answer you later",
          textarea: offlineData.text_area ?? state.offline.textarea,
        };
      }
      if (onlineData) {
        state.online = {
          title: onlineData.title ?? state.online.title,
          status_label: onlineData.status_label ?? "We reply immediately",
          textarea: onlineData.text_area ?? state.online.textarea,
        };
      }
      state.mode = onlineData ? "online" : "offline";
    });
  },
});

export const {
  hydrateFromApi,
  setMode,
  setChatTheme,
  setButtonText,
  setButtonType,
  setColor,
  setPosition,
  updateField,
  setWelcomeMessage,
} = customChatSlice.actions;

export default customChatSlice.reducer;

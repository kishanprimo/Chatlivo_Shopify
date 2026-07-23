// configure chatbot slice ==================================================
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { LANGUAGES } from "@/i18n/languages";

const LANG_STORAGE_KEY = "app_language";

function getSavedLanguage(): string {
  if (typeof window === "undefined") return "EN";
  const saved = localStorage.getItem(LANG_STORAGE_KEY);
  return saved && LANGUAGES[saved] ? saved : "EN";
}

interface UserDetails {
  name: string;
  profilePic: string | File;
  language: string;
  is_translation_enabled:boolean
}

const initialState: UserDetails = {
  name: "Name",
  profilePic: "/configure1/Profile_Avatar.png",
  language: getSavedLanguage(),
  is_translation_enabled:false,
};

const userConfigureSlice = createSlice({
  name: "userProfile",
  initialState,
  reducers: {
    setProfilePic(state, action: PayloadAction<string | File>) {
      state.profilePic = action.payload;
    },
    setLanguage(state, action: PayloadAction<string>) {
      state.language = action.payload;
      if (typeof window !== "undefined") {
        localStorage.setItem(LANG_STORAGE_KEY, action.payload);
      }
    },
    setIsTranslationEnabled(state, action: PayloadAction<boolean>) {
      state.is_translation_enabled = action.payload;
    },
  },
});

export const { setProfilePic, setLanguage, setIsTranslationEnabled } =
  userConfigureSlice.actions;
export default userConfigureSlice.reducer;

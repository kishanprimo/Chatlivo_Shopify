import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type AccountSettingsState = {
  domain: string;
  website_url: string;
  selectedZone: string;
  conversationHistory: number;
  powered_by: string;
  powered_by_url: string;
  is_24_hours: boolean;
  office_hours_enabled:boolean;
  is_script_install: boolean;
  whatsapp_widget_enabled?: boolean;
};

const initialState: AccountSettingsState = {
  domain: "",
  website_url: "",
  selectedZone: "",
  conversationHistory: 0,
  powered_by: "",
  powered_by_url: "",
  is_24_hours: true,
  office_hours_enabled: true,
  is_script_install: false,
  whatsapp_widget_enabled: false,
};

const accountSettingsSlice = createSlice({
  name: "accountSettings",
  initialState,
  reducers: {
    setAccountSettings: (state, action: PayloadAction<AccountSettingsState>) => {
      return { ...state, ...action.payload };
    },
    updateAccountSettings: (
      state,
      action: PayloadAction<Partial<AccountSettingsState>>
    ) => {
      return { ...state, ...action.payload };
    },
  },
});

export const { setAccountSettings, updateAccountSettings } =
  accountSettingsSlice.actions;
export default accountSettingsSlice.reducer;

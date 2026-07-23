import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { NavPage } from "../types/ResTypes";
import { Lable, UserIDElement, UserIDUserID } from "../types/chatlist.type";

interface ConversationData {
  conversation_id?: string;
  wa_conversation_id?: number; // ADD
  channel?: string;
  visitor_id?: string;
  profile_pic?: string;
  profile_image_color?: string;
  visitor_name?: string;
  name?: string;
  email?: string;
  is_joined?: boolean;
  is_restricted?: boolean;
  restrict_reason?: "chat_history" | "visitor_limit" | null;
  chat_history_days?: number;
  is_preview?:boolean;
  phone?: string;
  navigation_tracking?: NavPage[];
  role?: string;
  devices?: string[];
  ip_address?: string;
  visits?: number;
  referrer?: string | null;
  createdAt?: string;
  updatedAt?: string;
  organization_id?: string;
  notes?: string;
  country?: string;
  city?: string;
  chat_bot_id?: string;
  lable?: Lable[];
  assigned_agent?: UserIDUserID;
  user_ids?: UserIDElement[];
  selectedLabelId?: string;
  chat_status?: string;
  blocked?: boolean;
  chats?: number;
  last_seen?: string;
  
  fromVisitorList?: boolean; // ✅ Already added
}

// Define the initial state with an empty chatList
const initialState: ConversationData = {
  conversation_id: undefined,
  wa_conversation_id: 0,
  visitor_id: "",
  profile_image_color: "",
  visitor_name: "",
  name: "",
  is_joined: false,
  is_restricted: false,
  email: "",
  phone: "",
  navigation_tracking: [],
  role: "",
  devices: [],
  is_preview:false,
  ip_address: "",
  referrer: null,
  notes: "",
  country: "",
  city: "",
  visits: 0,
  createdAt: "",
  updatedAt: "",
  organization_id: "",
  chat_bot_id: "",
  lable: [],
  assigned_agent: {
    uid: 0,
    user_name: "",
    role: "",
    name: "",
  },
  selectedLabelId: "",
  chat_status: "",
  blocked: false,
  fromVisitorList: false, // ✅ Already added
};

// Create a slice of the state
const CurrentConversationSlice = createSlice({
  name: "currentConversation",
  initialState,
  reducers: {
    // Reducer to update the chatList
    updateCurrentConversation(state, action: PayloadAction<ConversationData>) {
      // Directly modify the state to replace the chatList
      return { ...state, ...action.payload };
    },
    addLable(state, action: PayloadAction<Lable>) {
      return { ...state, lable: [...(state.lable ?? []), action.payload] };
    },

    removeLable(state, action: PayloadAction<string>) {
      return {
        ...state,
        lable: state.lable?.filter(
          (lable) => String(lable.id) !== action.payload,
        ),
      };
    },

    resetCurrentConversation() {
      return initialState;
    },
    // set selected label id to pass in delete tag file
    setSelectedLabelId(state, action: PayloadAction<string>) {
      state.selectedLabelId = action.payload;
    },
  },
});

// Export the reducer and actions
export default CurrentConversationSlice.reducer;
export const {
  updateCurrentConversation,
  resetCurrentConversation,
  addLable,
  removeLable,
  setSelectedLabelId,
} = CurrentConversationSlice.actions;

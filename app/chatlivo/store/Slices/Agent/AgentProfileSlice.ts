import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type ProfileState = {
  avatar: string;
  user_name: string;
  name:string
  email: string;
  description: string;
  profile_pic: File | string | null;
  subscription_plan_id: string;
  is_available: boolean;
};

const initialState: ProfileState = {
  avatar: "",
  user_name: "",
  name:"",
  email: "",
  description: "",
  profile_pic: null,
  subscription_plan_id:"",
  is_available: true,
};

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    setProfile: (state, action: PayloadAction<ProfileState>) => {
      return { ...state, ...action.payload };
    },
    updateProfile: (state, action: PayloadAction<Partial<ProfileState>>) => {
      return { ...state, ...action.payload };
    },
  },
});

export const { setProfile, updateProfile } = profileSlice.actions;
export default profileSlice.reducer;

// signin details stored to show on otp screen =====================================================

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type UserState = {
  name:string;
  email: string;
  password: string;
  rememberMe: boolean;
};

const initialState: UserState = {
  name:"",
  email: "",
  password: "",
  rememberMe: false,
};

const userEmailSlice = createSlice({
  name: "email",
  initialState,
  reducers: {
    setUserEmail: (
      state,
      action: PayloadAction<{ email: string; password: string,name:string }>
    ) => {
      state.email = action.payload.email;
      state.password = action.payload.password;
      state.name=action.payload.name;
    },
    setRememberMe: (state, action: PayloadAction<boolean>) => {
      state.rememberMe = action.payload;
    },
    clearUserEmail: (state) => {
      state.email = "";
      state.password = "";
      state.rememberMe = false;
      state.name="";
    },
  },
});

export const { setUserEmail, setRememberMe, clearUserEmail } = userEmailSlice.actions;
export default userEmailSlice.reducer;

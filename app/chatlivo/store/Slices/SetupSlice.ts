import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface SetupForm {
  // screen-1
  name: string;
  department: string; department_other: string;
  platform: string; platform_other: string;
  // screen-2
  industry: string; industry_other: string;
  website_visits: string;
  website_platform: string; 
  business_model: string; business_model_other: string;
  // screen-3
  website_url: string;
}

interface Setup {
  step: number;
  form: SetupForm;
}

const initialForm: SetupForm = {
  name: '', department: '', department_other: '',
  platform: '', platform_other: '',
  industry: '', industry_other: '',
  website_visits: '',
  website_platform: '', 
  business_model: '', business_model_other: '',
  website_url: '',
};

const initialState: Setup = {
  step: 1,
  form: initialForm,
};

const SetupSlice = createSlice({
  name: "setup",
  initialState,
  reducers: {
    NextStep(state) {
      if (state.step < 3) state.step += 1;
    },
    updateSetupForm(state, action: PayloadAction<Partial<SetupForm>>) {
      state.form = { ...state.form, ...action.payload };
    },
    resetSetup(state) {
      state.step = 1;
      state.form = initialForm;
    },
  },
});

export const { NextStep, updateSetupForm, resetSetup } = SetupSlice.actions;
export default SetupSlice.reducer;
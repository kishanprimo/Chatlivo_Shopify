import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface SubscriptionPlanState {
  planId: string | null;
  planPrice: string | null;
  planTitle: string | null;
  billingCycle: "monthly" | "yearly";
  agentCount: number;
  isMiraEnabled: boolean;
  miraChatCount: number;
}

const initialState: SubscriptionPlanState = {
  planId: "expert", // Defaulting to expert as seen in your video
  planPrice: "117",
  planTitle: "Expert",
  billingCycle: "monthly",
  agentCount: 5,
  isMiraEnabled: false,
  miraChatCount: 100,
};

const SubscriptionPlanSlice = createSlice({
  name: "subscriptionPlan",
  initialState,
  reducers: {
    setPlan: (state, action: PayloadAction<{ id: string; price: string; title: string }>) => {
      state.planId = action.payload.id;
      state.planPrice = action.payload.price;
      state.planTitle = action.payload.title;
    },
    setBillingCycle: (state, action: PayloadAction<"monthly" | "yearly">) => {
      state.billingCycle = action.payload;
    },
    setAgentCount: (state, action: PayloadAction<number>) => {
      state.agentCount = action.payload;
    },
    toggleMiraAI: (state) => {
      state.isMiraEnabled = !state.isMiraEnabled;
    },
    setMiraChatCount: (state, action: PayloadAction<number>) => {
      state.miraChatCount = action.payload;
    },
  },
});

export const { setPlan, setBillingCycle, setAgentCount, toggleMiraAI, setMiraChatCount } = SubscriptionPlanSlice.actions;
export default SubscriptionPlanSlice.reducer;
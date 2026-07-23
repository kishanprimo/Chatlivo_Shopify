import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Define the type for your state
interface MemberState {
  email?: string;
  name?: string;
  member_id?:string;
  role?:string;
  is_active?: boolean;
}

// Define the initial state using the MemberState interface
const initialState: MemberState = {
  email: "",
  name: "",
  member_id:"",
  role:"",
  is_active: true,
};

// Create the slice with proper TypeScript types
const MemberSlice = createSlice({
  name: "Members",
  initialState,
  reducers: {
    updateMember(state, action: PayloadAction<Partial<MemberState>>) {
      // Partial<FilterState> allows you to specify which fields to update, do not remove the 'Partial' keyword
      return { ...state, ...action.payload };
    },
    setMemberId(state,action) {
      state.member_id=action.payload
    }
  },
});

// Export the reducer and actions
export default MemberSlice.reducer;
export const { updateMember,setMemberId } = MemberSlice.actions;

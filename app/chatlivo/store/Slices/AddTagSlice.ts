import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AddTagData {
  name: string;
  description: string;
  color: string;
}

const initialState: AddTagData = {
  name: "",
  description: "",
  color: "",
};

// Create a slice of the state
const AddTagSlice = createSlice({
  name: "AddTagData",
  initialState,
  reducers: {
    // Reducer to update the MessageList
    updateAddTagData(state, action: PayloadAction<Partial<AddTagData>>) {
      return { ...state, ...action.payload };
    },
  },
});

// Export the reducer and actions
export default AddTagSlice.reducer;
export const { updateAddTagData } = AddTagSlice.actions;

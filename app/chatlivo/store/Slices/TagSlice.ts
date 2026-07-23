import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface TagState {
  label_id?: string;
  name?: string;
  description?: string;
  color?: string;
}

const initialState: TagState = {
  label_id: "",
  name: "",
  description: "",
  color: ""
};

const TagSlice = createSlice({
  name: "tag",  
  initialState,
  reducers: {
    setTagData(state, action: PayloadAction<Partial<TagState>>) {
      Object.assign(state, action.payload);
    }
  }
});

export default TagSlice.reducer;
export const { setTagData } = TagSlice.actions;

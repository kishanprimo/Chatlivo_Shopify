import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface TrainingState {
  id?: string | number;
  question: string;
  answer: string;
  status?: boolean;
  created_at?: string;
}

const initialState: TrainingState = {
  id: "",
  question: "",
  answer: "",
  status: true,
  created_at: ""
};

const TrainingSlice = createSlice({
  name: "training",
  initialState,
  reducers: {
    setTrainingData(state, action: PayloadAction<Partial<TrainingState>>) {
      Object.assign(state, action.payload);
    },
    resetTrainingData(state) {
      Object.assign(state, initialState);
    }
  }
});

export default TrainingSlice.reducer;
export const { setTrainingData, resetTrainingData } = TrainingSlice.actions;
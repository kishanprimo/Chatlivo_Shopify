import { createSlice, PayloadAction, nanoid } from "@reduxjs/toolkit";

export type AutomationComponent = {
  id: string;
  type: string;
  data?: any; 
};

interface AutomationState {
  components: AutomationComponent[];
}

const initialState: AutomationState = {
  components: [],
};

const automationSlice = createSlice({
  name: "automation",
  initialState,
  reducers: {
    addComponent: (state, action: PayloadAction<string>) => {
      state.components.push({
        id: nanoid(),
        type: action.payload,
        data: {},
      });
    },

    removeComponent: (state, action: PayloadAction<string>) => {
      state.components = state.components.filter(
        (item) => item.id !== action.payload
      );
    },

    updateComponentData: (
      state,
      action: PayloadAction<{ id: string; data: any }>
    ) => {
      const component = state.components.find(
        (item) => item.id === action.payload.id
      );
      if (component) {
        component.data = { ...component.data, ...action.payload.data };
      }
    },

    /**
     * CRITICAL FOR UNDO/REDO:
     * This replaces the entire components array with a previous 
     * snapshot from your history.
     */
    setAllComponents: (state, action: PayloadAction<AutomationComponent[]>) => {
      state.components = action.payload;
    },
  },
});

export const { 
  addComponent, 
  removeComponent, 
  updateComponentData, 
  setAllComponents 
} = automationSlice.actions;

export default automationSlice.reducer;
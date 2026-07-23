import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { VisitorData } from "../types/ResTypes";

interface VisitorProfileState {
  selectedVisitor: VisitorData | null;
  profileData: any | null;
  isOverlayOpen: boolean;
  isFromVisitorList: boolean;
  isLoading: boolean;
  error: string | null;
  blockedOverrides: Record<string, boolean>;
}

const initialState: VisitorProfileState = {
  selectedVisitor: null,
  profileData: null,
  isOverlayOpen: false,
  isFromVisitorList: false,
  isLoading: false,
  error: null,
  blockedOverrides: {},
};

const VisitorProfileSlice = createSlice({
  name: "visitorProfile",
  initialState,
  reducers: {
    // Set selected visitor and open overlay
    setSelectedVisitor(
      state,
      action: PayloadAction<{
        visitor: VisitorData;
        isFromVisitorList?: boolean;
      }>,
    ) {
      state.selectedVisitor = action.payload.visitor;
      state.isOverlayOpen = true;
      state.isFromVisitorList = action.payload.isFromVisitorList || false;
      state.error = null;
    },

    // Open overlay
    openOverlay(state) {
      state.isOverlayOpen = true;
    },
    updateProfileBlocked: (
      state,
      action: PayloadAction<{ blocked: boolean; visitorId?: string }>,
    ) => {
      if (state.selectedVisitor)
        state.selectedVisitor.blocked = action.payload.blocked;
      if (state.profileData) state.profileData.blocked = action.payload.blocked;
      if (action.payload.visitorId) {
        state.blockedOverrides[action.payload.visitorId] =
          action.payload.blocked;
      }
    },

    // Close overlay
    closeOverlay(state) {
      state.isOverlayOpen = false;
      // Optional: clear selected visitor when closing
      // state.selectedVisitor = null;
    },
    setProfileData(state, action: PayloadAction<any>) {
      state.profileData = action.payload;
    },
    // Clear selected visitor
    clearSelectedVisitor(state) {
      state.selectedVisitor = null;
      state.profileData = null; // ← clear too
      state.isOverlayOpen = false;
      state.isFromVisitorList = false;
    },

    // Set loading state
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },

    // Set error state
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
  },
});

export default VisitorProfileSlice.reducer;
export const {
  setSelectedVisitor,
  openOverlay,
  closeOverlay,
  setProfileData,
  clearSelectedVisitor,
  updateProfileBlocked,
  setLoading,
  setError,
} = VisitorProfileSlice.actions;

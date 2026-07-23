import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

// Define the type for your state
interface ViewState {
  show_image?: boolean;
  image_src?: string;
  currentIndex?: number;
  show_video?: boolean;
  video_src?: string;
  accepted?: boolean;
  isExpanded?: boolean; //for the visitor profile expansion
  showBanner?: boolean; // for install popup
  isTaskCompleted?: boolean; // shuffling of secondsection to graph
  isTransitioning?: boolean;
}

// Define the initial state using the ViewState interface
const initialState: ViewState = {
  show_image: false,
  image_src: "",
  show_video: false,
  currentIndex: 0,
  video_src: "",
  accepted: false,
  isExpanded: true,
  showBanner: true,
  isTaskCompleted: false,
  isTransitioning: false,
};

// Create the slice with proper TypeScript types
const ViewMediaSlice = createSlice({
  name: "ViewMedia",
  initialState,
  reducers: {
    setViewMedia(state, action: PayloadAction<ViewState>) {
      state.show_image = action.payload.show_image;
      state.image_src = action.payload.image_src;
      state.show_video = action.payload.show_video;
      state.video_src = action.payload.video_src;
    },
    // setViewVideo(state, action: PayloadAction<ViewState>) {
    //   state.show_video = action.payload.show_video;
    //   state.video_src = action.payload.video_src;
    // },
    setTermsAccepted(state, action: PayloadAction<boolean>) {
      state.accepted = action.payload;
    },
    setExpandProfile(state, action: PayloadAction<boolean>) {
      state.isExpanded = action.payload;
    },

    // ✅ Add this reducer
    setShowBanner(
      state,
      action: PayloadAction<{
        showBanner?: boolean;
        isTaskCompleted?: boolean;
      }>,
    ) {
      state.showBanner = action.payload.showBanner;
      state.isTaskCompleted = action.payload.isTaskCompleted;
    },
    setTransitioning(state, action: PayloadAction<boolean>) {
      state.isTransitioning = action.payload;
    },
  },
});

// Export the reducer and actions
export default ViewMediaSlice.reducer;
export const {
  setViewMedia,
  setTermsAccepted,
  setExpandProfile,
  setShowBanner,
  setTransitioning,
} = ViewMediaSlice.actions;

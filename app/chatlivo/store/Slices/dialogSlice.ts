import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ModalState {
  Statistics: boolean;
  Settings: boolean;
  AddWebsiteUrl: boolean;
  SelectWebScraping: boolean;
  AddWebsite: boolean;
  AddMember: boolean;
  EditMember: boolean;
  AddComponents: boolean;
  AddTags: boolean;
  AddShortcuts: boolean;
  Logout: boolean;
  AddTagConversation: boolean;
  profilePopup: boolean;
  changePassword: boolean;
  sendResetPasswordLink: boolean;
  DeleteAccount: boolean;
  PaymentMethods: boolean;
  PaymentSuccessful: boolean;
  DeleteMember: boolean;
  DeleteTag: boolean;
  EditTag: boolean;
  DeleteTagFromList: boolean;
  BlockVisitor: boolean;
  VisitorStatus: boolean;
  AddAutomationNode: boolean;
  DeleteAutomation: boolean;
  CreateAutomation: boolean;
  DeleteShortcut: boolean;
  EditShortcut: boolean;
  SearchModal: boolean;
  DeleteLanguage: boolean;
  AddTrainingDialog: boolean;
  EditTrainingDialog: boolean;
  DeleteTrainingDialog: boolean;
  AddCSVDialog: boolean;
  AddcsvFile: boolean;
  AddpdfFile: boolean;
  AddCustomResponse: boolean;
  SelectWebScrapingDialog: boolean;
  AddWebsiteUrlDialog: boolean;
  WebsiteInfoDialog: boolean;
  SelectProductScanningDialog: boolean;
  scrapingType: "service" | "online" | null;
  websiteUrl: string;
  AddXMLDialog: boolean;
  AddShopifyDialog: boolean;
  AddFAQDialog: boolean;
  FAQEditor: boolean;
  websiteStep: number;
  websiteFlowComplete: boolean;
  TestingDialog: boolean;
  conversationLimitDialog: boolean;
  assignAgentModal: boolean;
  waAssignAgentModal: boolean;
  linkModal:boolean;
  showJoinConfirmModal:boolean;
  showLeaveConversationConfirmModal:boolean;
  showWaJoinConfirmModal:boolean;
  showWhatsAppDisconnectConfirmModal:boolean;
  liveChatPopup: boolean;
  helpPopup: boolean;
  PremiumModal:boolean;
  premiumModalContent: { title?: string; description?: string };
}

const initialState: ModalState = {
  Statistics: false,
  Settings: false,
  AddWebsiteUrl: false,
  SelectWebScraping: false,
  AddWebsite: false,
  AddMember: false,
  EditMember: false,
  AddComponents: false,
  AddTags: false,
  AddShortcuts: false,
  Logout: false,
  AddTagConversation: false,
  profilePopup: false,
  changePassword: false,
  sendResetPasswordLink: false,
  DeleteAccount: false,
  PaymentMethods: false,
  PaymentSuccessful: false,
  DeleteMember: false,
  DeleteTag: false,
  EditTag: false,
  DeleteTagFromList: false,
  BlockVisitor: false,
  VisitorStatus: false,
  AddAutomationNode: false,
  DeleteAutomation: false,
  CreateAutomation: false,
  DeleteShortcut: false,
  EditShortcut: false,
  SearchModal: false,
  DeleteLanguage: false,
  AddTrainingDialog: false,
  EditTrainingDialog: false,
  DeleteTrainingDialog: false,
  AddCSVDialog: false,
  AddcsvFile: false,
  AddpdfFile: false,
  AddCustomResponse: false,
  SelectWebScrapingDialog: false,
  AddWebsiteUrlDialog: false,
  WebsiteInfoDialog: false,
  SelectProductScanningDialog: false,
  scrapingType: null,
  websiteUrl: "",
  AddXMLDialog: false,
  AddShopifyDialog: false,
  AddFAQDialog: false,
  FAQEditor: false,
  websiteStep: 1,
  websiteFlowComplete: false,
  TestingDialog: false,
  conversationLimitDialog: false,
  assignAgentModal: false,
  waAssignAgentModal: false,
  linkModal: false,
  showJoinConfirmModal:false,
  showLeaveConversationConfirmModal:false,
  showWaJoinConfirmModal:false,
  showWhatsAppDisconnectConfirmModal:false,
  liveChatPopup: false,
  helpPopup: false,
  PremiumModal:false,
  premiumModalContent: {},
};

// Helper to extract only boolean keys
type OnlyBooleanKeys<T> = {
  [K in keyof T]: T[K] extends boolean ? K : never;
}[keyof T];

const dialogSlice = createSlice({
  name: "modals",
  initialState,
  reducers: {
    showModal: (state, action: PayloadAction<OnlyBooleanKeys<ModalState>>) => {
      const key = action.payload as keyof ModalState;
      (state as any)[key] = true;
    },
    hideModal: (state, action: PayloadAction<OnlyBooleanKeys<ModalState>>) => {
      const key = action.payload as keyof ModalState;
      (state as any)[key] = false;
    },
    setScrapingType: (
      state,
      action: PayloadAction<"service" | "online" | null>,
    ) => {
      state.scrapingType = action.payload;
    },
    setWebsiteStep: (state, action: PayloadAction<number>) => {
      state.websiteStep = action.payload;
    },
    setWebsiteFlowComplete: (state, action: PayloadAction<boolean>) => {
      state.websiteFlowComplete = action.payload;
    },
    setWebsiteUrl: (state, action: PayloadAction<string>) => {
      state.websiteUrl = action.payload;
    },
    showPremiumModal: {
      reducer: (
        state,
        action: PayloadAction<{ title?: string; description?: string }>,
      ) => {
        state.PremiumModal = true;
        state.premiumModalContent = action.payload;
      },
      prepare: (payload?: { title?: string; description?: string }) => ({
        payload: payload ?? {},
      }),
    },
  },
});

export const {
  showModal,
  hideModal,
  setScrapingType,
  setWebsiteStep,
  setWebsiteFlowComplete,
  setWebsiteUrl,
  showPremiumModal,
} = dialogSlice.actions;
export default dialogSlice.reducer;

import { combineReducers, configureStore } from "@reduxjs/toolkit";
import userConfigureSlice from "./Slices/userConfigureSlice";
import messageSlice from "./Slices/chatBoxMessageSlice";
import customChatSlice from "./Slices/customChatSlice";
import dialogSlice from "./Slices/dialogSlice";
import userEmailSlice from "./Slices/storeUserSigninDetailsSlice";
import chatBotSlice from "./Slices/ChatBotSlice";
import componentsSlice from "./Slices/setFieldsforPreChatForm";
import profileSlice from "./Slices/Agent/AgentProfileSlice";
import MemberSlice from "./Slices/MemberSlice";
import ChatListSlice from "./Slices/chatListSlice";
import CurrentConversationSlice from "./Slices/CurrentConversationSlice";
import messageListSlice from "./Slices/messageListSlice";
import accountSettingsSlice from "./Slices/AccountSettingsSlice";
import SendMessageSlice from "./Slices/SendMessageSlice";
import AddTagData from "./Slices/AddTagSlice";
import officeHoursSlice from "./Slices/officeHoursSlice";
import ViewMediaSlice from "./Slices/ViewMediaSlice";
import conversationListFilterSlice from "./Slices/ConversationListFilterSlice";
import SubscriptionPlanSlice from "./Slices/SubscriptionPlanSlice";
import TagSlice from "./Slices/TagSlice";
import OnlineVisitorsIdSlice from "./Slices/OnlineVisitorsId";
import automationSlice from "./Slices/automationSlice";
import ShortcutSlice from "./Slices/ShortcutSlice";
import delaySlice from "../(pages)/chatbots/nodes/Delay/DelaySlice";
import contactSlice from "../(pages)/chatbots/nodes/Contact/ContactSlice";
import decisionSlice from "../(pages)/chatbots/nodes/DecisionButton/DecisionSlice";
import nodeAutomationSlice from "../(pages)/chatbots/nodes/MessageType/AutomationSlice";
import agentTransferSlice from "../(pages)/chatbots/nodes/AutoAgentTransfer/AgentTransferSlice";
import assignAgentSlice from "../(pages)/chatbots/nodes/AssignAgent/AssignAgentSlice";
import decisionCardSlice from "../(pages)/chatbots/nodes/DecisionCard/DecisionCardSlice";
import tagAssignSlice from "../(pages)/chatbots/nodes/AddTag/TagAssignSlice";
import randomizeSlice from "../(pages)/chatbots/nodes/Randomize/RandomizeSlice";
import goToStepSlice from "../(pages)/chatbots/nodes/GoToStep/GoToStepSlice";
import SpecializedNodesSlice from "../(pages)/chatbots/nodes/FCA/SpecializedNodesSlice";
import apiCallSlice from "../(pages)/chatbots/nodes/APICall/ApiCallSlice";
import sendFormSlice from "../(pages)/chatbots/nodes/SendForm/SendFormSlice";
import userInputSlice from "../(pages)/chatbots/nodes/UserInput/UserInputSlice";
import faqSlice from "../(pages)/chatbots/nodes/FAQ's/FAQSlice";
import questionSlice from "../(pages)/chatbots/nodes/Question/QuestionSlice";
import TrainingSlice from "./Slices/TrainingSlice";
import setupSlice from "./Slices/SetupSlice";
import chatListFilterSlice from "./Slices/ChatListFilterSlice";
import whatsappReducer from "./Slices/whatsappSlice";
import linkModalSlice from "./Slices/LinkModalSlice";
import onlineAgentsIdSlice from "./Slices/Agent/OnlineAgentId";
import countSlice from "./Slices/countSlice";
import socketSlice from "./Slices/socketSlice";
import overviewSlice from "./Slices/overviewSlice";
import visitorProfileReducer from "./Slices/VisitorProfileSlice";
import agentAccountStatusSlice from './Slices/agentAccountStatusSlice';

// Node slices grouped under a single "nodes" domain
const nodesReducer = combineReducers({
  delay: delaySlice,
  contact: contactSlice,
  decision: decisionSlice,
  agentTransfer: agentTransferSlice,
  assignAgent: assignAgentSlice,
  decisionCard: decisionCardSlice,
  tagAssign: tagAssignSlice,
  randomize: randomizeSlice,
  goToStep: goToStepSlice,
  specializedNodes: SpecializedNodesSlice,
  apiCall: apiCallSlice,
  sendForm: sendFormSlice,
  userInput: userInputSlice,
  faq: faqSlice,
  question: questionSlice,
});

const rootReducer = combineReducers({
  userProfile: userConfigureSlice,
  message: messageSlice,
  customWidget: customChatSlice,
  dialog: dialogSlice,
  email: userEmailSlice,
  chatBot: chatBotSlice,
  components: componentsSlice,
  profile: profileSlice,
  Members: MemberSlice,
  chatList: ChatListSlice,
  messageList: messageListSlice,
  currentConversation: CurrentConversationSlice,
  accountSettings: accountSettingsSlice,
  sendMessage: SendMessageSlice,
  AddTagData: AddTagData,
  officeHours: officeHoursSlice,
  ViewMedia: ViewMediaSlice,
  conversationListFilter: conversationListFilterSlice,
  subscriptionPlan: SubscriptionPlanSlice,
  tag: TagSlice,
  onlineVisitorsId: OnlineVisitorsIdSlice,
  automation: nodeAutomationSlice,
  globalAutomation: automationSlice,
  setup: setupSlice,
  shortcut: ShortcutSlice,
  nodes: nodesReducer,
  training: TrainingSlice,
  chatListFilter: chatListFilterSlice,
  whatsapp: whatsappReducer,
  linkModal: linkModalSlice,
  onlineAgentsId: onlineAgentsIdSlice,
  count: countSlice,
  socket: socketSlice,
  overview: overviewSlice,
  visitorProfile: visitorProfileReducer,
  agentAccountStatusSlice:agentAccountStatusSlice,
});

// Derive RootState from the reducer — avoids circular reference with store
export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = ReturnType<typeof buildStore>["dispatch"];
export type AppStore = ReturnType<typeof buildStore>;

const buildStore = () => {
  return configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredPaths: ["sendMessage.selectedFile"],
          ignoredActionPaths: ["payload.selectedFile"],
        },
      }),
  });
};

export const store = buildStore();

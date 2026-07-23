export interface NavPage {
  url: string;
  title: string;
}

// Signup Res ======================================================
export interface SignupRes {
  success: boolean;
  message: string;
  data: SignupData;
  statusCode: number;
}

export interface SignupData {
  token: string;
  role: string;
  organization: string;
  is_chatbot: boolean;
  organization_id: number;
  is_user_verified: boolean;
  is_setup_complete: boolean;
  chatbot_id: number;
}

// Verify-OTP Res ===============================================================
export interface VerifyOtpRes {
  success: boolean;
  message: string;
  data: VerifyOtpData;
  statusCode: number;
}

export interface VerifyOtpData {
  token: string;
  role: string;
  organization_id: number;
  is_chatbot: boolean;
  is_user_verified: boolean;
  is_setup_complete: boolean;
}

// create chatbot Res =========================================================
export interface CreateChatBotData {
  id: number;
  organization_id: string;
  chat_bot_name: string;
  main_color: string;
  chatbot_position: string;
  chatbot_language: string;
  is_translation_enabled: boolean;
  button_theme: string;
  button_text: string;
  theme_color: string;
  profile_pic: string;
  message_blocks: string[];
  status_data: CreateChatBotAgentStatus[];
  agent_status: CreateChatBotAgentStatus[];
  createdAt: string;
  updatedAt: string;
  start_message_block_id: string;
}

export interface CreateChatBotAgentStatus {
  ask_for_email?: boolean;
  status: string;
  title: string;
  text_area: string;
}

// Get Block Types Res ============================================================
export interface GetBlockTypeRes {
  success: boolean;
  message: string;
  data: GetBlockTypeData[];
  statusCode: number;
}

export interface GetBlockTypeData {
  id: string;
  block_type: string;
  block_name: string;
  status: boolean;
}

// Update Chat bot response =========================================================
export interface UpdateChatBotRes {
  success: boolean;
  message: string;
  data: UpdateChatBotData;
  statusCode: number;
}

export interface UpdateChatBotData {
  organization_id: string;
  chat_bot_name: string;
  main_color: string;
  status_data: UpdateChatBotAgentStatus[];
  agent_status: UpdateChatBotAgentStatus[];
  chatbot_position: string;
  button_theme: string;
  button_text: string;
  theme_color: string;
  profile_pic: string;
  message_blocks: string[];
  start_message_block_id: string;
  id: number;
  createdAt: string;
  updatedAt: string;
  // id: string;
}

export interface UpdateChatBotAgentStatus {
  status: string;
  title: string;
  text_area: string;
  ask_for_email?: boolean;
}

export interface GetAllChatbotsData {
  id: string;
  organization_id: string;
  chat_bot_name: string;
  main_color: string;
  chatbot_position: string;
  button_theme: string;
  button_text: string;
  theme_color: string;
  profile_pic: string;
  welcome_message: string;
  message_blocks: string[];
  chatbot_language: string;
  is_translation_enabled: boolean;
  status_data: GetAllChatbotsStatusData[];
  agent_status: GetAllChatbotsAgentStatus[];
  createdAt: string;
  updatedAt: string;
  start_message_block: StartMessageBlockID;
  prechat_form: PrechatForm;
  no_response_time: string | number;
  show_notice: boolean;
  require_consent: boolean;
  privacy_link: string;
  prechat_form_submitted_message:string;
}

// Get single chatbot Res (get-chat-bot) =====================================================
export interface GetChatbotRes {
  success: boolean;
  message: string;
  data: GetAllChatbotsData;
  statusCode: number;
}

export interface StartMessageBlockID {
  id: number;
  chatbot_id: string;
  block_type: string;
  description: string;
  title: string;
  child_blocks: string[];
  parent_blocks: string[];
  is_deleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PrechatForm {
  is_enabled: boolean;
  fields: Fields;
  title?: string;
  description?: string;
  showNotice?: boolean;
  requireConsent?: boolean;
  privacyLink?: string;
}

export interface Fields {
  name: Name[];
}
export interface Name {
  title: string;
  required: boolean;
  is_enabled: boolean;
}
export interface GetAllChatbotsStatusData {
  status: string;
  title: string;
  status_label: string;
  text_area: string;
}

export interface GetAllChatbotsAgentStatus {
  ask_for_email?: boolean;
  status: string;
  title: string;
  text_area: string;
  confirmation_message: string;
  message_text: string;
}

// Agent List Res =====================================================

export interface AgentListRes {
  success: boolean;
  message: string;
  data: AgentListData;
  statusCode: number;
}

export interface AgentListPagination {
  total: number;
  page_no: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface AgentListData {
  data: AgentData[];
  pagination: AgentListPagination;
}

export interface AgentData {
  id: string;
  user_name: string;
  email: string;
  role: string;
  login_type: string;
  otp: number;
  socket_ids: string[];
  createdAt: string;
  updatedAt: string;
  organization: string;
  is_invite_accepted:boolean;
  profile_pic?: string;
  description: string;
  is_active: boolean;
  is_deleted: boolean;
  name: string;
}
export interface ContactListRes {
  success: boolean;
  message: string;
  data: ContactListData;
  statusCode: number;
}

export interface ContactListData {
  data: ContactData[];
  pagination: ContactListPagination;
  total_data: number;
  limit: number;
}

export interface ContactListPagination {
  total: number;
  page_no: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ContactData {
  id: string;
  organization: string;
  chat_bot: string;
  email: string;
  name: string;
  phone: string;
  country: string;
  navigation_tracking: NavPage[];
  role: string;
  devices: string[];
  ip_address: string;
  visits: number;
  socket_ids: string[];
  createdAt: string;
  updatedAt: string;
  chats: ContactChat[];
}

export interface ContactChat {
  id: string;
  organization: ContactOrganization;
  chat_bot: string;
  visitor_id: string;
  chat_status: string;
  user_ids: ContactUserIDElement[];
  chat_users?: VisitorChatUser[];
  createdAt: string;
  updatedAt: string;
}

export interface ContactOrganization {
  id: string;
  name: string;
}

export interface ContactUserIDElement {
  user_id: ContactUserID;
  status: boolean;
  lable: ContactUserIDOrganisation[];
  id?: string;
}

export interface ContactUserIDOrganisation {
  id: string;
  name: string;
}

export interface ContactUserID {
  id: string;
  user_name: string;
  role: string;
  profile_pic: string;
  name: string;
}

export interface UpdateAgentRes {
  success: boolean;
  message: string;
}

// Message List Res =====================================================
export interface MessageListRes {
  success: boolean;
  message: string;
  data: MessageData;
  statusCode: number;
}

export interface MessageData {
  messages: Message[];
  total: number;
  page: string;
  limit: string;
}

export interface Message {
  id: string;
  organization_id?: number;
  chat_bot_id?: string;
  chat_id: string;
  chat: MessageListChat;
  message_content: string;
  file_size: number;
  sender_type: string;
  seen: boolean;
  is_visitor_only: boolean;
  createdAt: string;
  updatedAt: string;
  message_type?: string;
  sender_id?: string;
  caption?: string;
}

export interface MessageListChat {
  id: string;
  organization_id: number;
  chat_bot_id: string;
  visitor_id: number;
  chat_status: string;
  user_ids: UserIDElement[];
  createdAt: string;
  updatedAt: string;
  chat_users: string[];
  visitor: MessageVisitor;
  is_restricted?: boolean;
  restrict_reason?: "chat_history" | "visitor_limit" | null;
}

export interface MessageVisitor {
  id: number;
  visitor_uuid?: string;
  organization_id: number;
  chat_bot_id: number;
  email: null;
  name: null;
  is_preview:boolean;
  phone: null;
  description: null;
  country: string;
  country_short_name: string;
  city: string | null;
  navigation_tracking: NavPage[];
  role: string;
  devices: string[];
  ip_address: string;
  visits: number;
  socket_ids: string[];
  referrer: null;
  blocked: boolean;
  visitor_admitted_month?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserIDElement {
  user_id: UserIDUserID;
  status: boolean;
  id: string;
}

export interface UserIDUserID {
  id: string;
  user_name: string;
  role: string;
  profile_pic?: string;
}

export interface VisitorID {
  id: string;
  visitor_uuid?: string;
  organization: string;
  chat_bot: string;
  email: string;
  name: string;
  phone: string;
  country: string;
  navigation_tracking: NavPage[];
  role: string;
  devices: string[];
  ip_address: string;
  visits: number;
  socket_ids: string[];
  createdAt: string;
  updatedAt: string;
}

// Send Message Res =====================================================
export interface Data {
  id: string;
  organization: string;
  chat: Chat;
  message_type: string;
  message_content: string;
  sender_type: string;
  sender_id: string;
  createdAt: string;
  updatedAt: string;
}

export interface Chat {
  id: string;
  organization: string;
  chat_bot: string;
  visitor_id: VisitorID;
  chat_status: string;
  user_ids: UserIDElement[];
  createdAt: string;
  updatedAt: string;
}

export interface UserIDElement {
  user_id: UserIDUserID;
  status: boolean;
  id: string;
}

export interface UserIDUserID {
  id: string;
  user_name: string;
  role: string;
}

export interface VisitorID {
  id: string;
  visitor_uuid?: string;
  organization: string;
  chat_bot: string;
  email: string;
  name: string;
  phone: string;
  country: string;
  navigation_tracking: NavPage[];
  role: string;
  devices: string[];
  ip_address: string;
  visits: number;
  socket_ids: string[];
  createdAt: string;
  updatedAt: string;
}

// Update Profile Res =====================================================
export interface UpdateProfileRes {
  success: boolean;
  message: string;
  data: Data;
  statusCode: number;
}

export interface Data {
  id: string;
  user_name: string;
  email: string;
  password: string;
  role: string;
  login_type: string;
  otp: number;
  socket_ids: string[];
  createdAt: string;
  updatedAt: string;
  organization_id: string;
  profile_pic: string;
  description: string;
  name: string;
  is_user_verified: boolean;
  is_active: boolean;
  is_deleted: boolean;
}

// Tag List Res =====================================================
export interface TagListRes {
  success: boolean;
  message: string;
  data: TagData;
  statusCode: number;
}

export interface TagData {
  data: Tag[];
  pagination: TagListPagination;
}

export interface Tag {
  id: number;
  organization: string;
  owner: string;
  name: string;
  color: string;
  status: boolean;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface TagListPagination {
  total: number;
  page_no: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Account Settings Response , organization/update ==================================================
export interface AccountSettingsRes {
  success: boolean;
  message: string;
  data: AccountSettingsData;
  statusCode: number;
}

export interface AccountSettingsData {
  id: number;
  name: string;
  description: null;
  time_zone: string;
  is_24_hours: boolean;
  office_hours_enabled:boolean;
  conversation_history: number;
  domain: string;
  powered_by: string;
  powered_by_url: string;
  owner_id: number;
  is_subscription_active: boolean;
  createdAt: Date;
  updatedAt: Date;
  office_hours: OfficeHour[];
}

export interface OfficeHour {
  day: string;
  status: boolean;
  start_time: string;
  end_time: string;
  id: string;
}

// Add User To Chat Res =====================================================
export interface AddUserToChatRes {
  success: boolean;
  message: string;
  data: AddUserToChatData;
  statusCode: number;
}

export interface AddUserToChatData {
  id: string;
  organization: string;
  chat_bot: string;
  visitor_id: string;
  chat_status: string;
  user_ids: AddUserToChatUserID[];
  createdAt: string;
  updatedAt: string;
}

export interface AddUserToChatUserID {
  user_id: string;
  status: boolean;
  id: string;
  lable?: string[];
}

// Get Reset Password Link Res ===========================================================
export interface GetResetPasswordLinkRes {
  success: boolean;
  message: string;
  statusCode: number;
}

// Check Reset Password Link Res ====================================================
export interface CheckResetPasswordLinkRes {
  success: boolean;
  message: string;
  statusCode: number;
}

// reset password Res =============================
export interface ResetPasswordRes {
  success: boolean;
  message: string;
  statusCode: number;
}

// Generate Script tag Response ========================
export interface GenerateScriptTagRes {
  success: boolean;
  message: string;
  data: GenerateScriptTagData;
  statusCode: number;
}

export interface GenerateScriptTagData {
  script_tag: string;
}

// Invite Agent Res ==========================
export interface InviteAgentRes {
  success: boolean;
  message: string;
  statusCode: number;
}

// Create Stripe Intent res ==================
export interface StripeIntentRes {
  message: string;
  data: StripeIntentData;
}
export interface StripeIntentData {
  client_secret: string;
}

// Get subscription plans Res ==========================
export interface SubscriptionPlansRes {
  success: boolean;
  message: string;
  data: SubscriptionPlansData[];
  statusCode: number;
}

export interface SubscriptionPlansData {
  id: string;
  plan_name: string;
  description?: string;
  plan_price: number;
  numbers_of_domains: number;
  numbers_of_tags: number;
  numbers_of_agents: number;
  chat_history: number;
  monthly_chat_visitors: number;
  max_shortcuts: number;
  pre_chat_form: boolean;
  ask_email: boolean;
  branding: boolean;
  whatsapp_channel: boolean;
  block_visitor: boolean;
  office_hours: boolean;
  status: boolean;
  validity_in_months: number;
}

// Active plan Res ==========================
export interface ActivePlanHistory {
  id: number;
  start_date: string;
  expiry_date: string;
  payment_type: "stripe" | "paypal" | "free" | null;
  payment_intent_id: string | null;
}

export interface ActivePlanRes {
  success: boolean;
  message: string;
  statusCode: number;
  data: {
    plan: SubscriptionPlansData | null;
    subscription_history: ActivePlanHistory | null;
  };
}

// Remove Label Res ==========================
export interface RemoveLabelRes {
  success: boolean;
  message: string;
  statusCode: number;
}

// close chat res ===========================
export interface CloseChatRes {
  success: boolean;
  message: string;
  statusCode: number;
}

// update label ==========================
export interface UpdateLabelRes {
  success: boolean;
  message: string;
  data: UpdateLabelData;
  statusCode: number;
}

export interface UpdateLabelData {
  id: string;
  organization: string;
  owner: string;
  name: string;
  color: string;
  status: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Delete Label Res ===========================
export interface DeleteLabelRes {
  success: boolean;
  message: string;
  statusCode: number;
}

// block visitor Res ============
export interface BlockVisitorRes {
  success: boolean;
  message: string;
  statusCode: number;
}

// Online Visitors Res =============
export interface OnlineVisitorsRes {
  success: boolean;
  message: string;
  data: string[];
  statusCode: number;
}

// Online Offline Visitor Event Res ================
export interface OnlineOfflineVisitorRes {
  chat_id: number;
  chat_status: string;
  name: string;
  email: string;
  organizationId: number;
  socketId: string;
  visitor_id: number;
  last_seen?: string;
  organization_id?: number;
  reason?: string;
}

// Online Offline Agent Event Res ================
export interface OnlineOfflineAgentRes {
  user_id: number;
  organization_id: number;
  name: string;
  role: string;
  socketId: string;
}

export interface OnlineAgentsRes {
  success: boolean;
  message: string;
  data: string[];
  statusCode: number;
}

// AddShortcut Res =================================
export interface AddShortcutRes {
  success: boolean;
  message: string;
  data: Data;
  statusCode: number;
}

export interface ShortcutData {
  createdAt: string;
  updatedAt: string;
  shortcut_status: boolean;
  id: number;
  shortcut_name: string;
  shortcut_text: string;
  organization_id: number;
  shortcut_type: string;
  owner_id: number;
}

// get all shortcut ===========================================
export interface GetAllShortcutRes {
  success: boolean;
  message: string;
  data: ShortcutListData;
  statusCode: number;
}

export interface ShortcutListData {
  data: GetAllShortcutData[];
  pagination: ShortcutListPagination;
}

export interface ShortcutListPagination {
  total: number;
  page_no: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface GetAllShortcutData {
  id: number;
  organization_id: number;
  owner_id: number;
  shortcut_name: string;
  shortcut_type: string;
  shortcut_text: string;
  shortcut_status: boolean;
  createdAt: string;
  updatedAt: string;
}

// update shortcut response ================================
export interface UpdateShortcutRes {
  success: boolean;
  message: string;
  data: UpdateShortcutData;
  statusCode: number;
}

export interface UpdateShortcutData {
  id: number;
  organization_id: number;
  owner_id: number;
  shortcut_name: string;
  shortcut_type: string;
  shortcut_text: string;
  shortcut_status: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// delete shortcut response ===============================
export interface DeleteShortcutRes {
  success: boolean;
  message: string;
  statusCode: number;
}

// user details response  ======================================
export interface UserDetailRes {
  success: boolean;
  message: string;
  data: UserDetailData;
  statusCode: number;
}

export interface UserDetailData {
  details: UserDetails;
  is_setup_complete: boolean;
  chatbot_id: string;
}

export interface UserDetails {
  id: number;
  user_id: number;
  department: string;
  platform: string;
  industry: string;
  website_visits: string;
  website_platform: string;
  business_model: string;
  website_url: string;
  createdAt: string;
  updatedAt: string;
}

export interface SocketMessage extends Omit<Message, "chat"> {
  chat: MessageListChat;
}

// visitor list response =====================================================
export interface AllVisitorsRes {
  success: boolean;
  message: string;
  data: {
    data: VisitorData[];
    pagination: VisitorPagination;
    total_data: number;
    stats: VisitorStats;
  };
  statusCode: number;
}

export interface VisitorData {
  id: number;
  visitor_uuid: string | null;
  organization_id: number;
  chat_bot_id: number;
  email: string | null;
  name: string | null;
  phone: string | null;
  description: string | null;
  country: string;
  country_short_name: string;
  city: string | null;
  navigation_tracking: NavPage[];
  role: string;
  devices: string[];
  ip_address: string;
  visits: number;
  socket_ids: string[];
  referrer: string | null;
  blocked: boolean;
  visitor_admitted_month: string | null;
  createdAt: string;
  updatedAt: string;
  chats: VisitorChat[];
}

export interface VisitorChat {
  id: number;
  organization_id: number;
  chat_bot_id: number;
  visitor_id: number;
  chat_status: string;
  notes: string | null;
  current_type: string | null;
  thread_id: string | null;
  type_history: any[];
  file_id: string | null;
  owner_unread_count: number;
  agent_unread_count: number;
  createdAt: string;
  updatedAt: string;
  chat_users: VisitorChatUser[];
  organization: VisitorOrganization;
}

export interface VisitorChatUser {
  id: number;
  chat_id: number;
  user_id: number;
  status: boolean;
  createdAt: string;
  updatedAt: string;
  user: VisitorUser;
  lables: any[];
}

export interface VisitorUser {
  name: string;
  user_name: string;
  profile_pic: string | null;
  role: string;
}

export interface VisitorOrganization {
  name: string;
}

export interface VisitorPagination {
  total: number;
  page_no: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface VisitorStats {
  visitor: {
    thisMonth: number;
    lastMonth: number;
    percentChange: number;
    total_visitor: number;
  };
  chat: {
    thisMonth: number;
    lastMonth: number;
    percentChange: number;
    total_conversations_chat: number;
  };
  contact?: {
    thisMonth: number;
    lastMonth: number;
    percentChange: number;
    total_contact: number;
  };
  realtime?: {
    online_visitors: number;
  };
}

export interface DashboardOverviewRes {
  success: boolean;
  message: string;
  data: { stats: VisitorStats };
  statusCode: number;
}

export interface RealtimeVisitorsRes {
  success: boolean;
  message: string;
  data: { online_visitors: number };
  statusCode: number;
}

// notification sounds =============================
export interface Sound {
  id: number;
  name: string;
  file_url: string;
}

export interface NotificationSoundRes {
  success: boolean;
  message: string;
  data: Sound[];
  statusCode: number;
}

// user-details res =================================
export interface UserDetails {
  id: number;
  user_id: number;
  department: string;
  platform: string;
  industry: string;
  website_visits: string;
  website_platform: string;
  business_model: string;
  new_chat_sound_id: number | null;
  new_message_sound_id: number | null;
  new_visitor_sound_id: number | null;
  sound_notifications_enabled: boolean;
  offline_notifications_enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GetUserDetailsRes {
  details: UserDetails;
  is_setup_complete: boolean;
  name: string;
}

export interface UserDetails {
  id: number;
  user_id: number;
  department: string;
  platform: string;
  industry: string;
  website_visits: string;
  website_platform: string;
  business_model: string;
  new_chat_sound_id: number | null;
  new_message_sound_id: number | null;
  new_visitor_sound_id: number | null;
  sound_notifications_enabled: boolean;
  offline_notifications_enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

// edit visitor res =====================================
export interface EditVisitorRes {
  success: boolean;
  message: string;
  data: { visitor: { id: number; name: string | null; email: string | null; phone: string | null; [key: string]: any } };
}
import type { StatusFilter } from "@/app/constants/statusFilter";
import type { NavPage } from "./ResTypes";

export interface ChatListRes {
  success: boolean;
  message: string;
  data: Data;
  statusCode: number;
}

export interface ChatListMeta {
  organization: {
    id: string;
    name: string;
    owner: string;
  } | null;
  chat_bot: ChatBot | null;
  chat_history_days: number;
}

export interface Data {
  data: ConversationData[];
  meta: ChatListMeta;
  pagination: Pagination;
  total_chats: number;
  open_chats: number;
  closed_chats: number;
  unassigned_chats: number;
  total_whatsapp_chats : number;
  unread_chats: UnreadChatCount;
  total_live_chat :number
}

export interface UnreadChatCount {
  all: number;
  open: number;
  unassigned: number;
  resolved: number;
}

export interface ConversationData {
  id: string;
  organization_id?: string;
  wa_conversation_id?: number;
  chat_bot_id?: string;
  channel?:string;
  visitor_id?: VisitorID;
  organization: Organization;
  chat_bot: ChatBot;
  visitor: VisitorID;
  chat_status: string;
  is_joined?: boolean;
  is_restricted?: boolean;
  restrict_reason?: "chat_history" | "visitor_limit" | null;
  chat_history_days?: number;
  user_ids: UserIDElement[];
  createdAt: string;
  updatedAt: string;
  notes: string;
  owner_unread_count?: number;
  agent_unread_count?: number;
  message: Message[];
  city?: string;
}

export interface ChatBot {
  id: string;
  organization_id: string;
  chat_bot_name: string;
  main_color: string;
  chatbot_position: string;
  button_theme: string;
  button_text: string;
  theme_color: string;
  profile_pic: string;
  message_blocks: string[];
  prechat_form: PrechatForm;
  status_data: AgentStatus[];
  agent_status: AgentStatus[];
  createdAt: string;
  updatedAt: string;
  start_message_block_id: string;
}

export interface AgentStatus {
  ask_for_email?: boolean;
  status: string;
  title: string;
  text_area: string;
}

export interface PrechatForm {
  is_enabled: boolean;
  fields: Fields;
}

export interface Fields {
  id?: number;
}

export interface Message {
  id: string;
  chat: string;
  message_type: string;
  message_content: string;
  sender_type: string;
  createdAt: string;
  caption?: string;
}

export interface Organization {
  id: string;
  name: string;
  owner: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserIDElement {
  user_id?: UserIDUserID;
  status?: boolean;
  id?: string;
  lable?: Lable[];
}

export interface Lable {
  id: number;
  organization: string;
  owner: string;
  name: string;
  color: string;
  status: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserIDUserID {
  id?: string;
  uid?: number;
  user_name: string;
  profile_pic?: string;
  name?: string;
  role: string;
}

export interface VisitorID {
  id: string;
  visitor_uuid?: string;
  organization: string;
  chat_bot: string;
  email: string;
  name: string;
  is_preview:boolean;
  phone: string;
  country: string;
  city?: string;
  navigation_tracking: NavPage[];
  role: string;
  devices: string[];
  ip_address: string;
  visits: number;
  referrer?: string | null;
  socket_ids: string[];
  chat_count?: number;
  is_online?: boolean;
  last_seen?: string;
  createdAt: string;
  updatedAt: string;
  blocked: boolean;
  visitor_admitted_month?: string;
}

export interface Pagination {
  total: number;
  totalPages: number;
  page_no: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
  statusFilter?: StatusFilter;
}

export type MessageStatus = "sent" | "delivered" | "read" | "failed" | null;

export interface NormalizedMessage {
  id: string;
  isMine: boolean;
  isSystem: boolean;
  sender_type: string;
  messageType: string;
  messageContent: string;
  mediaUrl?: string;
  caption?: string;
  fileSize?: number;
  fileName?: string;
  time: string;
  status: MessageStatus;
  seen?: boolean;
  senderInitials: string;
  senderProfilePic?: string;
  senderColor: string;
  translatedContent?: string;
  loadingTranslation?: boolean;
  isEmojiOnly?: boolean;
}

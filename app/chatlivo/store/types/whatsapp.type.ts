export interface WaAssignee {
  id: number;
  name: string;
  user_name: string;
  email: string;
  profile_pic?: string;
  role: string;
  assigned_by?: number;
  assignedAt: string;
}

export interface WaConversation {
  id: number;
  organization_id: number;
  whatsapp_account_id: number;
  phone_number: string;
  contact_name?: string;
  last_message?: string;
  sender_type?: string;
  last_message_timestamp?: string;
  status: "open" | "closed";
  blocked?: boolean;
  unread_count: number;
  notes?: string;
  assignees?: WaAssignee[];
  chat_count?: number;
  profile_pic?: string;
  profile_image_color?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WaMessage {
  id: number;
  conversation_id: number;
  whatsapp_message_id: string;
  direction: "inbound" | "outbound" | "system";
  sender_type?: "chat_bot";
  message_type:
  | "text"
  | "image"
  | "video"
  | "document"
  | "audio"
  | "link"
  | "sticker"
  | "location"
  | "contacts"
  | "template"
  | "interactive";
  message_content: string;
  contact_name?: string;
  file_size?: number;
  sender_name?: string;
  profile_pic?: string;
  sender_profile_pic?: string;
  contact_profile_pic?: string;
  media_url?: string;
  media_id?: string;
  media_mime_type?: string;
  caption?: string;
  status?: "sent" | "delivered" | "read" | "failed";
  timestamp: string;
  createdAt: string;
  updatedAt: string;
}

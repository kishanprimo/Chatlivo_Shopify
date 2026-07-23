// Invite agent status res ===============================================
export interface InviteStatusRes {
  success: boolean;
  message: string;
  statusCode: number;
}

// Invite Agent Res =========================================
export interface InviteAgentRes {
  success: boolean;
  message: string;
  statusCode: number;
}

export interface UpdateProfileRes {
  success: boolean;
  message: string;
  data: UpdateProfileData;
  statusCode: number;
}

export interface UpdateProfileData {
  id: string;
  user_name: string;
  email: string;
  password: string;
  role: string;
  login_type: string;
  otp: number;
  socket_ids: string[];
  createdAt: Date;
  updatedAt: Date;  
  organization: string;
  name: string;
  profile_pic: string;
  description: string;
}

// get profile res =======================================================
export interface ProfileData {
  id: number;
  organization_id: number;
  user_name: string;
  description: string;
  name: string;
  profile_pic: string;
  email: string;
  role: string;
  login_type: string;
  otp: number;
  otp_created_at: string;
  socket_ids: string[];
  is_user_verified: boolean;
  is_active: boolean;
  is_deleted: boolean;
  is_setup_complete: boolean;
  last_login: string;
  is_available: boolean;
  subscription_plan_id: number;
  invited_by: number | null;
  device_token: string | null;
  is_invite_accepted: boolean;
  country: string | null;
  city: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileResponse {
  success: boolean;
  message: string;
  data: ProfileData;
  statusCode: number;
}

// Update agent status Response ===========================================
export interface UpdateAgentStatusRes {
  success: boolean;
  message: string;
  data: UpdateAgentStatusData;
  statusCode: number;
}

export interface UpdateAgentStatusData {
  id: string;
  organization: string;
  user_name: string;
  description: string;
  email: string;
  password: string;
  role: string;
  login_type: string;
  otp: number;
  socket_ids: string[];
  is_user_verified: boolean;
  createdAt: Date;
  updatedAt: Date;  
  is_active: boolean;
  is_deleted: boolean;
}
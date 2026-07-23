import { GetUserDetailsRes, Sound, UserDetailRes } from "@/app/store/types/ResTypes";
import apiClient from "./apiClient";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  statusCode: number;
}

export interface NotificationSettingsPayload {
  new_chat_sound_id?: number;
  new_message_sound_id?: number;
  new_visitor_sound_id?: number;
  sound_notifications_enabled?: boolean;
  offline_notifications_enabled?: boolean;
}

export const notificationService = {
  getSounds: () =>
    apiClient
      .get<ApiResponse<Sound[]>>("/notification-sounds")
      .then((r) => r.data),
  updateSettings: (payload: NotificationSettingsPayload) =>
    apiClient
      .post<
        ApiResponse<UserDetailRes>
      >("/user-details/update-notification-settings", payload)
      .then((r) => r.data),
  getUserDetails: () =>
    apiClient
      .get<ApiResponse<GetUserDetailsRes>>("/user-details/get-user-details")
      .then((r) => r.data),
};

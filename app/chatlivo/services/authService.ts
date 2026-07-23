import apiClient from "./apiClient";
import { SignupRes, VerifyOtpRes, UpdateProfileRes } from "@/app/store/types/ResTypes";
import { UpdateProfileData, ProfileResponse } from "@/app/store/types/AgentResTypes";

export const authService = {
  signup: (payload: { email: string; name: string; login_type: string; time_zone?: string }) =>
    apiClient.post<SignupRes>("/auth/signup", payload).then((r) => r.data),

  verifyOtp: (payload: { otp: string; email: string }) =>
    apiClient.post<VerifyOtpRes>("/auth/verify-otp", payload).then((r) => r.data),

  getProfile: () =>
    apiClient.get<ProfileResponse>("/auth/profile").then((r) => r.data),

  updateProfile: (payload: Partial<UpdateProfileData> | Record<string, never>) =>
    apiClient.post<UpdateProfileRes>("/auth/update-profile", payload).then((r) => r.data),

  updateAvailability: (is_available: boolean) =>
    apiClient.patch<{ data: { is_available: boolean } }>("/auth/availability", { is_available }).then((r) => r.data),
};

/* eslint-disable @typescript-eslint/ban-ts-comment */

"use client";
import { useQuery } from "@tanstack/react-query";
import { useAppDispatch } from "@/app/utils/hooks";
import { ProfileResponse } from "@/app/store/types/AgentResTypes";
import { updateProfile } from "../Slices/Agent/AgentProfileSlice";
import { authService } from "@/services";
import { getValidToken } from "@/app/utils/tokenUtils";

export const useUserProfile = () => {
  const dispatch = useAppDispatch();
  const token = getValidToken();

  return useQuery<ProfileResponse, Error>({
    queryKey: ["/auth/profile"],
    queryFn: async () => {
      const data = await authService.getProfile();
      dispatch(updateProfile(data.data));
      return data;
    },
    enabled: !!token,
    staleTime: 5 * 60 * 1000,
  });
}

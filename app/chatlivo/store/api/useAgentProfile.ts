"use client";
import { useQuery } from "@tanstack/react-query";
import { useAppDispatch } from "@/app/utils/hooks";
import { setProfile } from "../Slices/Agent/AgentProfileSlice";
import Cookies from "js-cookie";
import { authService } from "@/services";

export const useAgentProfile = () => {
  const dispatch = useAppDispatch();
  const token = Cookies.get("chat_saas_auth_token");

  const { data, isLoading, error } = useQuery({
    queryKey: ["profile"],
    enabled: !!token,
    queryFn: async () => {
      try {
        const res = await authService.getProfile();
        dispatch(setProfile(res.data as any));
        return res.data;
      } catch (err) {
        console.error("Error fetching agent profile:", err);        
        throw new Error("Failed to fetch agent profile");
      }
    },
  });

  return { data, isLoading, error };
}

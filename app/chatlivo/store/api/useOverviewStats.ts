"use client";
import { useQuery } from "@tanstack/react-query";
import { useAppDispatch, useAppSelector } from "@/app/utils/hooks";
import Cookies from "js-cookie";
import { contactService } from "@/services";
import { getOrgIdFromToken } from "@/app/utils/tokenUtils";
import { setOverviewStats, setRealtimeVisitors } from "../Slices/overviewSlice";

export const useOverviewStats = () => {
  const dispatch = useAppDispatch();
  const token = Cookies.get("chat_saas_auth_token");
  const organization_id = getOrgIdFromToken();
  const selectedRange = useAppSelector((s) => s.overview.selectedRange);
  const range = selectedRange === "Last 7 days" ? "last7days" : "last30days";

  return useQuery({
    queryKey: ["overview-stats", organization_id, range],
    enabled: !!token && !!organization_id,
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const data = await contactService.getDashboardOverview(range);
      if (data?.data?.stats) {
        dispatch(setOverviewStats(data.data.stats));
      }
      return data;
    },
  });
};

export const useRealtimeVisitors = () => {
  const dispatch = useAppDispatch();
  const token = Cookies.get("chat_saas_auth_token");
  const organization_id = getOrgIdFromToken();

  return useQuery({
    queryKey: ["realtime-visitors", organization_id],
    enabled: !!token && !!organization_id,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      const data = await contactService.getRealtimeVisitors();
      if (data?.data?.online_visitors !== undefined) {
        dispatch(setRealtimeVisitors(data.data.online_visitors));
      }
      return data;
    },
  });
};

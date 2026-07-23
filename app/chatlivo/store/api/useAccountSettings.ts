"use client";
import { useQuery } from "@tanstack/react-query";
import { getOrgIdFromToken } from "@/app/utils/tokenUtils";
import { useAppDispatch } from "@/app/utils/hooks";
import { setAccountSettings } from "../Slices/AccountSettingsSlice";
import { setAllOfficeHours } from "../Slices/officeHoursSlice";
import { organizationService } from "@/services";
import { OfficeHour } from "../types/ResTypes";
import apiClient from "@/services/apiClient";
import { setActiveTZ } from "@/app/utils/timezone";

export const useAccountSettingsData = () => {
  const organization_id = getOrgIdFromToken();
  const dispatch = useAppDispatch();

  return useQuery({
    queryKey: ["organizationSettings", organization_id],
    queryFn: async () => {
      const [orgResponse, userDetailsResponse] = await Promise.allSettled([
        organizationService.getMyOrgs(),
        apiClient.get("/user-details/get-user-details"),
      ]);

      const response = orgResponse.status === "fulfilled" ? orgResponse.value : null;

      // GET /organization returns array for owners; pick the org matching the cookie
      const orgList = Array.isArray(response?.data) ? response.data : [response?.data];
      const org = orgList.find((o: any) => o?.id === organization_id) ?? orgList[0];
      if (!org) return null;

      const websiteUrl =
        userDetailsResponse.status === "fulfilled"
          ? userDetailsResponse.value?.data?.data?.details?.website_url || ""
          : "";

      const selectedZone = org.time_zone || "";
      setActiveTZ(selectedZone);

      dispatch(
        setAccountSettings({
          domain: org.domain || "",
          website_url: websiteUrl,
          selectedZone,
          conversationHistory: org.conversation_history || 0,
          powered_by: org.powered_by || "",
          powered_by_url: org.powered_by_url || "",
          is_24_hours: org.is_24_hours || false,
          office_hours_enabled: org.office_hours_enabled || false,
          is_script_install: org.is_script_install ?? false,
          whatsapp_widget_enabled: org.whatsapp_widget_enabled ?? false
        })
      );

      if (Array.isArray(org.office_hours)) {
        const days = [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ];

        const weekTimings = days.reduce((acc, day) => {
          const existing = org.office_hours.find((d: OfficeHour) => d.day === day);
          acc[day] = {
            enabled: existing?.status ?? false,
            start: existing?.start_time || "",
            end: existing?.end_time || "",
          };
          return acc;
        }, {} as Record<string, { enabled: boolean; start: string; end: string }>);

        dispatch(
          setAllOfficeHours({
            WholeDayHoursEnabled: org.is_24_hours || false,
            officeHoursEnabled: org.office_hours_enabled || false,
            weekTimings,
          })
        );
      }

      return org;
    },
  });
};

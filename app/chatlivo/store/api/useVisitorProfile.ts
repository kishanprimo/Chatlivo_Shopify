// useVisitorProfile.ts
import { useState } from "react";
import apiClient from "@/services/apiClient";
import { useAppDispatch } from "@/app/utils/hooks";
import { setProfileData } from "../Slices/VisitorProfileSlice";

export const useFetchVisitorProfile = () => {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);

  const fetchAndOpen = async (visitorId: string) => {
    setLoading(true);
    try {
      const res = await apiClient.get(`/visitor/visitor-profile/${visitorId}`);
      const visitor = res.data?.data;
      if (!visitor) return;

      // dispatch(
      //   updateCurrentConversation({
      //     conversation_id: String(lastChat?.id || ""),
      //     visitor_id: String(visitor.id),
      //     profile_image_color: color,
      //     visitor_name:
      //       visitor.name || visitor.visitor_uuid || String(visitor.id),
      //     name: visitor.name || "",
      //     email: visitor.email || "",
      //     phone: visitor.phone || "",
      //     chat_status: lastChat?.chat_status || "",
      //     organization_id: String(lastChat?.organization_id || ""),
      //     chat_bot_id: String(lastChat?.chat_bot_id || ""),
      //     is_restricted: isRestricted,
      //     restrict_reason: isRestricted ? "visitor_limit" : null,
      //     user_ids:
      //       lastChat?.chat_users?.map((cu: any) => ({
      //         user_id: {
      //           uid: cu.user?.id,
      //           name: cu.user?.name,
      //           user_name: cu.user?.user_name,
      //           role: cu.user?.role,
      //           profile_pic: cu.user?.profile_pic,
      //         },
      //         status: cu.status,
      //       })) ?? [],
      //     visits: visitor.visits,
      //     chats: visitor.chats?.length ?? 0,
      //     country: visitor.country,
      //     city: visitor.city,
      //     ip_address: visitor.ip_address,
      //     devices: visitor.devices,
      //     blocked: visitor.blocked,
      //     navigation_tracking: visitor.navigation_tracking || [],
      //     notes: lastChat?.notes || "",
      //     updatedAt: visitor.updatedAt,
      //     fromVisitorList: true,
      //     is_online: visitor.is_online,
      //   }),
      // );
      dispatch(setProfileData(visitor));
    } catch (err) {
      console.error("Failed to fetch visitor profile", err);
    } finally {
      setLoading(false);
    }
  };

  return { fetchAndOpen, loading };
};

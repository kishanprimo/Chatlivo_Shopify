import { useInfiniteQuery } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { ChatListRes } from "../types/chatlist.type";
import { updateChatList } from "../Slices/chatListSlice";
import { useAppDispatch } from "@/app/utils/hooks";
import { chatService } from "@/services";
import { useAppSelector } from "@/app/utils/hooks";
import { getOrgIdFromToken } from "@/app/utils/tokenUtils";

const LIMIT = 15;

export const useChatList = (search?: string) => {
  const token = Cookies.get("chat_saas_auth_token");
  const organization_id = getOrgIdFromToken();
  const dispatch = useAppDispatch();
  const { sortOrder, fromDate, toDate } = useAppSelector(
    (state) => state.chatListFilter,
  );
  const { statusFilter, channelFilter } = useAppSelector(
    (state) => state.conversationListFilter,
  );

  return useInfiniteQuery<ChatListRes, Error>({
    queryKey: [
      "chat-list",
      organization_id,
      sortOrder,
      fromDate,
      toDate,
      statusFilter,
      channelFilter,
      search ?? "",
    ],

    enabled: !!token && !!organization_id,
    initialPageParam: 1,
    staleTime: 0,
    queryFn: async ({ pageParam = 1 }) => {
      try {
        const data = await chatService.getChatList({
          page_no: Number(pageParam),
          limit: LIMIT,
          sortField: "updatedAt",
          sortOrder: sortOrder,
          fromDate: fromDate,
          toDate: toDate,
          statusFilter,
          channel: channelFilter === "all" ? undefined : channelFilter,
          search,
        });
        const chatBotId = (data?.data?.meta as any)?.chat_bot?.id;
        if (chatBotId) {
          Cookies.set("Chatbot_id", String(chatBotId), { expires: 7 });
        }
        if (Number(pageParam) === 1) {
          dispatch(updateChatList({ data: data.data.data, replace: true }));
        } else {
          dispatch(updateChatList({ data: data.data.data, replace: false }));
        }
        return data;
      } catch (error: any) {
        throw new Error(error.message || "Failed to fetch chat list");
      }
    },
    getNextPageParam: (lastPage) => {
      const pagination = lastPage?.data?.pagination;
      if (!pagination?.hasNext) {
        return undefined;
      }
      return Number(pagination.page_no) + 1;
    },
  });
};

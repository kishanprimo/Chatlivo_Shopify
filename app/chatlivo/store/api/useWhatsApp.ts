"use client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAppDispatch, useAppSelector } from "@/app/utils/hooks";
import {
  setMessages,
  prependMessages,
  setMessagesLoading,
  setMessagesLoadingMore,
  resetUnread,
} from "@/app/store/Slices/whatsappSlice";
import { whatsappService } from "@/services/whatsappService";
import Cookies from "js-cookie";

const PAGE_SIZE = 10;

export const useWaMessages = (conversationId: number | null) => {
  const dispatch = useAppDispatch();
  const token = Cookies.get("chat_saas_auth_token");

  return useQuery({
    queryKey: ["whatsapp-messages", conversationId],
    queryFn: async () => {
      if (!conversationId) return { data: [] };
      dispatch(setMessagesLoading(true));
      try {
        const res = await whatsappService.getMessages(conversationId, PAGE_SIZE, 0);
        const chronological = [...(res.data ?? [])].reverse();
        dispatch(setMessages({ messages: chronological, hasMore: (res.data ?? []).length === PAGE_SIZE }));
        return res;
      } finally {
        dispatch(setMessagesLoading(false));
      }
    },
    enabled: !!token && !!conversationId,
    staleTime: 0,
  });
};

export const useWaLoadMoreMessages = () => {
  const dispatch = useAppDispatch();
  const offset = useAppSelector((s) => s.whatsapp.messagesOffset);
  const hasMore = useAppSelector((s) => s.whatsapp.hasMoreMessages);
  const loadingMore = useAppSelector((s) => s.whatsapp.messagesLoadingMore);

  return async (conversationId: number) => {
    if (!hasMore || loadingMore) return;
    dispatch(setMessagesLoadingMore(true));
    try {
      const res = await whatsappService.getMessages(conversationId, PAGE_SIZE, offset);
      const older = [...(res.data ?? [])].reverse();
      dispatch(prependMessages({ messages: older, hasMore: (res.data ?? []).length === PAGE_SIZE }));
    } finally {
      dispatch(setMessagesLoadingMore(false));
    }
  };
};

export const useWaMarkRead = () => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  return async (conversationId: number) => {
    try {
      await whatsappService.markRead(conversationId);
      dispatch(resetUnread(conversationId));
      queryClient.invalidateQueries({ queryKey: ["whatsapp-conversations"] });
    } catch {
      // non-fatal
    }
  };
};

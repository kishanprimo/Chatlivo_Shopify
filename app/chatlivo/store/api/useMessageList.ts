import { useEffect, useRef, useState, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/app/utils/hooks";
import { updateMessageList, prependMessages } from "../Slices/messageListSlice";
import { chatService } from "@/services";

const PAGE_SIZE = 20;

export const useMessageList = () => {
  const conversationId = useAppSelector((s) => s.currentConversation.conversation_id);
  const isRestricted  = useAppSelector((s) => s.currentConversation.is_restricted);
  const dispatch       = useAppDispatch();

  // desc page numbering: page 1 = latest, page 2 = next older, etc.
  const [descPage,    setDescPage]    = useState(1);
  const [hasMore,     setHasMore]     = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const loadedConvRef = useRef<string | undefined>(undefined);
  const inFlightRef   = useRef(false); // single guard — prevents any duplicate call

  // ── Initial load: ONE call, page 1 desc = latest messages ──────────────
  useEffect(() => {
    if (!conversationId || isRestricted) return;
    if (loadedConvRef.current === String(conversationId)) return;

    loadedConvRef.current = String(conversationId);
    inFlightRef.current   = false;

    setDescPage(1);
    setHasMore(false);
    setMessagesLoading(true);
    dispatch(updateMessageList([]));

    inFlightRef.current = true;    
    chatService.getMessageList(String(conversationId), "1", String(PAGE_SIZE))
      .then((res) => {
        const msgs  = res?.data?.messages ?? [];
        const total = res?.data?.total    ?? 0;
        // API returns desc (newest first) → reverse so chat shows oldest→newest
        dispatch(updateMessageList([...msgs].reverse()));
        setHasMore(total > PAGE_SIZE);
      })
      .catch(() => {})
      .finally(() => { inFlightRef.current = false; }); setMessagesLoading(false);
  }, [conversationId, isRestricted]);

  // ── Load older messages on scroll-up: page 2, 3, … ─────────────────────
  const loadMore = useCallback(async () => {
    if (!conversationId || !hasMore || loadingMore || isRestricted) return;
    if (inFlightRef.current) return; // already fetching

    inFlightRef.current = true;
    setLoadingMore(true);

    const nextDescPage = descPage + 1;
    try {
      const res  = await chatService.getMessageList(String(conversationId), String(nextDescPage), String(PAGE_SIZE));
      const msgs  = res?.data?.messages ?? [];
      const total = res?.data?.total    ?? 0;

      if (msgs.length === 0) {
        setHasMore(false);
      } else {
        // Each desc page comes newest-first → reverse → prepend above existing
        dispatch(prependMessages([...msgs].reverse()));
        setDescPage(nextDescPage);
        // hasMore: pages already loaded = nextDescPage * PAGE_SIZE messages shown
        setHasMore(nextDescPage * PAGE_SIZE < total);
      }
    } catch {}

    inFlightRef.current = false;
    setLoadingMore(false);
  }, [conversationId, hasMore, loadingMore, descPage, isRestricted, dispatch]);

  return { loadMore, hasMore, loadingMore, messagesLoading  };
};

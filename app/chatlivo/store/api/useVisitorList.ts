import { useEffect, useRef } from "react";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { contactService } from "@/services";
import { AllVisitorsRes, VisitorData } from "../types/ResTypes";
import { getOrgIdFromToken } from "@/app/utils/tokenUtils";
import { socketInstance } from "@/app/socket/socket";

const LIMIT = 15;

const buildQueryKey = (organization_id: number | undefined, country?: string) =>
  ["visitor-list-online", organization_id, country];

export const useVisitorList = (country?: string, visitorIds?: string[]): any => {
  const token = Cookies.get("chat_saas_auth_token");
  const organization_id = getOrgIdFromToken();
  const queryClient = useQueryClient();

  const hasIds = Array.isArray(visitorIds) && visitorIds.length > 0;

  // Stable key — never includes visitorIds so socket handlers always write to the right cache entry
  const queryKey = buildQueryKey(organization_id, country);

  // Track current online IDs in a ref — used by queryFn and socket handlers
  const onlineIdsRef = useRef<string[]>(visitorIds ?? []);
  const queryKeyRef = useRef(queryKey);
  useEffect(() => {
    onlineIdsRef.current = visitorIds ?? [];
    queryKeyRef.current = queryKey;
  }, [visitorIds]);

  // visitorIds=[] means nobody online → skip fetch, show empty
  const isEmptyOnlineFilter = Array.isArray(visitorIds) && !hasIds;

  // Synchronously shared between onVisitorOnline/onVisitorNew so near-simultaneous
  // events for the same brand-new visitor (HTTP init emits visitor:new, socket
  // connect emits visitor:online) can't both pass the "already in list" check
  // before either has written the visitor into the query cache.
  const pendingIdsRef = useRef<Set<string>>(new Set());

  // ── Socket: visitor comes online ──────────────────────────────────────────
  useEffect(() => {
    if (!token || !organization_id) return;
    const socket = socketInstance();

    const onVisitorOnline = async (data: { visitor_id: string }) => {
      const id = String(data.visitor_id);
      const key = queryKeyRef.current;

      // Check if already in list
      const current = queryClient.getQueryData<{ pages: AllVisitorsRes[] }>(key);
      const allVisitors = current?.pages.flatMap((p) => p?.data?.data ?? []) ?? [];
      if (allVisitors.some((v) => String(v.id) === id)) return;
      if (pendingIdsRef.current.has(id)) return;
      pendingIdsRef.current.add(id);

      // Fetch single visitor from DB then prepend
      try {
        const res = await contactService.getAllVisitors(
          organization_id,
          { page_no: 1, limit: 1 },
          undefined,
          [id],
        );
        const fetched = res?.data?.data?.[0];
        if (!fetched) return;

        queryClient.setQueryData<{ pages: AllVisitorsRes[]; pageParams: unknown[] }>(
          key,
          (old) => {
            const emptyPage: AllVisitorsRes = {
              success: true,
              message: "",
              statusCode: 200,
              data: { data: [], pagination: { page_no: 1, limit: LIMIT, hasNext: false, total: 0 } as any, total_data: 0, stats: {} as any },
            };
            const base = old ?? { pages: [emptyPage], pageParams: [1] };
            const alreadyPresent = base.pages
              .flatMap((p) => p?.data?.data ?? [])
              .some((v) => String(v.id) === id);
            if (alreadyPresent) return base;
            const updatedPages = [...base.pages];
            updatedPages[0] = {
              ...updatedPages[0],
              data: {
                ...updatedPages[0].data,
                data: [fetched, ...updatedPages[0].data.data],
              },
            };
            return { ...base, pages: updatedPages };
          },
        );
      } catch {
      } finally {
        pendingIdsRef.current.delete(id);
      }
    };

    // ── Socket: visitor goes offline → remove from list ──────────────────────
    const onVisitorOffline = (data: { visitor_id: string }) => {
      const id = String(data.visitor_id);
      queryClient.setQueryData<{ pages: AllVisitorsRes[]; pageParams: unknown[] }>(
        queryKeyRef.current,
        (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              data: {
                ...page.data,
                data: page.data.data.filter((v) => String(v.id) !== id),
              },
            })),
          };
        },
      );
    };

    // ── Socket: brand-new visitor (never seen before) ────────────────────────
    const onVisitorNew = (data: { visitor: VisitorData }) => {
      const newVisitor = data.visitor;
      const id = String(newVisitor.id);
      if (pendingIdsRef.current.has(id)) return;

      queryClient.setQueryData<{ pages: AllVisitorsRes[]; pageParams: unknown[] }>(
        queryKeyRef.current,
        (old) => {
          const emptyPage: AllVisitorsRes = {
            success: true,
            message: "",
            statusCode: 200,
            data: { data: [], pagination: { page_no: 1, limit: LIMIT, hasNext: false, total: 0 } as any, total_data: 0, stats: {} as any },
          };
          const base = old ?? { pages: [emptyPage], pageParams: [1] };
          const allExisting = base.pages.flatMap((p) => p?.data?.data ?? []);
          if (allExisting.some((v) => String(v.id) === id)) return base;
          const updatedPages = [...base.pages];
          updatedPages[0] = {
            ...updatedPages[0],
            data: {
              ...updatedPages[0].data,
              data: [newVisitor, ...updatedPages[0].data.data],
            },
          };
          return { ...base, pages: updatedPages };
        },
      );
    };

    socket.on("visitor:online", onVisitorOnline);
    socket.on("visitor:offline", onVisitorOffline);
    socket.on("visitor_offline", onVisitorOffline);
    socket.on("visitor:new", onVisitorNew);

    return () => {
      socket.off("visitor:online", onVisitorOnline);
      socket.off("visitor:offline", onVisitorOffline);
      socket.off("visitor_offline", onVisitorOffline);
      socket.off("visitor:new", onVisitorNew);
    };
  }, [token, organization_id]);

  return useInfiniteQuery<AllVisitorsRes, Error>({
    queryKey,
    // Only fetch when there are online visitors to show
    enabled: !!token && !!organization_id && !isEmptyOnlineFilter,
    initialPageParam: 1,
    // Never auto-refetch — list is managed entirely by socket events
    staleTime: Infinity,
    gcTime: Infinity,
    queryFn: async ({ pageParam = 1 }) => {
      try {
        return await contactService.getAllVisitors(
          organization_id,
          { page_no: Number(pageParam), limit: LIMIT },
          country,
          // Initial load uses current online IDs snapshot
          onlineIdsRef.current.length > 0 ? onlineIdsRef.current : undefined,
        );
      } catch (error: any) {
        throw new Error(error.message || "Failed to fetch visitors");
      }
    },
    getNextPageParam: (lastPage) => {
      const pagination = lastPage?.data?.pagination;
      return pagination?.hasNext ? pagination.page_no + 1 : undefined;
    },
  });
};

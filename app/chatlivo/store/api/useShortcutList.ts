import Cookies from "js-cookie";
import { shortcutService } from "@/services";
import { useInfiniteQuery } from "@tanstack/react-query";
import { GetAllShortcutRes } from "../types/ResTypes";
import { getOrgIdFromToken } from "@/app/utils/tokenUtils";

const LIMIT = 15;

export const useShortcutList = () => {
  const token = Cookies.get("chat_saas_auth_token");
  const organization_id = getOrgIdFromToken();

  return useInfiniteQuery<GetAllShortcutRes, Error>({
  queryKey: ["/shortcut/all-shortcuts"],
    enabled: !!token && !!organization_id,
    initialPageParam: 1,
    staleTime: 5 * 60 * 1000,
    queryFn: async ({ pageParam = 1 }) => {
      try {
        return await shortcutService.getAllShortcuts(organization_id, {
          page_no: Number(pageParam),
          limit: LIMIT,
        });
      } catch (error: any) {
        throw new Error(error.message || "Failed to fetch shortcuts");
      }
    },
    getNextPageParam: (lastPage) => {
      const pagination = lastPage?.data?.pagination;
      return pagination?.hasNext ? pagination.page_no + 1 : undefined;
    },
  });
};
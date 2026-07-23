import { useInfiniteQuery } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { TagListRes } from "../types/ResTypes";
import { labelService } from "@/services";
import { getOrgIdFromToken } from "@/app/utils/tokenUtils";

const LIMIT = 15;

export const useTagsList = (options?: { enabled?: boolean }) => {
  const token = Cookies.get("chat_saas_auth_token");
  const organization_id = getOrgIdFromToken();

  const baseEnabled = !!token && !!organization_id;
  const enabled = options?.enabled !== undefined ? baseEnabled && options.enabled : baseEnabled;

  return useInfiniteQuery<TagListRes, Error>({
    queryKey: ["/lable/all-lables"],
    enabled,
    initialPageParam: 1,
    staleTime: 5 * 60 * 1000,
    queryFn: async ({ pageParam = 1 }) => {
      try {
        return await labelService.getAllLabels(organization_id, {
          page_no: Number(pageParam),
          limit: LIMIT,
        });
      } catch (error: any) {
        throw new Error(error.message || "Failed to fetch labels");
      }
    },
    getNextPageParam: (lastPage) => {
      const pagination = lastPage?.data?.pagination;
      return pagination?.hasNext ? pagination.page_no + 1 : undefined;
    },
  });
};

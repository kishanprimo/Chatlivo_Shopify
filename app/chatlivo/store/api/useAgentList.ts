import { useInfiniteQuery } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { organizationService } from "@/services";
import { getOrgIdFromToken } from "@/app/utils/tokenUtils";

const LIMIT = 15;

export const useAgentList = (search?: string, options?: { enabled?: boolean }): any => {
  const token = Cookies.get("chat_saas_auth_token");
  const organization_id = getOrgIdFromToken();

  const baseEnabled = !!token && !!organization_id;
  const enabled = options?.enabled !== undefined ? baseEnabled && options.enabled : baseEnabled;

  return useInfiniteQuery<any, Error>({
    queryKey: ["agent-list", organization_id, search],
    enabled,
    initialPageParam: 1,
    staleTime: 5 * 60 * 1000,
    queryFn: async ({ pageParam = 1 }) => {
      try {
        return await organizationService.getAllAgents({
          page_no: Number(pageParam),
          limit: LIMIT,
          search,
        });
      } catch (error: any) {
        throw new Error(error.message || "Failed to fetch agents");
      }
    },
    getNextPageParam: (lastPage) => {
      const pagination = lastPage?.data?.pagination;
      return pagination?.hasNext ? pagination.page_no + 1 : undefined;
    },
  });
};

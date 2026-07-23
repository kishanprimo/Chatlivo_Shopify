import { useInfiniteQuery } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { ContactListRes } from "../types/ResTypes";
import { contactService } from "@/services";
import { getOrgIdFromToken } from "@/app/utils/tokenUtils";

const LIMIT = 20;

export const useContactList = (search?: string) => {
  const token = Cookies.get("chat_saas_auth_token");
  const organization_id = getOrgIdFromToken();

  return useInfiniteQuery<ContactListRes, Error>({
    queryKey: ["contact-list", organization_id, search],
    enabled: !!token && !!organization_id,
    initialPageParam: 1,
    staleTime: 5 * 60 * 1000,
    queryFn: async ({ pageParam = 1 }) => {
      try {
        return await contactService.getAllContacts(organization_id, {
          page_no: Number(pageParam),
          limit: LIMIT,
        }, search);
      } catch (error: any) {
        throw new Error(error.message || "Failed to fetch contacts");
      }
    },
    getNextPageParam: (lastPage) => {
      const pagination = lastPage?.data?.pagination;
      return pagination?.hasNext ? pagination.page_no + 1 : undefined;
    },
  });
};

import { useQuery } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { contactService } from "@/services";
import { getOrgIdFromToken } from "@/app/utils/tokenUtils";

export const useChecklistStatus = () => {
  const token = Cookies.get("chat_saas_auth_token");
  const organizationId = getOrgIdFromToken();

  return useQuery({
    queryKey: ["/dashboard/checklist-status", organizationId],
    enabled: Boolean(token && organizationId),
    queryFn: () => contactService.getChecklistStatus(),
  });
};

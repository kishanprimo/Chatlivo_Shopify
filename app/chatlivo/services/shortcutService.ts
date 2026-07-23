import apiClient from "./apiClient";
import { GetAllShortcutRes } from "@/app/store/types/ResTypes";

export const shortcutService = {
  getAllShortcuts: (organization: number | undefined, pagination: { page_no: number; limit: number }) =>
    apiClient
      .post<GetAllShortcutRes>("/shortcut/get-all-shortcuts", { organization, page_no: pagination.page_no, limit: pagination.limit })
      .then((r) => r.data),
};

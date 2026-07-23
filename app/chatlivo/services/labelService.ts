import apiClient from "./apiClient";
import { TagListRes } from "@/app/store/types/ResTypes";

export const labelService = {
  getAllLabels: (
    organization: number | undefined,
    pagination: { page_no: number; limit: number },
  ) =>
    apiClient
      .post<TagListRes>("/lable/all-lables", {
        organization,
        page_no: pagination.page_no,
        limit: pagination.limit,
      })
      .then((r) => r.data),
};

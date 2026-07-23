import apiClient from "./apiClient";
import {
  ContactListRes,
  AllVisitorsRes,
  DashboardOverviewRes,
  RealtimeVisitorsRes,
  EditVisitorRes,
} from "@/app/store/types/ResTypes";

export const contactService = {
  getAllContacts: (
    organization: number | undefined,
    pagination: { page_no: number; limit: number },
    search?: string,
  ) =>
    apiClient
      .post<ContactListRes>("/organization/all-contacts", {
        organization,
        page_no: pagination.page_no,
        limit: pagination.limit,
        search,
      })
      .then((r) => r.data),

  getAllVisitors: (
    organization: number | undefined,
    pagination: { page_no: number; limit: number },
    country?: string,
    visitor_ids?: string[],
  ) =>
    apiClient
      .post<AllVisitorsRes>("/organization/all-visitors", {
        organization,
        page_no: pagination.page_no,
        limit: pagination.limit,
        country: country || undefined,
        ...(visitor_ids && visitor_ids.length > 0 && { visitor_ids }),
      })
      .then((r) => r.data),

  editVisitor: (
    visitor_id: number,
    field: "name" | "email" | "phone",
    value: string,
  ) =>
    apiClient
      .post<EditVisitorRes>("/visitor/edit-visitor", {
        visitor_id,
        [field]: value,
      })
      .then((r) => r.data),

  editWaContact: (
    conversation_id: number,
    field: "name" | "email" | "phone",
    value: string,
  ) =>
    apiClient
      .post(`/whatsapp/conversations/${conversation_id}/edit-contact`, {
        [field]: value,
      })
      .then((r) => r.data),

  getDashboardOverview: (range: "last30days" | "last7days" = "last30days") =>
    apiClient
      .get<DashboardOverviewRes>(`/dashboard/overview?range=${range}`)
      .then((r) => r.data),

  getRealtimeVisitors: () =>
    apiClient
      .get<RealtimeVisitorsRes>("/dashboard/realtime-visitors")
      .then((r) => r.data),

  getVisitorChart: (range: "last30days" | "last7days" = "last30days") =>
    apiClient
      .get<{
        success: boolean;
        data: { chart: { date: string; visitors: number }[] };
      }>(`/dashboard/visitor-chart?range=${range}`)
      .then((r) => r.data),

  getChecklistStatus: () =>
    apiClient
      .get<{
        success: boolean;
        data: {
          is_script_install: boolean;
          is_updated: boolean;
          has_live_conversation: boolean;
          has_whatsapp: boolean;
          is_walkthrough: boolean;
        };
      }>("/dashboard/checklist-status")
      .then((r) => r.data),
};

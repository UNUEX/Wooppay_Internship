import { Report, SessionUser } from "@/types";
import { request } from "./request";

export function getReport(user: SessionUser) {
  return request<Report>(`/api/reports?userId=${user.id}&role=${user.role}`);
}

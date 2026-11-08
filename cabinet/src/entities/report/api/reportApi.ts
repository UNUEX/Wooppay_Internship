import { request } from "@/shared/api";
import type { SessionUser } from "@/entities/user/@x/report";
import { Report } from "../model/types";

export function getReport(user: SessionUser) {
  return request<Report>(`/api/reports?userId=${user.id}&role=${user.role}`);
}

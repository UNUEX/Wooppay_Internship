import { request } from "@/shared/api";
import { SessionUser } from "../model/types";

export function getUsers() {
  return request<SessionUser[]>("/api/users");
}

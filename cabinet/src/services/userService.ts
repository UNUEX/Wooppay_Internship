import { SessionUser, UserFormData } from "@/types";
import { request } from "./request";

export function getUsers() {
  return request<SessionUser[]>("/api/users");
}

export function createUser(data: UserFormData) {
  return request<SessionUser>("/api/users", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

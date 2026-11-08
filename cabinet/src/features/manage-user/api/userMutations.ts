import { request } from "@/shared/api";
import { SessionUser, UserFormData } from "@/entities/user";

export function createUser(data: UserFormData) {
  return request<SessionUser>("/api/users", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateUser(id: number, data: UserFormData) {
  return request<SessionUser>(`/api/users/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

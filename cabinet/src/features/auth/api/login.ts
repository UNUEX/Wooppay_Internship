import { request } from "@/shared/api";
import { SessionUser } from "@/entities/user";

export function login(email: string, password: string) {
  return request<SessionUser>("/api/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

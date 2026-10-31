import { SessionUser } from "@/types";
import { request } from "./request";

export function login(email: string, password: string) {
  return request<SessionUser>("/api/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}
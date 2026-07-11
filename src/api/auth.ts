import { apiFetch, setTokens, clearTokens } from "./client";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "admin" | "employee";
  business: { id: string; name: string; slug: string; currency: string };
}

export async function registerBusiness(input: {
  businessName: string;
  adminName: string;
  email: string;
  password: string;
}): Promise<AuthUser> {
  const data = await apiFetch("/auth/register", { method: "POST", body: JSON.stringify(input) });
  setTokens(data.accessToken, data.refreshToken);
  return data.user;
}

export async function login(input: { email: string; password: string }): Promise<AuthUser> {
  const data = await apiFetch("/auth/login", { method: "POST", body: JSON.stringify(input) });
  setTokens(data.accessToken, data.refreshToken);
  return data.user;
}

export async function fetchMe(): Promise<AuthUser> {
  const data = await apiFetch("/auth/me");
  return data.user;
}

export function logout() {
  clearTokens();
}

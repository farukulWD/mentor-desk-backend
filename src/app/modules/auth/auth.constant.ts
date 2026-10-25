export const AUTH_COOKIE = "accessToken";
export const REFRESH_COOKIE = "refreshToken";

export const userSafeSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  createdAt: true,
} as const;

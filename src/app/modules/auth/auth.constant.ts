export const AUTH_COOKIE = "accessToken";

export const userSafeSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  createdAt: true,
} as const;

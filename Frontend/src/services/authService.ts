import api from "@/services/api";
import { mockApi } from "@/services/mockApi";
import { type ApiUser, normalizeUser } from "@/services/normalizers";
import { type ApiEnvelope, unwrapApiData } from "@/services/response";
import type { AuthResponse } from "@/types";

const useMock = import.meta.env.VITE_USE_MOCK_API === "true";

export const authService = {
  async login({ identifier, password }: { identifier: string; password: string }): Promise<AuthResponse> {
    if (useMock) {
      return mockApi.login(identifier, password);
    }

    const { data } = await api.post<AuthResponse<ApiUser> | ApiEnvelope<AuthResponse<ApiUser>>>("/auth/login", { identifier, password });
    const response = unwrapApiData(data);

    return {
      token: response.token,
      user: normalizeUser(response.user),
    };
  },
};

import api from "@/services/api";
import { mockApi } from "@/services/mockApi";
import { type ApiUser, normalizeUser } from "@/services/normalizers";
import { type ApiEnvelope, unwrapApiData } from "@/services/response";
import type { CreateUserPayload, ProfilePayload, User, UserRole } from "@/types";

const useMock = import.meta.env.VITE_USE_MOCK_API === "true";

const toApiRole = (role: UserRole) => (role === "admin" ? "ADMIN" : "USER");

export const userService = {
  async list(): Promise<User[]> {
    if (useMock) return mockApi.getUsers();

    const { data } = await api.get<ApiEnvelope<ApiUser[]> | ApiUser[]>("/users");
    return unwrapApiData(data).map(normalizeUser);
  },

  async updateProfile(userId: string, payload: ProfilePayload): Promise<User> {
    if (useMock) return mockApi.updateProfile(userId, payload);

    const { data } = await api.put<ApiEnvelope<ApiUser> | ApiUser>(`/users/${userId}`, payload);
    return normalizeUser(unwrapApiData(data));
  },

  async create(payload: CreateUserPayload): Promise<User> {
    if (useMock) return mockApi.createUser(payload);

    const { data } = await api.post<ApiEnvelope<ApiUser> | ApiUser>("/users", {
      ...payload,
      role: toApiRole(payload.role || "member"),
    });
    return normalizeUser(unwrapApiData(data));
  },

  async remove(userId: string): Promise<string> {
    if (useMock) {
      await mockApi.deleteUser(userId);
      return userId;
    }

    const { data } = await api.delete<ApiEnvelope<{ id: string }> | { id: string }>(`/users/${userId}`);
    return unwrapApiData(data).id;
  },
};

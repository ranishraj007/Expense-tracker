import { useCallback, useEffect, useState } from "react";
import { userService } from "@/services/userService";
import type { CreateUserPayload, ProfilePayload, User } from "@/types";

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setUsers(await userService.list());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load profiles.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  const updateProfile = useCallback(async (userId: string, payload: ProfilePayload) => {
    const updated = await userService.updateProfile(userId, payload);
    setUsers((current) => current.map((user) => (user.id === userId ? updated : user)));
    return updated;
  }, []);

  const createUser = useCallback(async (payload: CreateUserPayload) => {
    const created = await userService.create(payload);
    setUsers((current) => [created, ...current]);
    return created;
  }, []);

  const removeUser = useCallback(async (userId: string) => {
    const deletedId = await userService.remove(userId);
    setUsers((current) => current.filter((user) => user.id !== deletedId));
    return deletedId;
  }, []);

  const resetUserPassword = useCallback(async (userId: string, newPassword: string) => {
    const updated = await userService.updateProfile(userId, { newPassword });
    setUsers((current) => current.map((user) => (user.id === userId ? updated : user)));
    return updated;
  }, []);

  return { users, isLoading, error, reload: loadUsers, updateProfile, createUser, removeUser, resetUserPassword };
}

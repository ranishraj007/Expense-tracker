import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { authService } from "@/services/authService";
import type { User } from "@/types";

const TOKEN_KEY = "family_tracker_token";
const USER_KEY = "family_tracker_user";
const storage = import.meta.env.VITE_AUTH_STORAGE === "session" ? sessionStorage : localStorage;

type LoginInput = {
  identifier: string;
  password: string;
};

type AuthContextValue = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (input: LoginInput) => Promise<void>;
  logout: () => void;
  updateCurrentUser: (user: User) => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function readStoredUser() {
  const raw = storage.getItem(USER_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as User;
  } catch {
    storage.removeItem(USER_KEY);
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => readStoredUser());
  const [token, setToken] = useState<string | null>(() => storage.getItem(TOKEN_KEY));

  const login = useCallback(async (input: LoginInput) => {
    const response = await authService.login(input);
    storage.setItem(TOKEN_KEY, response.token);
    storage.setItem(USER_KEY, JSON.stringify(response.user));
    setToken(response.token);
    setUser(response.user);
  }, []);

  const logout = useCallback(() => {
    storage.removeItem(TOKEN_KEY);
    storage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const updateCurrentUser = useCallback((updatedUser: User) => {
    setUser(updatedUser);
    storage.setItem(USER_KEY, JSON.stringify(updatedUser));
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(user && token),
      login,
      logout,
      updateCurrentUser,
    }),
    [login, logout, token, updateCurrentUser, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}

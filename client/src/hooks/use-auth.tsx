import { createContext, ReactNode, useContext } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { insertUserSchema, User as SelectUser, InsertUser } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

type AuthContextType = {
  user: SelectUser | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<SelectUser, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<SelectUser, Error, InsertUser>;
};

type LoginData = {
  usernameOrEmail: string;
  password: string;
};

export const AuthContext = createContext<AuthContextType | null>(null);
export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const { t } = useTranslation();
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<SelectUser | null, Error>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  function normalizeMessage(raw: string): string {
    try {
      const jsonPart = raw.split(":").slice(1).join(":").trim();
      const parsed = JSON.parse(jsonPart);
      if (parsed?.message) {
        return mapMessage(parsed.message);
      }
    } catch {
      // fallback
      return mapMessage(raw);
    }
    return "Unknown";
  }

  function mapMessage(message: string): string {
    const map: Record<string, string> = {
      "Username already exists": "UsernameExists",
      "Email already in use": "EmailExists",
      "Invalid username or password": "InvalidCredentials",
      "Authentication token is required": "AuthRequired",
    };
    return map[message] || "Unknown";
  }

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      // התאמת השדות לפורמט שהשרת מצפה לו
      const serverCredentials = {
        username: credentials.usernameOrEmail, // השרת עדיין מצפה לשדה "username"
        password: credentials.password
      };

      const res = await apiRequest("POST", "/api/login", serverCredentials);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Unknown error");
      }
      return await res.json();
    },
    onSuccess: (user: SelectUser) => {
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: t("loginSuccess"),
        description: t("welcomeBackUser", { username: user.username }),
      });
    }, onError: (error: Error) => {
      const messageKey = normalizeMessage(error.message);
      const translated = t(`error${messageKey}`) || error.message;

      toast({
        title: t("loginFailed"),
        description: translated,
        variant: "destructive",
      });
    }
  });

  const registerMutation = useMutation({
    mutationFn: async (credentials: InsertUser) => {
      const res = await apiRequest("POST", "/api/register", credentials);
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`${res.status}: ${errorText}`);
      }
      return await res.json();
    },
    onSuccess: (user: SelectUser) => {
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "Registration successful",
        description: `Welcome to My Wallet, ${user.username}!`,
      });
    },
    onError: (error: Error) => {
      const messageKey = normalizeMessage(error.message);
      const translated = t(`error${messageKey}`) || error.message;
      toast({
        title: t("registerFailed"),
        description: translated,
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/user"], null);
      toast({
        title: t("logoutSuccess"),
        description: t("logoutSuccessDescription"),
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
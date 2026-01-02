import { apiClient, ApiError } from "./api";
import {
  clearAuthStorage,
  getAccessToken,
  getAuthStorageType,
  getStoredUser,
  setAuthTokens,
  setStoredUser,
} from "./api";

export interface User {
  id: number;
  name: string;
  email: string;
  organization_id?: number | null;
  created_at?: string | null;
}

interface AuthResponse {
  user: User;
  access_token: string;
  refresh_token: string;
}

class AuthService {
  private currentUser: User | null = null;

  async login(email: string, password: string, rememberMe = false): Promise<User> {
    const response = await apiClient.post<AuthResponse>(
      "/auth/login",
      { email, password },
      { skipAuth: true }
    );
    this.currentUser = response.user;
    setAuthTokens(
      {
        accessToken: response.access_token,
        refreshToken: response.refresh_token,
      },
      rememberMe
    );
    setStoredUser(response.user, rememberMe);
    return response.user;
  }

  async signup(data: {
    name: string;
    email: string;
    password: string;
    organization?: string;
  }): Promise<User> {
    const response = await apiClient.post<AuthResponse>(
      "/auth/register",
      {
        name: data.name,
        email: data.email,
        password: data.password,
      },
      { skipAuth: true }
    );
    this.currentUser = response.user;
    setAuthTokens(
      {
        accessToken: response.access_token,
        refreshToken: response.refresh_token,
      },
      true
    );
    setStoredUser(response.user, true);
    return response.user;
  }

  logout(): void {
    this.currentUser = null;
    clearAuthStorage();
  }

  updateCurrentUser(user: User | null): void {
    this.currentUser = user;
    const storageType = getAuthStorageType();
    if (user && storageType) {
      setStoredUser(user, storageType === "local");
    } else if (!user) {
      clearAuthStorage();
    }
  }

  async fetchCurrentUser(): Promise<User> {
    const response = await apiClient.get<{ user: User }>("/users/me");
    this.updateCurrentUser(response.user);
    return response.user;
  }

  getCurrentUser(): User | null {
    if (this.currentUser) return this.currentUser;

    const stored = getStoredUser();
    if (stored) {
      this.currentUser = stored;
      return this.currentUser;
    }

    return null;
  }

  isAuthenticated(): boolean {
    return Boolean(getAccessToken() && this.getCurrentUser());
  }

  async resetPassword(email: string): Promise<void> {
    await apiClient.post(
      "/auth/reset-password",
      { email },
      { skipAuth: true }
    );
  }

  isApiError(error: unknown): error is ApiError {
    return error instanceof ApiError;
  }
}

export const authService = new AuthService();

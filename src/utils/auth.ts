// Simple auth state management
export interface User {
  id: string;
  name: string;
  email: string;
  organization?: string;
}

class AuthService {
  private currentUser: User | null = null;

  login(email: string, password: string): User {
    // Mock login - in production, this would validate credentials
    const user: User = {
      id: "1",
      name: "Sarah Johnson",
      email: email,
      organization: "Community Health Foundation",
    };
    this.currentUser = user;
    localStorage.setItem("user", JSON.stringify(user));
    return user;
  }

  signup(data: { name: string; email: string; password: string; organization?: string }): User {
    // Mock signup - in production, this would create a new user
    const user: User = {
      id: Date.now().toString(),
      name: data.name,
      email: data.email,
      organization: data.organization,
    };
    this.currentUser = user;
    localStorage.setItem("user", JSON.stringify(user));
    return user;
  }

  logout(): void {
    this.currentUser = null;
    localStorage.removeItem("user");
  }

  getCurrentUser(): User | null {
    if (this.currentUser) return this.currentUser;
    
    const stored = localStorage.getItem("user");
    if (stored) {
      this.currentUser = JSON.parse(stored);
      return this.currentUser;
    }
    
    return null;
  }

  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }

  resetPassword(email: string): void {
    // Mock password reset - in production, this would send a reset email
    console.log("Password reset email sent to:", email);
  }
}

export const authService = new AuthService();
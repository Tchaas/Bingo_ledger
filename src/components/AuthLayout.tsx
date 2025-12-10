import { Outlet, Navigate } from "react-router";
import { authService } from "../utils/auth";

export function AuthLayout() {
  // If already logged in, redirect to app
  if (authService.isAuthenticated()) {
    return <Navigate to="/app" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Outlet />
    </div>
  );
}

import { Outlet, Navigate, useNavigate, useLocation } from "react-router";
import { authService } from "../utils/auth";
import { BookOpen, FileText, User, LogOut, BarChart } from "lucide-react";

export function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = authService.getCurrentUser();

  // If not logged in, redirect to login
  if (!user) {
    return <Navigate to="/" replace />;
  }

  const handleLogout = () => {
    authService.logout();
    navigate("/");
  };

  const isActive = (path: string) => {
    if (path === "/app" && (location.pathname === "/app" || location.pathname === "/app/ledger")) {
      return true;
    }
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with navigation */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-[1440px] mx-auto px-20">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 rounded p-1">
                <BookOpen className="size-5 text-white" />
              </div>
              <h1 className="text-gray-900">TchaasLedger</h1>
            </div>

            {/* Navigation Tabs */}
            <nav className="flex gap-8">
              <button
                onClick={() => navigate("/app/ledger")}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive("/app/ledger") || isActive("/app")
                    ? "bg-blue-50 text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <BookOpen className="size-4" />
                <span>Ledger</span>
              </button>

              <button
                onClick={() => navigate("/app/tax-form")}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive("/app/tax-form")
                    ? "bg-blue-50 text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <FileText className="size-4" />
                <span>990 Tax Form</span>
              </button>

              <button
                onClick={() => navigate("/app/category-review")}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive("/app/category-review")
                    ? "bg-blue-50 text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <BarChart className="size-4" />
                <span>Category Review</span>
              </button>

              <button
                onClick={() => navigate("/app/profile")}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive("/app/profile")
                    ? "bg-blue-50 text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <User className="size-4" />
                <span>Profile</span>
              </button>
            </nav>

            {/* User menu */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="size-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
                  {user.name.charAt(0)}
                </div>
                <span className="text-gray-700">{user.name}</span>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
                title="Logout"
              >
                <LogOut className="size-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-[1440px] mx-auto px-20 py-8">
        <Outlet />
      </main>
    </div>
  );
}
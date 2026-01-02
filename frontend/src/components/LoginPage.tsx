import { useState } from "react";
import { useNavigate } from "react-router";
import { authService } from "../utils/auth";
import { Mail, Lock, Eye, X } from "lucide-react";
import { toast } from "sonner@2.0.3";

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Please enter both email and password");
      return;
    }

    try {
      await authService.login(email, password, rememberMe);
      toast.success("Successfully logged in!");
      navigate("/app");
    } catch (error) {
      if (authService.isApiError(error)) {
        toast.error(error.message || "Login failed. Please try again.");
      } else {
        toast.error("Login failed. Please try again.");
      }
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!resetEmail) {
      toast.error("Please enter your email");
      return;
    }

    try {
      await authService.resetPassword(resetEmail);
      toast.success("Password reset email sent!");
      setShowForgotPassword(false);
    } catch (error) {
      if (authService.isApiError(error)) {
        toast.error(error.message || "Failed to send password reset email. Please try again.");
      } else {
        toast.error("Failed to send password reset email. Please try again.");
      }
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-12">
        <h1 className="text-gray-900 mb-2">Welcome back</h1>
        <p className="text-gray-600">Sign in to your account to continue</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email field */}
        <div>
          <label htmlFor="email" className="block text-gray-700 mb-2">
            Email Address
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Mail className="size-4" />
            </div>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full h-12 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            />
          </div>
        </div>

        {/* Password field */}
        <div>
          <label htmlFor="password" className="block text-gray-700 mb-2">
            Password
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Lock className="size-4" />
            </div>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full h-12 pl-10 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <Eye className="size-4" />
            </button>
          </div>
        </div>

        {/* Remember me & Forgot password */}
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="size-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
            />
            <span className="text-gray-600">Remember me</span>
          </label>
          <button type="button" className="text-blue-600 hover:text-blue-700" onClick={() => setShowForgotPassword(true)}>
            Forgot password?
          </button>
        </div>

        {/* Sign in button */}
        <button
          type="submit"
          className="w-full h-12 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Sign In
        </button>
      </form>

      {/* Divider */}
      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center">
          <span className="px-4 bg-gray-50 text-gray-500">or</span>
        </div>
      </div>

      {/* Create account */}
      <div className="text-center space-y-3">
        <p className="text-gray-600">Don't have an account?</p>
        <button
          onClick={() => navigate("/signup")}
          className="text-blue-600 hover:text-blue-700"
        >
          Create one now
        </button>
      </div>

      {/* Footer links */}
      <div className="mt-16 text-center space-y-3">
        <p className="text-gray-500">Need help?</p>
        <div className="flex items-center justify-center gap-2 text-gray-500">
          <button className="hover:text-gray-700">Support</button>
          <span>•</span>
          <button className="hover:text-gray-700">Privacy</button>
          <span>•</span>
          <button className="hover:text-gray-700">Terms</button>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-gray-900">Forgot Password</h2>
                <button
                  onClick={() => {
                    setShowForgotPassword(false);
                    setResetEmail("");
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="size-6" />
                </button>
              </div>
            </div>
            
            <form onSubmit={handleForgotPassword} className="p-6 space-y-4">
              <p className="text-gray-600">
                Enter your email address and we'll send you a link to reset your password.
              </p>

              <div>
                <label htmlFor="resetEmail" className="block text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Mail className="size-4" />
                  </div>
                  <input
                    id="resetEmail"
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full h-12 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPassword(false);
                    setResetEmail("");
                  }}
                  className="flex-1 h-10 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 h-10 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Send Reset Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

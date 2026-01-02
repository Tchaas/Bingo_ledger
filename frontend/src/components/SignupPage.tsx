import { useState } from "react";
import { useNavigate } from "react-router";
import { authService } from "../utils/auth";
import { User, Mail, Lock, Building } from "lucide-react";
import { toast } from "sonner@2.0.3";

export function SignupPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    organization: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.password || !formData.organization) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    try {
      await authService.signup({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        organization: formData.organization,
      });
      toast.success("Account created successfully!");
      navigate("/app");
    } catch (error) {
      if (authService.isApiError(error)) {
        toast.error(error.message || "Failed to create account. Please try again.");
      } else {
        toast.error("Failed to create account. Please try again.");
      }
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-12">
        <h1 className="text-gray-900 mb-2">Create your account</h1>
        <p className="text-gray-600">Get started with your nonprofit ledger</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Name field */}
        <div>
          <label htmlFor="name" className="block text-gray-700 mb-2">
            Full Name *
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <User className="size-4" />
            </div>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              className="w-full h-12 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            />
          </div>
        </div>

        {/* Email field */}
        <div>
          <label htmlFor="email" className="block text-gray-700 mb-2">
            Email Address *
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Mail className="size-4" />
            </div>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className="w-full h-12 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            />
          </div>
        </div>

        {/* Organization field */}
        <div>
          <label htmlFor="organization" className="block text-gray-700 mb-2">
            Organization *
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Building className="size-4" />
            </div>
            <input
              id="organization"
              name="organization"
              type="text"
              value={formData.organization}
              onChange={handleChange}
              placeholder="Enter your organization name"
              className="w-full h-12 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            />
          </div>
        </div>

        {/* Password field */}
        <div>
          <label htmlFor="password" className="block text-gray-700 mb-2">
            Password *
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Lock className="size-4" />
            </div>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a password"
              className="w-full h-12 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            />
          </div>
        </div>

        {/* Confirm password field */}
        <div>
          <label htmlFor="confirmPassword" className="block text-gray-700 mb-2">
            Confirm Password *
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Lock className="size-4" />
            </div>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              className="w-full h-12 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            />
          </div>
        </div>

        {/* Create account button */}
        <button
          type="submit"
          className="w-full h-12 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Create Account
        </button>
      </form>

      {/* Sign in link */}
      <div className="mt-8 text-center space-y-3">
        <p className="text-gray-600">Already have an account?</p>
        <button
          onClick={() => navigate("/")}
          className="text-blue-600 hover:text-blue-700"
        >
          Sign in instead
        </button>
      </div>
    </div>
  );
}

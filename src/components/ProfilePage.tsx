import { useState } from "react";
import { authService } from "../utils/auth";
import { Edit2 } from "lucide-react";
import { toast } from "sonner@2.0.3";

export function ProfilePage() {
  const currentUser = authService.getCurrentUser();
  const [personalInfo, setPersonalInfo] = useState({
    firstName: currentUser?.name.split(' ')[0] || "Sarah",
    lastName: currentUser?.name.split(' ')[1] || "Johnson",
    email: currentUser?.email || "sarah.johnson@nonprofit.org",
  });

  const [organizationInfo, setOrganizationInfo] = useState({
    organizationName: currentUser?.organization || "Community Hope Foundation",
    ein: "XX-XXXXXXX",
    organizationType: "501c3",
    address: "123 Main Street, Suite 400",
    city: "",
    state: "",
    zipCode: "",
    organizationSize: "25-50 employees",
    bio: "Dedicated to improving lives through community programs and charitable initiatives.",
  });

  const handlePersonalInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPersonalInfo({
      ...personalInfo,
      [e.target.name]: e.target.value,
    });
  };

  const handleOrganizationChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setOrganizationInfo({
      ...organizationInfo,
      [e.target.name]: e.target.value,
    });
  };

  const handleSavePersonalInfo = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Personal information updated");
  };

  const handleSaveOrganization = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Organization details updated");
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-gray-900 mb-1">Profile Settings</h1>
        <p className="text-gray-600">Manage your account and organization information</p>
      </div>

      {/* Personal Information Section */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-gray-900">Personal Information</h2>
          <button className="flex items-center gap-2 text-blue-600 hover:text-blue-700">
            <Edit2 className="size-3.5" />
            <span>Edit</span>
          </button>
        </div>

        <form onSubmit={handleSavePersonalInfo} className="space-y-6">
          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 mb-2">First Name</label>
              <input
                type="text"
                name="firstName"
                value={personalInfo.firstName}
                onChange={handlePersonalInfoChange}
                className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Last Name</label>
              <input
                type="text"
                name="lastName"
                value={personalInfo.lastName}
                onChange={handlePersonalInfoChange}
                className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-gray-700 mb-2">Email Address</label>
            <input
              type="email"
              name="email"
              value={personalInfo.email}
              onChange={handlePersonalInfoChange}
              className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          {/* Save Button */}
          <div className="pt-6 border-t border-gray-200">
            <button
              type="submit"
              className="px-10 h-12 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>

      {/* Organization Details Section */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-gray-900">Organization Details</h2>
          <button className="flex items-center gap-2 text-blue-600 hover:text-blue-700">
            <Edit2 className="size-3.5" />
            <span>Edit</span>
          </button>
        </div>

        <form onSubmit={handleSaveOrganization} className="space-y-6">
          {/* Organization Name */}
          <div>
            <label className="block text-gray-700 mb-2">Organization Name</label>
            <input
              type="text"
              name="organizationName"
              value={organizationInfo.organizationName}
              onChange={handleOrganizationChange}
              className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          {/* EIN */}
          <div>
            <label className="block text-gray-700 mb-2">EIN (Tax ID)</label>
            <input
              type="text"
              name="ein"
              value={organizationInfo.ein}
              onChange={handleOrganizationChange}
              className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          {/* Organization Type */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 mb-2">Organization Type</label>
              <select
                name="organizationType"
                value={organizationInfo.organizationType}
                onChange={handleOrganizationChange}
                className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="501c3">501(c)(3) Public Charity</option>
                <option value="501c4">501(c)(4) Social Welfare</option>
                <option value="501c6">501(c)(6) Business League</option>
              </select>
            </div>
            <div>
              {/* Placeholder for visual balance */}
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-gray-700 mb-2">Address</label>
            <input
              type="text"
              name="address"
              value={organizationInfo.address}
              onChange={handleOrganizationChange}
              className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 mb-3"
            />
            <div className="grid grid-cols-3 gap-3">
              <input
                type="text"
                name="city"
                value={organizationInfo.city}
                onChange={handleOrganizationChange}
                placeholder="City"
                className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              <input
                type="text"
                name="state"
                value={organizationInfo.state}
                onChange={handleOrganizationChange}
                placeholder="State"
                className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              <input
                type="text"
                name="zipCode"
                value={organizationInfo.zipCode}
                onChange={handleOrganizationChange}
                placeholder="ZIP Code"
                className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          {/* Organization Size */}
          <div>
            <label className="block text-gray-700 mb-2">Organization Size</label>
            <input
              type="text"
              name="organizationSize"
              value={organizationInfo.organizationSize}
              onChange={handleOrganizationChange}
              placeholder="e.g., 25-50 employees"
              className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          {/* Company Bio */}
          <div>
            <label className="block text-gray-700 mb-2">Organization Bio</label>
            <textarea
              name="bio"
              value={organizationInfo.bio}
              onChange={handleOrganizationChange}
              placeholder="Describe your organization..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
            />
          </div>

          {/* Save Button */}
          <div className="pt-6 border-t border-gray-200">
            <button
              type="submit"
              className="px-10 h-12 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Update Organization
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
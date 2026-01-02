import { useEffect, useState } from "react";
import { authService, type User } from "../utils/auth";
import { apiClient } from "../utils/api";
import { Edit2 } from "lucide-react";
import { toast } from "sonner@2.0.3";

type Organization = {
  id: number;
  name: string;
  ein: string;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zip_code?: string | null;
  phone?: string | null;
  website?: string | null;
  tax_exempt_status?: string | null;
};

const splitName = (name: string) => {
  const [firstName = "", ...rest] = name.split(" ").filter(Boolean);
  return { firstName, lastName: rest.join(" ") };
};

export function ProfilePage() {
  const currentUser = authService.getCurrentUser();
  const initialName = currentUser?.name ?? "";
  const { firstName: initialFirstName, lastName: initialLastName } = splitName(initialName);
  const [personalInfo, setPersonalInfo] = useState({
    firstName: initialFirstName || "Sarah",
    lastName: initialLastName || "Johnson",
    email: currentUser?.email || "sarah.johnson@nonprofit.org",
  });
  const [organizationId, setOrganizationId] = useState<number | null>(
    currentUser?.organization_id ?? null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingPersonal, setIsSavingPersonal] = useState(false);
  const [isSavingOrganization, setIsSavingOrganization] = useState(false);

  const [organizationInfo, setOrganizationInfo] = useState({
    organizationName: "Community Hope Foundation",
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
    const updateProfile = async () => {
      try {
        setIsSavingPersonal(true);
        const name = `${personalInfo.firstName} ${personalInfo.lastName}`.trim();
        const response = await apiClient.put<{ user: User }>(
          "/users/me",
          {
            name,
            email: personalInfo.email,
          }
        );
        if (response.user) {
          authService.updateCurrentUser(response.user);
        }
        toast.success("Personal information updated");
      } catch (error) {
        const message = authService.isApiError(error)
          ? error.message
          : "Failed to update personal information";
        toast.error(message);
      } finally {
        setIsSavingPersonal(false);
      }
    };
    void updateProfile();
  };

  const handleSaveOrganization = (e: React.FormEvent) => {
    e.preventDefault();
    if (!organizationId) {
      toast.error("No organization is linked to this account.");
      return;
    }

    const updateOrganization = async () => {
      try {
        setIsSavingOrganization(true);
        const response = await apiClient.put<{ organization: Organization }>(
          `/organizations/${organizationId}`,
          {
            name: organizationInfo.organizationName,
            ein: organizationInfo.ein,
            address: organizationInfo.address,
            city: organizationInfo.city,
            state: organizationInfo.state,
            zip_code: organizationInfo.zipCode,
            tax_exempt_status: organizationInfo.organizationType,
          }
        );
        if (response.organization) {
          setOrganizationInfo((prev) => ({
            ...prev,
            organizationName: response.organization.name ?? prev.organizationName,
            ein: response.organization.ein ?? prev.ein,
            address: response.organization.address ?? prev.address,
            city: response.organization.city ?? prev.city,
            state: response.organization.state ?? prev.state,
            zipCode: response.organization.zip_code ?? prev.zipCode,
            organizationType:
              response.organization.tax_exempt_status ?? prev.organizationType,
          }));
        }
        toast.success("Organization details updated");
      } catch (error) {
        const message = authService.isApiError(error)
          ? error.message
          : "Failed to update organization details";
        toast.error(message);
      } finally {
        setIsSavingOrganization(false);
      }
    };
    void updateOrganization();
  };

  useEffect(() => {
    let isMounted = true;
    const loadProfile = async () => {
      try {
        setIsLoading(true);
        const user = await authService.fetchCurrentUser();
        if (!isMounted) return;

        const { firstName, lastName } = splitName(user.name ?? "");
        setPersonalInfo((prev) => ({
          ...prev,
          firstName: firstName || prev.firstName,
          lastName: lastName || prev.lastName,
          email: user.email ?? prev.email,
        }));
        setOrganizationId(user.organization_id ?? null);

        if (user.organization_id) {
          const orgResponse = await apiClient.get<{ organization: Organization }>(
            `/organizations/${user.organization_id}`
          );
          if (!isMounted) return;
          const org = orgResponse.organization;
          if (org) {
            setOrganizationInfo((prev) => ({
              ...prev,
              organizationName: org.name ?? prev.organizationName,
              ein: org.ein ?? prev.ein,
              organizationType: org.tax_exempt_status ?? prev.organizationType,
              address: org.address ?? prev.address,
              city: org.city ?? prev.city,
              state: org.state ?? prev.state,
              zipCode: org.zip_code ?? prev.zipCode,
            }));
          }
        }
      } catch (error) {
        if (!isMounted) return;
        const message = authService.isApiError(error)
          ? error.message
          : "Failed to load profile data";
        toast.error(message);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadProfile();

    return () => {
      isMounted = false;
    };
  }, []);

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
              disabled={isSavingPersonal || isLoading}
              className="px-10 h-12 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {isSavingPersonal ? "Saving..." : "Save Changes"}
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
              disabled={isSavingOrganization || isLoading}
              className="px-10 h-12 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {isSavingOrganization ? "Updating..." : "Update Organization"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

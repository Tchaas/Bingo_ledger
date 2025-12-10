import { useState } from "react";
import { FileText, Save, Download } from "lucide-react";
import { toast } from "sonner@2.0.3";

export function TaxFormPage() {
  const [formData, setFormData] = useState({
    taxYear: "2024",
    organizationName: "Community Health Foundation",
    ein: "12-3456789",
    address: "123 Main Street",
    city: "Springfield",
    state: "IL",
    zipCode: "62701",
    phone: "(217) 555-0123",
    website: "www.communityhealthfoundation.org",
    taxExemptStatus: "501c3",
    orgType: "corporation",
    yearOfFormation: "2010",
    stateOfFormation: "Illinois",
    // Part I - Summary
    line1Description: "To improve community health through education, prevention programs, and access to healthcare services for underserved populations.",
    line2Members: "12",
    line3IndependentMembers: "10",
    line4Employees: "25",
    line5Volunteers: "150",
    // Part I - Revenue
    revenue8a: "5000",
    revenue8b: "10000",
    revenue8c: "25000",
    revenue9a: "125000",
    revenue9b: "140000",
    revenue10: "12000",
    revenue11: "15000",
    revenue12TotalRevenue: "$287,000",
    revenue12CurrentYear: "$308,500",
    // Additional revenue fields
    revenue8aPriorYear: "5000",
    revenue8aCurrentYear: "10000",
    revenue8bPriorYear: "10000",
    revenue8bCurrentYear: "13000",
    revenue8cPriorYear: "25000",
    revenue8cCurrentYear: "32000",
    revenue9aPriorYear: "125000",
    revenue9aCurrentYear: "140000",
    revenue8hPriorYear: "170000",
    revenue8hCurrentYear: "201500",
    revenue9PriorYear: "85000",
    revenue9CurrentYear: "92000",
    revenue10PriorYear: "12000",
    revenue10CurrentYear: "15000",
    revenue12PriorYear: "287000",
    revenue12CurrentYearValue: "308500",
    beginningDate: "2024-01-01",
    endingDate: "2024-12-31",
    dba: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSaveDraft = () => {
    toast.success("Draft saved successfully");
  };

  const handleGenerateForm = () => {
    toast.success("Form 990 generated successfully");
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900 mb-1">Form 990 Tax Return</h1>
          <p className="text-gray-600">Return of Organization Exempt From Income Tax</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={formData.taxYear}
            onChange={handleChange}
            name="taxYear"
            className="h-10 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="2024">Tax Year 2024</option>
            <option value="2023">Tax Year 2023</option>
            <option value="2022">Tax Year 2022</option>
          </select>
          <button
            onClick={handleSaveDraft}
            className="flex items-center gap-2 px-4 h-10 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Save className="size-4" />
            Save Draft
          </button>
          <button
            onClick={handleGenerateForm}
            className="flex items-center gap-2 px-6 h-10 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="size-4" />
            Generate Form
          </button>
        </div>
      </div>

      {/* Progress indicator */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
        <h3 className="text-gray-900 mb-4">Form Completion Progress</h3>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-full bg-blue-600 flex items-center justify-center text-white">✓</div>
            <span className="text-gray-700">Header</span>
          </div>
          <div className="flex-1 h-1 bg-blue-600" />
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-full bg-blue-600 flex items-center justify-center text-white">✓</div>
            <span className="text-gray-700">Part I</span>
          </div>
          <div className="flex-1 h-1 bg-gray-200" />
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">3</div>
            <span className="text-gray-500">Part VII</span>
          </div>
          <div className="flex-1 h-1 bg-gray-200" />
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">4</div>
            <span className="text-gray-500">Part IX</span>
          </div>
          <div className="flex-1 h-1 bg-gray-200" />
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">5</div>
            <span className="text-gray-500">Part X</span>
          </div>
          <div className="flex-1 h-1 bg-gray-200" />
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">6</div>
            <span className="text-gray-500">Signature</span>
          </div>
        </div>
      </div>

      {/* Header - Organization Information */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <FileText className="size-6 text-blue-600" />
          <h2 className="text-gray-900">Header - Organization Information</h2>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Tax Year */}
          <div className="col-span-2 grid grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 mb-2">Tax Year - Beginning Date</label>
              <input
                type="date"
                name="beginningDate"
                value={formData.beginningDate}
                onChange={handleChange}
                className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Ending Date</label>
              <input
                type="date"
                name="endingDate"
                value={formData.endingDate}
                onChange={handleChange}
                className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          {/* Organization Name */}
          <div className="col-span-2">
            <label className="block text-gray-700 mb-2">Organization Name</label>
            <input
              type="text"
              name="organizationName"
              value={formData.organizationName}
              onChange={handleChange}
              className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          {/* Doing Business As */}
          <div className="col-span-2">
            <label className="block text-gray-700 mb-2">Doing Business As (DBA)</label>
            <input
              type="text"
              name="dba"
              value={formData.dba}
              onChange={handleChange}
              placeholder="Alternate name, if applicable"
              className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          {/* EIN */}
          <div>
            <label className="block text-gray-700 mb-2">EIN (Employer Identification Number)</label>
            <input
              type="text"
              name="ein"
              value={formData.ein}
              onChange={handleChange}
              className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-gray-700 mb-2">Telephone Number</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          {/* Address */}
          <div className="col-span-2">
            <label className="block text-gray-700 mb-2">Address</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Room/Suite"
              className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          {/* City, State, ZIP */}
          <div>
            <label className="block text-gray-700 mb-2">City</label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 mb-2">State</label>
              <select
                name="state"
                value={formData.state}
                onChange={handleChange}
                className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="IL">IL</option>
                <option value="CA">CA</option>
                <option value="NY">NY</option>
                <option value="TX">TX</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-700 mb-2">ZIP Code</label>
              <input
                type="text"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleChange}
                className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          {/* Website */}
          <div className="col-span-2">
            <label className="block text-gray-700 mb-2">Website URL</label>
            <input
              type="url"
              name="website"
              value={formData.website}
              onChange={handleChange}
              className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          {/* Tax Exempt Status */}
          <div>
            <label className="block text-gray-700 mb-2">Tax Exempt Status</label>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="taxExemptStatus"
                  value="501c3"
                  checked={formData.taxExemptStatus === "501c3"}
                  onChange={handleChange}
                  className="size-4"
                />
                <span className="text-gray-700">501(c)(3)</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="taxExemptStatus"
                  value="other"
                  checked={formData.taxExemptStatus === "other"}
                  onChange={handleChange}
                  className="size-4"
                />
                <span className="text-gray-700">501(c) Other (Number)</span>
              </label>
            </div>
          </div>

          {/* Type of Organization */}
          <div>
            <label className="block text-gray-700 mb-2">Type of Organization</label>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="orgType"
                  value="corporation"
                  checked={formData.orgType === "corporation"}
                  onChange={handleChange}
                  className="size-4"
                />
                <span className="text-gray-700">Corporation</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="orgType"
                  value="trust"
                  checked={formData.orgType === "trust"}
                  onChange={handleChange}
                  className="size-4"
                />
                <span className="text-gray-700">Trust</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="orgType"
                  value="association"
                  checked={formData.orgType === "association"}
                  onChange={handleChange}
                  className="size-4"
                />
                <span className="text-gray-700">Association</span>
              </label>
            </div>
          </div>

          {/* Year and State of Formation */}
          <div>
            <label className="block text-gray-700 mb-2">Year of Formation</label>
            <input
              type="text"
              name="yearOfFormation"
              value={formData.yearOfFormation}
              onChange={handleChange}
              className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2">State of Formation</label>
            <select
              name="stateOfFormation"
              value={formData.stateOfFormation}
              onChange={handleChange}
              className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="Illinois">Illinois</option>
              <option value="California">California</option>
              <option value="New York">New York</option>
              <option value="Texas">Texas</option>
            </select>
          </div>
        </div>
      </div>

      {/* Part I - Summary */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <FileText className="size-6 text-blue-600" />
          <h2 className="text-gray-900">Part I - Summary</h2>
        </div>

        <div className="space-y-6">
          {/* Line 1 - Mission/Program Description */}
          <div>
            <label className="block text-gray-700 mb-2">
              Line 1 - Mission/Program Description
            </label>
            <textarea
              name="line1Description"
              value={formData.line1Description}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          {/* Governance metrics */}
          <div className="grid grid-cols-4 gap-6">
            <div>
              <label className="block text-gray-700 mb-2">Line 2: Voting Members</label>
              <input
                type="number"
                name="line2Members"
                value={formData.line2Members}
                onChange={handleChange}
                className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Line 3: Independent Members</label>
              <input
                type="number"
                name="line3IndependentMembers"
                value={formData.line3IndependentMembers}
                onChange={handleChange}
                className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Line 4: Employees</label>
              <input
                type="number"
                name="line4Employees"
                value={formData.line4Employees}
                onChange={handleChange}
                className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Line 5: Volunteers</label>
              <input
                type="number"
                name="line5Volunteers"
                value={formData.line5Volunteers}
                onChange={handleChange}
                className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Part I - Revenue (Lines 8-12) */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
        <h3 className="text-gray-900 mb-6">Part I - Revenue (Lines 8-12)</h3>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-gray-700">Revenue Source</th>
                <th className="px-4 py-3 text-right text-gray-700">Prior Year (A)</th>
                <th className="px-4 py-3 text-right text-gray-700">Current Year (B)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="px-4 py-3 text-gray-900">8a. Federated campaigns</td>
                <td className="px-4 py-3 text-right">
                  <input
                    type="number"
                    name="revenue8a"
                    value={formData.revenue8a}
                    onChange={handleChange}
                    className="w-32 h-10 px-3 text-right border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </td>
                <td className="px-4 py-3 text-right">
                  <input
                    type="number"
                    name="revenue8b"
                    value={formData.revenue8b}
                    onChange={handleChange}
                    className="w-32 h-10 px-3 text-right border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-gray-900">8b. Membership dues</td>
                <td className="px-4 py-3 text-right">
                  <input
                    type="number"
                    name="revenue8bPriorYear"
                    value={formData.revenue8bPriorYear}
                    onChange={handleChange}
                    className="w-32 h-10 px-3 text-right border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </td>
                <td className="px-4 py-3 text-right">
                  <input
                    type="number"
                    name="revenue8bCurrentYear"
                    value={formData.revenue8bCurrentYear}
                    onChange={handleChange}
                    className="w-32 h-10 px-3 text-right border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-gray-900">8c. Fundraising events</td>
                <td className="px-4 py-3 text-right">
                  <input
                    type="number"
                    name="revenue8cPriorYear"
                    value={formData.revenue8cPriorYear}
                    onChange={handleChange}
                    className="w-32 h-10 px-3 text-right border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </td>
                <td className="px-4 py-3 text-right">
                  <input
                    type="number"
                    name="revenue8cCurrentYear"
                    value={formData.revenue8cCurrentYear}
                    onChange={handleChange}
                    className="w-32 h-10 px-3 text-right border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-gray-900">9a. At other contributions</td>
                <td className="px-4 py-3 text-right">
                  <input
                    type="number"
                    name="revenue9aPriorYear"
                    value={formData.revenue9aPriorYear}
                    onChange={handleChange}
                    className="w-32 h-10 px-3 text-right border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </td>
                <td className="px-4 py-3 text-right">
                  <input
                    type="number"
                    name="revenue9aCurrentYear"
                    value={formData.revenue9aCurrentYear}
                    onChange={handleChange}
                    className="w-32 h-10 px-3 text-right border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-gray-900">8h. TOTAL Contributions</td>
                <td className="px-4 py-3 text-right">
                  <input
                    type="number"
                    name="revenue8hPriorYear"
                    value={formData.revenue8hPriorYear}
                    onChange={handleChange}
                    className="w-32 h-10 px-3 text-right border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </td>
                <td className="px-4 py-3 text-right">
                  <input
                    type="number"
                    name="revenue8hCurrentYear"
                    value={formData.revenue8hCurrentYear}
                    onChange={handleChange}
                    className="w-32 h-10 px-3 text-right border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-gray-900">9. Program Service Revenue</td>
                <td className="px-4 py-3 text-right">
                  <input
                    type="number"
                    name="revenue9PriorYear"
                    value={formData.revenue9PriorYear}
                    onChange={handleChange}
                    className="w-32 h-10 px-3 text-right border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </td>
                <td className="px-4 py-3 text-right">
                  <input
                    type="number"
                    name="revenue9CurrentYear"
                    value={formData.revenue9CurrentYear}
                    onChange={handleChange}
                    className="w-32 h-10 px-3 text-right border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-gray-900">10. Investment income</td>
                <td className="px-4 py-3 text-right">
                  <input
                    type="number"
                    name="revenue10PriorYear"
                    value={formData.revenue10PriorYear}
                    onChange={handleChange}
                    className="w-32 h-10 px-3 text-right border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </td>
                <td className="px-4 py-3 text-right">
                  <input
                    type="number"
                    name="revenue10CurrentYear"
                    value={formData.revenue10CurrentYear}
                    onChange={handleChange}
                    className="w-32 h-10 px-3 text-right border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </td>
              </tr>
              <tr className="bg-gray-50">
                <td className="px-4 py-3 text-gray-900">12. TOTAL REVENUE</td>
                <td className="px-4 py-3 text-right text-blue-600">$287,000</td>
                <td className="px-4 py-3 text-right text-blue-600">$308,500</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Navigation buttons */}
      <div className="flex items-center justify-between pt-6 border-t border-gray-200">
        <button className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
          ← Previous Section
        </button>
        <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          Continue to Part IX →
        </button>
      </div>
    </div>
  );
}
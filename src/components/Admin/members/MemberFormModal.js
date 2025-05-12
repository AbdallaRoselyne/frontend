import React, { useState, useEffect, useCallback, useMemo } from "react";
import { FiX } from "react-icons/fi";

const MemberFormModal = ({
  show,
  onClose,
  onSave,
  member = null,
  mode = "add",
  error,
  setError,
}) => {
  const initialFormData = useMemo(
    () => ({
      name: "",
      email: "",
      jobTitle: "",
      discipline: "",
      department: "",
      billableRate: "",
    }),
    []
  );

  const [formData, setFormData] = useState(initialFormData);

  const resetForm = useCallback(() => {
    setFormData(member || initialFormData);
    setError(null);
  }, [member, initialFormData, setError]);

  useEffect(() => {
    if (show) {
      resetForm();
    }
  }, [show, resetForm]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!emailPattern.test(formData.email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (
      !formData.name ||
      !formData.email ||
      !formData.jobTitle ||
      !formData.department
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    if (
      !formData.name ||
      !formData.email ||
      !formData.jobTitle ||
      !formData.department
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    const payload = {
      ...formData,
      billableRate: Number(formData.billableRate),
      department: formData.department.toUpperCase(),
    };

    try {
      const url =
        mode === "add"
          ? `${
              process.env.REACT_APP_API_URL || "http://localhost:8080"
            }/api/members`
          : `${
              process.env.REACT_APP_API_URL || "http://localhost:8080"
            }/api/members/${formData._id}`;

      const method = mode === "add" ? "POST" : "PUT";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to ${mode} member`);
      }

      const savedMember = await response.json();
      onSave(savedMember);
      setError(null);
    } catch (error) {
      console.error(`Error ${mode}ing member:`, error);
      setError(error.message);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center border-b p-4">
          <h2 className="text-xl font-semibold text-gray-800">
            {mode === "add" ? "Add New Member" : "Edit Member"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <FiX size={24} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a8499c] focus:border-[#a8499c]"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a8499c] focus:border-[#a8499c] ${
                mode === "edit" ? "bg-gray-100" : ""
              }`}
              placeholder="user@prodesign.mu"
              required
              disabled={mode === "edit"}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Job Title *
              </label>
              <input
                type="text"
                name="jobTitle"
                value={formData.jobTitle}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a8499c] focus:border-[#a8499c]"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department *
              </label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a8499c] focus:border-[#a8499c]"
                required
              >
                <option value="">Select</option>
                <option value="BIM">BIM</option>
                <option value="LEED">LEED</option>
                <option value="MEP">MEP</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Discipline
              </label>
              <input
                type="text"
                name="discipline"
                value={formData.discipline}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a8499c] focus:border-[#a8499c]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Billable Rate
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500">$</span>
                <input
                  type="number"
                  name="billableRate"
                  value={formData.billableRate}
                  onChange={handleChange}
                  className="w-full pl-8 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a8499c] focus:border-[#a8499c]"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 p-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-[#a8499c] text-white rounded-lg hover:bg-[#8f3a8a]"
          >
            {mode === "add" ? "Add Member" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MemberFormModal;

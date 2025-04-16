import React, { useState, useEffect } from "react";
import { FiUserPlus, FiUserX, FiX, FiEdit, FiSearch, FiFilter } from "react-icons/fi";

const AdminMembers = () => {
  const [showModal, setShowModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [newMember, setNewMember] = useState({
    name: "",
    email: "",
    jobTitle: "",
    discipline: "",
    department: "",
    billableRate: "",
  });

  const [members, setMembers] = useState([]);

  // Fetch members from the backend
  useEffect(() => {
    const fetchMembers = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch("http://localhost:5000/api/members");
        if (!response.ok) throw new Error("Failed to fetch members");
        const data = await response.json();
        setMembers(data);
      } catch (error) {
        console.error("Error fetching members:", error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMembers();
  }, []);

  const handleChange = (e) => {
    setNewMember({ ...newMember, [e.target.name]: e.target.value });
  };

  const handleAddMember = async () => {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@prodesign\.mu$/;
    if (!emailPattern.test(newMember.email)) {
      setError("Email must be a @prodesign.mu address.");
      return;
    }

    if (!newMember.name || !newMember.email || !newMember.jobTitle || !newMember.department) {
      setError("Please fill in all required fields.");
      return;
    }

    const payload = {
      ...newMember,
      billableRate: Number(newMember.billableRate),
    };

    try {
      const response = await fetch("http://localhost:5000/api/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add member");
      }

      const savedMember = await response.json();
      setMembers([...members, savedMember]);
      setNewMember({
        name: "",
        email: "",
        jobTitle: "",
        discipline: "",
        department: "",
        billableRate: "",
      });
      setShowModal(false);
      setError(null);
    } catch (error) {
      console.error("Error adding member:", error);
      setError(error.message);
    }
  };

  const handleEditMember = async () => {
    if (!selectedMember) return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/members/${selectedMember._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(selectedMember),
        }
      );

      if (!response.ok) throw new Error("Failed to update member");

      const updatedMember = await response.json();
      setMembers(
        members.map((member) =>
          member._id === updatedMember._id ? updatedMember : member
        )
      );
      setEditModal(false);
      setError(null);
    } catch (error) {
      console.error("Error updating member:", error);
      setError(error.message);
    }
  };

  const handleRemoveMember = async (id) => {
    if (!window.confirm("Are you sure you want to remove this member?")) return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/members/${id}`,
        { method: "DELETE" }
      );

      if (!response.ok) throw new Error("Failed to delete member");

      setMembers(members.filter((member) => member._id !== id));
    } catch (error) {
      console.error("Error removing member:", error);
      setError(error.message);
    }
  };

  // Filter members based on search and department filter
  const filteredMembers = members.filter((member) => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         member.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = departmentFilter === "all" || 
                            member.department.toLowerCase() === departmentFilter.toLowerCase();
    return matchesSearch && matchesDepartment;
  });

  const getDepartmentColor = (department) => {
    switch (department?.toUpperCase()) {
      case "BIM": return "bg-green-100 text-green-800";
      case "LEED": return "bg-purple-100 text-purple-800";
      case "MEP": return "bg-blue-100 text-blue-800";
      case "ADMIN": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Team Management</h1>
          <p className="text-gray-600">Manage all team members and their details</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <FiUserPlus className="text-lg" />
          <span>Add Member</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <FiSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <FiFilter className="text-gray-500" />
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All Departments</option>
              <option value="BIM">BIM</option>
              <option value="LEED">LEED</option>
              <option value="MEP">MEP</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FiX className="h-5 w-5 text-red-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : (
        /* Members Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMembers.length > 0 ? (
            filteredMembers.map((member) => (
              <div key={member._id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">{member.name}</h3>
                      <p className="text-gray-600">{member.jobTitle}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDepartmentColor(member.department)}`}>
                      {member.department}
                    </span>
                  </div>
                  
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center text-gray-600">
                      <span className="font-medium w-24">Email:</span>
                      <span className="truncate">{member.email}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <span className="font-medium w-24">Discipline:</span>
                      <span>{member.discipline || "-"}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <span className="font-medium w-24">Rate:</span>
                      <span>${member.billableRate || "0"}/hr</span>
                    </div>
                  </div>
                  
                  <div className="mt-6 flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedMember(member);
                        setEditModal(true);
                      }}
                      className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800"
                    >
                      <FiEdit className="text-sm" /> Edit
                    </button>
                    <button
                      onClick={() => handleRemoveMember(member._id)}
                      className="flex items-center gap-1 text-sm text-red-600 hover:text-red-800"
                    >
                      <FiUserX className="text-sm" /> Remove
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-12 text-center">
              <div className="text-gray-400 mb-2">
                <FiUserX className="inline-block text-4xl" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">No members found</h3>
              <p className="text-gray-500 mt-1">
                {members.length === 0 ? "Add your first team member" : "Try adjusting your search or filter"}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Add Member Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center border-b p-4">
              <h2 className="text-xl font-semibold text-gray-800">Add New Member</h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setError(null);
                }}
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={newMember.name}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={newMember.email}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="user@prodesign.mu"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Job Title *</label>
                  <input
                    type="text"
                    name="jobTitle"
                    value={newMember.jobTitle}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
                  <select
                    name="department"
                    value={newMember.department}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  >
                    <option value="">Select</option>
                    <option>BIM</option>
                    <option>LEED</option>
                    <option>MEP</option>
                    <option>ADMIN</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Discipline</label>
                  <input
                    type="text"
                    name="discipline"
                    value={newMember.discipline}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Billable Rate</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-500">$</span>
                    <input
                      type="number"
                      name="billableRate"
                      value={newMember.billableRate}
                      onChange={handleChange}
                      className="w-full pl-8 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 p-4 border-t">
              <button
                onClick={() => {
                  setShowModal(false);
                  setError(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddMember}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Add Member
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Member Modal */}
      {editModal && selectedMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center border-b p-4">
              <h2 className="text-xl font-semibold text-gray-800">Edit Member</h2>
              <button
                onClick={() => {
                  setEditModal(false);
                  setError(null);
                }}
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={selectedMember.name}
                  onChange={(e) => setSelectedMember({...selectedMember, name: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={selectedMember.email}
                  onChange={(e) => setSelectedMember({...selectedMember, email: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  disabled
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                  <input
                    type="text"
                    name="jobTitle"
                    value={selectedMember.jobTitle}
                    onChange={(e) => setSelectedMember({...selectedMember, jobTitle: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                  <select
                    name="department"
                    value={selectedMember.department}
                    onChange={(e) => setSelectedMember({...selectedMember, department: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option>BIM</option>
                    <option>LEED</option>
                    <option>MEP</option>
                    <option>ADMIN</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Discipline</label>
                  <input
                    type="text"
                    name="discipline"
                    value={selectedMember.discipline}
                    onChange={(e) => setSelectedMember({...selectedMember, discipline: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Billable Rate</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-500">$</span>
                    <input
                      type="number"
                      name="billableRate"
                      value={selectedMember.billableRate}
                      onChange={(e) => setSelectedMember({...selectedMember, billableRate: e.target.value})}
                      className="w-full pl-8 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 p-4 border-t">
              <button
                onClick={() => {
                  setEditModal(false);
                  setError(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleEditMember}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMembers;
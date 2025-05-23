import React, { useState, useEffect } from "react";
import { FiUserPlus, FiUserX, FiX, FiEdit, FiSearch, FiFilter } from "react-icons/fi";
import MemberFormModal from "./MemberFormModal";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

const AdminMembers = () => {
  const [showModal, setShowModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [members, setMembers] = useState([]);

  useEffect(() => {
    const fetchMembers = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_BASE_URL}/api/members`);
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

  const handleRemoveMember = async (id) => {
    if (!window.confirm("Are you sure you want to remove this member?")) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/members/${id}`, {
        method: "DELETE"
      });

      if (!response.ok) throw new Error("Failed to delete member");
      setMembers(members.filter((member) => member._id !== id));
    } catch (error) {
      console.error("Error removing member:", error);
      setError(error.message);
    }
  };

  const filteredMembers = members
    .filter((member) => {
      const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDepartment = departmentFilter === "all" ||
        member.department.toLowerCase() === departmentFilter.toLowerCase();
      return matchesSearch && matchesDepartment;
    })
    .sort((a, b) => {
      const firstNameA = a.name.split(' ')[0].toLowerCase();
      const firstNameB = b.name.split(' ')[0].toLowerCase();

      if (firstNameA < firstNameB) return -1;
      if (firstNameA > firstNameB) return 1;
      return 0;
    });

  const getDepartmentColor = (department) => {
    switch (department?.toUpperCase()) {
      case "BIM": return "bg-green-100 text-green-800";
      case "LEED": return "bg-[#a8499c20] text-[#a8499c]";
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
          className="flex items-center gap-2 bg-[#a8499c] hover:bg-[#8f3a8a] text-white px-4 py-2 rounded-lg transition-colors"
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
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a8499c] focus:border-[#a8499c]"
            />
          </div>
          <div className="flex items-center gap-2">
            <FiFilter className="text-gray-500" />
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#a8499c] focus:border-[#a8499c]"
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
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#a8499c]"></div>
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
                      className="flex items-center gap-1 text-sm text-[#a8499c] hover:text-[#8f3a8a]"
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

      {/* Modals */}
      <MemberFormModal
        show={showModal}
        onClose={() => {
          setShowModal(false);
          setError(null);
        }}
        onSave={(newMember) => {
          setMembers([...members, newMember]);
          setShowModal(false);
        }}
        mode="add"
        error={error}
        setError={setError}
      />

      {selectedMember && (
        <MemberFormModal
          show={editModal}
          onClose={() => {
            setEditModal(false);
            setSelectedMember(null);
            setError(null);
          }}
          onSave={(updatedMember) => {
            setMembers(members.map(m => m._id === updatedMember._id ? updatedMember : m));
            setEditModal(false);
            setSelectedMember(null);
          }}
          member={selectedMember}
          mode="edit"
          error={error}
          setError={setError}
        />
      )}
    </div>
  );
};

export default AdminMembers;
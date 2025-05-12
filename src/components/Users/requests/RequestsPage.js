import React, { useState, useEffect } from "react";
import axios from "axios";
import { FiUserPlus, FiUser } from "react-icons/fi";
import RequestsTable from "./RequestsTable";
import RequestModal from "./RequestModal";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

const RequestsPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [requestedMembers, setRequestedMembers] = useState([]);
  const [filterText, setFilterText] = useState("");
  const [projects, setProjects] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [members, setMembers] = useState([]);
  const currentUserEmail = localStorage.getItem("currentUserEmail");
  const [requestData, setRequestData] = useState({
    requestedName: "",
    email: "",
    projectCode: "",
    project: "",
    department: "",
    hours: "",
    requester: "",
    Task: "",
    Notes: "",
    isCustomProject: false,
  });

  useEffect(() => {
    fetchRequests();
    fetchMembers();
  }, []);

  useEffect(() => {
    if (showModal) {
      fetchProjects();
    }
  }, [showModal]);

  const fetchRequests = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/requests`);
      setRequestedMembers(response.data);
    } catch (error) {
      console.error("Error fetching requests:", error);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/projects`);
      setProjects(response.data);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  const fetchMembers = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/members`);
      setMembers(response.data);
    } catch (error) {
      console.error("Error fetching members:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRequestData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editMode) {
        const response = await axios.put(
          `${API_BASE_URL}/api/requests/${editId}`,
          requestData
        );
        setRequestedMembers(
          requestedMembers.map((req) =>
            req._id === editId ? response.data : req
          )
        );
      } else {
        const memberNames = requestData.requestedName.split(/\s*,\s*/);
        const memberEmails = requestData.email.split(/\s*,\s*/);

        const createRequests = memberNames.map((name, index) => {
          const memberData = {
            ...requestData,
            requestedName: name,
            email: memberEmails[index] || "",
            project: requestData.isCustomProject
              ? requestData.project
              : requestData.project,
            projectCode: requestData.isCustomProject
              ? ""
              : requestData.projectCode,
            department: requestData.isCustomProject
              ? requestData.department
              : requestData.department,
            isCustomProject: requestData.isCustomProject || false,
          };

          return axios.post(`${API_BASE_URL}/api/requests`, memberData);
        });

        const responses = await Promise.all(createRequests);
        const newRequests = responses.map((res) => res.data);

        setRequestedMembers([...requestedMembers, ...newRequests]);
      }
      resetForm();
    } catch (error) {
      console.error("Error submitting request:", error);
      alert("Error submitting request. Please check all required fields.");
    }
  };

  const handleEdit = (request) => {
    setRequestData({
      ...request,
      isCustomProject: request.isCustomProject || false,
    });
    setEditId(request._id);
    setEditMode(true);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this request?")) {
      try {
        await axios.delete(`${API_BASE_URL}/api/requests/${id}`);
        setRequestedMembers(requestedMembers.filter((req) => req._id !== id));
      } catch (error) {
        console.error("Error deleting request:", error);
      }
    }
  };

  const resetForm = () => {
    setRequestData({
      requestedName: "",
      email: "",
      projectCode: "",
      project: "",
      department: "",
      hours: "",
      requester: "",
      Task: "",
      Notes: "",
      isCustomProject: false,
    });
    setEditMode(false);
    setEditId(null);
    setShowModal(false);
  };

  const filteredMembers = requestedMembers.filter(
    (member) =>
      (member.requestedName || "")
        .toLowerCase()
        .includes(filterText.toLowerCase()) ||
      (member.projectCode || "")
        .toLowerCase()
        .includes(filterText.toLowerCase()) ||
      (member.department || "").toLowerCase().includes(filterText.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#818181]/5 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="sm:flex sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold leading-tight text-gray-900">
              Resource Requests
            </h1>
            {currentUserEmail && (
            <span className="flex items-center gap-1 ml-2 px-3 py-1 bg-[#a8499c]/10 rounded-full text-sm text-[#a8499c]">
              <FiUser className="text-[#a8499c]" />
              {currentUserEmail}
            </span>
          )}
            <p className="mt-2 text-sm text-[#818181]">
              Manage all your team resource requests in one place
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#a8499c] hover:bg-[#8d3a82] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#a8499c]/50 transition-colors"
          >
            <FiUserPlus className="-ml-1 mr-2 h-5 w-5" />
            New Request
          </button>
        </div>

        <RequestsTable
          filteredMembers={filteredMembers}
          filterText={filterText}
          setFilterText={setFilterText}
          handleEdit={handleEdit}
          handleDelete={handleDelete}
          setSelectedTask={setSelectedTask}
        />

        <RequestModal
          showModal={showModal}
          resetForm={resetForm}
          editMode={editMode}
          requestData={requestData}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          members={members}
          projects={projects}
          selectedTask={selectedTask}
          setSelectedTask={setSelectedTask}
        />
      </div>
    </div>
  );
};

export default RequestsPage;

import React, { useState, useEffect } from "react";
import axios from "axios";
import { FiUserPlus } from "react-icons/fi";
import RequestsTable from "./RequestsTable";
import RequestModal from "./RequestModal";

const RequestsPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [requestedMembers, setRequestedMembers] = useState([]);
  const [filterText, setFilterText] = useState("");
  const [projects, setProjects] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [members, setMembers] = useState([]);
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
      const response = await axios.get("http://localhost:8080/api/requests");
      setRequestedMembers(response.data);
    } catch (error) {
      console.error("Error fetching requests:", error);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/projects");
      setProjects(response.data);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  const fetchMembers = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/members");
      setMembers(response.data);
    } catch (error) {
      console.error("Error fetching members:", error);
    }
  };

  const handleChange = (e) => {
    setRequestData({ ...requestData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) {
        const response = await axios.put(
          `http://localhost:8080/api/requests/${editId}`,
          requestData
        );
        setRequestedMembers(
          requestedMembers.map((req) =>
            req._id === editId ? response.data : req
          )
        );
      } else {
        const response = await axios.post(
          "http://localhost:8080/api/requests",
          requestData
        );
        setRequestedMembers([...requestedMembers, response.data]);
      }
      resetForm();
    } catch (error) {
      console.error("Error submitting request:", error);
    }
  };

  const handleEdit = (request) => {
    setRequestData(request);
    setEditId(request._id);
    setEditMode(true);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this request?")) {
      try {
        await axios.delete(`http://localhost:8080/api/requests/${id}`);
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
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="sm:flex sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold leading-tight text-gray-900">Resource Requests</h1>
            <p className="mt-2 text-sm text-gray-700">
              Manage all your team resource requests in one place
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
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
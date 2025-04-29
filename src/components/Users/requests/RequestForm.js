import React, { useState, useEffect } from "react";

const RequestForm = ({
  requestData,
  handleChange,
  members,
  projects,
  editMode,
  onSubmit
}) => {
  const [selectedMember, setSelectedMember] = useState(requestData.requestedName);
  const [selectedProject, setSelectedProject] = useState(requestData.project);

  // Update email when selectedMember changes
  useEffect(() => {
    if (selectedMember) {
      const member = members.find((m) => m.name === selectedMember);
      if (member && requestData.email !== member.email) {
        handleChange({
          target: { name: "email", value: member.email },
        });
      }
    }
  }, [selectedMember, members, requestData.email, handleChange]);

  // Update project-related fields when selectedProject changes
  useEffect(() => {
    if (selectedProject) {
      const project = projects.find((p) => p.name === selectedProject);
      if (project) {
        if (requestData.projectCode !== project.code) {
          handleChange({
            target: { name: "projectCode", value: project.code },
          });
        }
        if (requestData.department !== project.department) {
          handleChange({
            target: { name: "department", value: project.department },
          });
        }
      }
    }
  }, [selectedProject, projects, requestData.projectCode, requestData.department, handleChange]);

  const handleMemberChange = (e) => {
    const memberName = e.target.value;
    setSelectedMember(memberName);
    handleChange(e);
  };

  const handleProjectChange = (e) => {
    const projectName = e.target.value;
    setSelectedProject(projectName);
    handleChange(e);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    onSubmit(e);
  };

  return (
    <form className="space-y-4" onSubmit={handleFormSubmit}>
      {/* Member Name Dropdown */}
      <div>
        <label className="block text-sm font-medium text-[#818181] mb-1">
          Member Name
        </label>
        <select
          name="requestedName"
          value={selectedMember || ""}
          onChange={handleMemberChange}
          className="w-full p-3 border border-[#818181]/30 rounded-lg focus:ring-2 focus:ring-[#a8499c]/50 focus:border-transparent transition-colors"
          required
        >
          <option value="">Select Member</option>
          {members.map((member) => (
            <option key={member._id} value={member.name}>
              {member.name}
            </option>
          ))}
        </select>
      </div>

      {/* Email Field */}
      <div>
        <label className="block text-sm font-medium text-[#818181] mb-1">
          Email
        </label>
        <input
          type="email"
          name="email"
          value={requestData.email || ""}
          onChange={handleChange}
          className="w-full p-3 border border-[#818181]/30 rounded-lg bg-[#818181]/5 focus:ring-2 focus:ring-[#a8499c]/50 focus:border-transparent"
          required
          readOnly
        />
      </div>

      {/* Project Dropdown */}
      <div>
        <label className="block text-sm font-medium text-[#818181] mb-1">
          Project
        </label>
        <select
          name="project"
          value={selectedProject || ""}
          onChange={handleProjectChange}
          className="w-full p-3 border border-[#818181]/30 rounded-lg focus:ring-2 focus:ring-[#a8499c]/50 focus:border-transparent transition-colors"
          required
        >
          <option value="">Select Project</option>
          {projects.map((project) => (
            <option key={project.name} value={project.name}>
              {project.name}
            </option>
          ))}
        </select>
      </div>

      {/* Project Code */}
      <div>
        <label className="block text-sm font-medium text-[#818181] mb-1">
          Project Code
        </label>
        <input
          type="text"
          name="projectCode"
          value={requestData.projectCode || ""}
          onChange={handleChange}
          className="w-full p-3 border border-[#818181]/30 rounded-lg bg-[#818181]/5 focus:ring-2 focus:ring-[#a8499c]/50 focus:border-transparent"
          required
          readOnly
        />
      </div>

      {/* Department */}
      <div>
        <label className="block text-sm font-medium text-[#818181] mb-1">
          Department
        </label>
        <input
          type="text"
          name="department"
          value={requestData.department || ""}
          onChange={handleChange}
          className="w-full p-3 border border-[#818181]/30 rounded-lg bg-[#818181]/5 focus:ring-2 focus:ring-[#a8499c]/50 focus:border-transparent"
          required
          readOnly
        />
      </div>

      {/* Hours */}
      <div>
        <label className="block text-sm font-medium text-[#818181] mb-1">
          Hours
        </label>
        <input
          type="number"
          name="hours"
          value={requestData.hours || ""}
          onChange={handleChange}
          className="w-full p-3 border border-[#818181]/30 rounded-lg focus:ring-2 focus:ring-[#a8499c]/50 focus:border-transparent"
          required
        />
      </div>

      {/* Requester */}
      <div>
        <label className="block text-sm font-medium text-[#818181] mb-1">
          Requester
        </label>
        <input
          type="text"
          name="requester"
          value={requestData.requester || ""}
          onChange={handleChange}
          className="w-full p-3 border border-[#818181]/30 rounded-lg focus:ring-2 focus:ring-[#a8499c]/50 focus:border-transparent"
          required
        />
      </div>

      {/* Task */}
      <div>
        <label className="block text-sm font-medium text-[#818181] mb-1">
          Task
        </label>
        <input
          type="text"
          name="Task"
          value={requestData.Task || ""}
          onChange={handleChange}
          className="w-full p-3 border border-[#818181]/30 rounded-lg focus:ring-2 focus:ring-[#a8499c]/50 focus:border-transparent"
          required
        />
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-[#818181] mb-1">
          Notes
        </label>
        <textarea
          name="Notes"
          value={requestData.Notes || ""}
          onChange={handleChange}
          rows={3}
          className="w-full p-3 border border-[#818181]/30 rounded-lg focus:ring-2 focus:ring-[#a8499c]/50 focus:border-transparent"
        />
      </div>

      <button
        type="submit"
        className="w-full bg-[#a8499c] text-white px-4 py-3 rounded-lg hover:bg-[#8d3a82] focus:outline-none focus:ring-2 focus:ring-[#a8499c]/50 focus:ring-offset-2 transition-colors font-medium"
      >
        {editMode ? "Update Request" : "Submit Request"}
      </button>
    </form>
  );
};

export default RequestForm;
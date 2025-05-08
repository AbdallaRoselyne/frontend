import React, { useState, useEffect } from "react";

const RequestForm = ({
  requestData,
  handleChange,
  members,
  projects,
  editMode,
  onSubmit,
}) => {
  const [selectedMembers, setSelectedMembers] = useState(
    requestData.requestedName ? requestData.requestedName.split(/\s*,\s*/) : []
  );
  const [selectedProject, setSelectedProject] = useState(requestData.project);
  const [isCustomProject, setIsCustomProject] = useState(
    requestData.isCustomProject || false
  );

  // Update emails when selectedMembers changes
  useEffect(() => {
    if (selectedMembers.length > 0) {
      const emails = selectedMembers
        .map((memberName) => {
          const member = members.find((m) => m.name === memberName);
          return member ? member.email : "";
        })
        .join(", ");

      if (requestData.email !== emails) {
        handleChange({
          target: { name: "email", value: emails },
        });
      }
    }
  }, [selectedMembers, members, requestData.email, handleChange]);

  // Update project-related fields when selectedProject changes
  useEffect(() => {
    if (selectedProject === "Other") {
      setIsCustomProject(true);
      handleChange({
        target: { name: "isCustomProject", value: true },
      });
      // Clear project-related fields
      handleChange({
        target: { name: "projectCode", value: "" },
      });
      handleChange({
        target: { name: "department", value: "" },
      });
    } else if (selectedProject && selectedProject !== "Other") {
      setIsCustomProject(false);
      handleChange({
        target: { name: "isCustomProject", value: false },
      });
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
  }, [
    selectedProject,
    handleChange,
    projects,
    requestData.department,
    requestData.projectCode,
  ]);

  const handleMemberChange = (e) => {
    const options = e.target.options;
    const selected = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selected.push(options[i].value);
      }
    }
    setSelectedMembers(selected);
    handleChange({
      target: { name: "requestedName", value: selected.join(", ") },
    });
  };

  const handleProjectChange = (e) => {
    const projectName = e.target.value;
    setSelectedProject(projectName);
    handleChange({
      target: { name: "project", value: projectName },
    });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    onSubmit(e);
  };

  return (
    <form className="space-y-4" onSubmit={handleFormSubmit}>
      {/* Member Name Dropdown - Now multiple select */}
      <div>
        <label className="block text-sm font-medium text-[#818181] mb-1">
          Member Name(s)
        </label>
        <select
          name="requestedName"
          multiple
          value={selectedMembers}
          onChange={handleMemberChange}
          className="w-full p-3 border border-[#818181]/30 rounded-lg focus:ring-2 focus:ring-[#a8499c]/50 focus:border-transparent transition-colors h-auto min-h-[50px]"
          required
          size={Math.min(members.length, 5)} // Show up to 5 options at once
        >
          {members.map((member) => (
            <option key={member._id} value={member.name}>
              {member.name}
            </option>
          ))}
        </select>
        <p className="text-xs text-[#818181] mt-1">
          Hold Ctrl/Cmd to select multiple members
        </p>
      </div>

      {/* Email Field */}
      <div>
        <label className="block text-sm font-medium text-[#818181] mb-1">
          Email(s)
        </label>
        <input
          type="text"
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
          <option value="Other">Other (Custom Project)</option>
        </select>
      </div>

      {isCustomProject ? (
        <>
          {/* Custom Project Name */}
          <div>
            <label className="block text-sm font-medium text-[#818181] mb-1">
              Project Name
            </label>
            <input
              type="text"
              name="project"
              value={requestData.project || ""}
              onChange={handleChange}
              className="w-full p-3 border border-[#818181]/30 rounded-lg focus:ring-2 focus:ring-[#a8499c]/50 focus:border-transparent"
              required
            />
          </div>

          {/* Department for Custom Project */}
          <div>
            <label className="block text-sm font-medium text-[#818181] mb-1">
              Department
            </label>
            <select
              name="department"
              value={requestData.department || ""}
              onChange={handleChange}
              className="w-full p-3 border border-[#818181]/30 rounded-lg focus:ring-2 focus:ring-[#a8499c]/50 focus:border-transparent transition-colors"
              required
            >
              <option value="">Select Department</option>
              <option value="LEED">LEED</option>
              <option value="BIM">BIM</option>
              <option value="MEP">MEP</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </>
      ) : (
        <>
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
        </>
      )}

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

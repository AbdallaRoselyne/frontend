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
  const [projectSelectionType, setProjectSelectionType] = useState(
    requestData.isCustomProject ? "other" : "standard"
  );
  const [selectedStandardProject, setSelectedStandardProject] = useState(
    requestData.isCustomProject ? "" : requestData.project || ""
  );
  const [customProjectName, setCustomProjectName] = useState(
    requestData.isCustomProject ? requestData.project : ""
  );

  // Sort projects alphabetically
  const sortedProjects = [...projects].sort((a, b) => 
    a.name.localeCompare(b.name)
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

  // Handle project type change (standard vs other)
  const handleProjectTypeChange = (e) => {
    const type = e.target.value;
    setProjectSelectionType(type);

    if (type === "other") {
      handleChange({
        target: { name: "isCustomProject", value: true },
      });
      // Clear project-related fields
      handleChange({ target: { name: "projectCode", value: "" } });
      handleChange({ target: { name: "department", value: "" } });
      handleChange({ target: { name: "project", value: customProjectName } });
    } else {
      handleChange({
        target: { name: "isCustomProject", value: false },
      });
      if (selectedStandardProject) {
        const project = projects.find((p) => p.name === selectedStandardProject);
        if (project) {
          handleChange({
            target: { name: "projectCode", value: project.code },
          });
          handleChange({
            target: { name: "department", value: project.department },
          });
          handleChange({
            target: { name: "project", value: selectedStandardProject },
          });
        }
      }
    }
  };

  // Handle standard project selection
  const handleStandardProjectChange = (e) => {
    const projectName = e.target.value;
    setSelectedStandardProject(projectName);

    const project = projects.find((p) => p.name === projectName);
    if (project) {
      handleChange({
        target: { name: "projectCode", value: project.code },
      });
      handleChange({
        target: { name: "department", value: project.department },
      });
      handleChange({
        target: { name: "project", value: projectName },
      });
    }
  };

  const handleCustomProjectNameChange = (e) => {
    const value = e.target.value;
    setCustomProjectName(value);
    handleChange({
      target: { name: "project", value },
    });
  };

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

  const handleFormSubmit = (e) => {
    e.preventDefault();
    onSubmit(e);
  };

  return (
    <form className="space-y-4" onSubmit={handleFormSubmit}>
      {/* Member Name Dropdown */}
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
          size={Math.min(members.length, 5)}
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

      {/* Project Type Selection */}
      <div>
        <label className="block text-sm font-medium text-[#818181] mb-1">
          Project Type
        </label>
        <div className="flex space-x-4">
          <label className="inline-flex items-center">
            <input
              type="radio"
              name="projectType"
              value="standard"
              checked={projectSelectionType === "standard"}
              onChange={handleProjectTypeChange}
              className="text-[#a8499c] focus:ring-[#a8499c]/50"
            />
            <span className="ml-2">Standard Project</span>
          </label>
          <label className="inline-flex items-center">
            <input
              type="radio"
              name="projectType"
              value="other"
              checked={projectSelectionType === "other"}
              onChange={handleProjectTypeChange}
              className="text-[#a8499c] focus:ring-[#a8499c]/50"
            />
            <span className="ml-2">Other Project</span>
          </label>
        </div>
      </div>

      {/* Standard Project Selection */}
      {projectSelectionType === "standard" && (
        <div>
          <label className="block text-sm font-medium text-[#818181] mb-1">
            Select Project
          </label>
          <select
            name="standardProject"
            value={selectedStandardProject}
            onChange={handleStandardProjectChange}
            className="w-full p-3 border border-[#818181]/30 rounded-lg focus:ring-2 focus:ring-[#a8499c]/50 focus:border-transparent transition-colors"
            required
          >
            <option value="">Select Project</option>
            {sortedProjects.map((project) => (
              <option 
                key={`${project._id}-${project.code}`} 
                value={project.name}
              >
                {project.name} ({project.code}) - {project.department}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Custom Project Fields */}
      {projectSelectionType === "other" && (
        <>
          <div>
            <label className="block text-sm font-medium text-[#818181] mb-1">
              Project Name
            </label>
            <input
              type="text"
              name="customProjectName"
              value={customProjectName}
              onChange={handleCustomProjectNameChange}
              className="w-full p-3 border border-[#818181]/30 rounded-lg focus:ring-2 focus:ring-[#a8499c]/50 focus:border-transparent"
              required
            />
          </div>

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
              <option value="ADMIN">ADMIN</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </>
      )}

      {/* Project Code (readonly for standard projects) */}
      {projectSelectionType === "standard" && (
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
      )}

      {/* Department (readonly for standard projects) */}
      {projectSelectionType === "standard" && (
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
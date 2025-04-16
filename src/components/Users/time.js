import React, { useState } from "react";

const TimeTrackingPage = () => {
  const [entries, setEntries] = useState([]);
  const [task, setTask] = useState("");
  const [hours, setHours] = useState("");
  const [projectName, setProjectName] = useState("");
  const [projectCode, setProjectCode] = useState("");
  const [isNewTask, setIsNewTask] = useState(false);
  const [isMiscellaneousTask, setIsMiscellaneousTask] = useState(false);
  const [newTaskName, setNewTaskName] = useState("");
  const [miscellaneousTask, setMiscellaneousTask] = useState("");

  const handleAddEntry = () => {
    if (
      (task || newTaskName || miscellaneousTask) &&
      hours &&
      (projectName || isMiscellaneousTask)
    ) {
      const newEntry = {
        task: isNewTask ? newTaskName : isMiscellaneousTask ? miscellaneousTask : task,
        hours,
        projectName: isMiscellaneousTask ? "Miscellaneous" : projectName,
        projectCode: isMiscellaneousTask ? "N/A" : projectCode,
        type: isMiscellaneousTask ? "Miscellaneous" : isNewTask ? "New Task" : "Assigned Task",
      };
      setEntries([...entries, newEntry]);
      setTask("");
      setHours("");
      setProjectName("");
      setProjectCode("");
      setIsNewTask(false);
      setIsMiscellaneousTask(false);
      setNewTaskName("");
      setMiscellaneousTask("");
    }
  };

  return (
    <div className="flex-1 p-6 bg-gray-100 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-4 shadow rounded-lg mb-6">
        <h1 className="text-2xl font-bold text-[#3b0764]">Time Sheet</h1>
      </div>

      {/* Time Logging Section */}
      <div className="bg-white p-6 shadow rounded-lg mb-6">
        <h2 className="text-lg font-semibold mb-4">Log Work Hours</h2>

        {/* Project Details */}
        {!isMiscellaneousTask && (
          <div className="grid grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              placeholder="Project Name"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="border border-gray-300 p-2 rounded w-full"
            />
            <input
              type="text"
              placeholder="Project Code"
              value={projectCode}
              onChange={(e) => setProjectCode(e.target.value)}
              className="border border-gray-300 p-2 rounded w-full"
            />
          </div>
        )}

        {/* Task Details */}
        <div className="flex gap-4 mb-4">
          <input
            type="text"
            placeholder="Task Name"
            value={task}
            onChange={(e) => setTask(e.target.value)}
            className="border border-gray-300 p-2 rounded w-full"
            disabled={isNewTask || isMiscellaneousTask}
          />
          <input
            type="number"
            placeholder="Hours Spent"
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            className="border border-gray-300 p-2 rounded w-full"
          />
          <button
            onClick={handleAddEntry}
            className="bg-[#3b0764] text-white px-4 py-2 rounded hover:bg-[#4c0a86]"
          >
            Add Entry
          </button>
        </div>

        {/* New Task Checkbox */}
        <div className="flex items-center mb-4">
          <input
            type="checkbox"
            checked={isNewTask}
            onChange={(e) => {
              setIsNewTask(e.target.checked);
              if (e.target.checked) setIsMiscellaneousTask(false);
            }}
            className="mr-2"
          />
          <label>Log a New Task</label>
        </div>

        {/* New Task Section */}
        {isNewTask && (
          <div className="mb-4">
            <input
              type="text"
              placeholder="New Task Name"
              value={newTaskName}
              onChange={(e) => setNewTaskName(e.target.value)}
              className="border border-gray-300 p-2 rounded w-full"
            />
          </div>
        )}

        {/* Miscellaneous Task Checkbox */}
        <div className="flex items-center mb-4">
          <input
            type="checkbox"
            checked={isMiscellaneousTask}
            onChange={(e) => {
              setIsMiscellaneousTask(e.target.checked);
              if (e.target.checked) setIsNewTask(false);
            }}
            className="mr-2"
          />
          <label>Log Miscellaneous Task</label>
        </div>

        {/* Miscellaneous Task Section */}
        {isMiscellaneousTask && (
          <div className="mb-4">
            <input
              type="text"
              placeholder="Miscellaneous Task Name"
              value={miscellaneousTask}
              onChange={(e) => setMiscellaneousTask(e.target.value)}
              className="border border-gray-300 p-2 rounded w-full"
            />
          </div>
        )}
      </div>

      {/* Time Entries Table */}
      <div className="bg-white p-6 shadow rounded-lg">
        <h2 className="text-lg font-semibold mb-4">Logged Hours</h2>
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-300 p-2">Task Name</th>
              <th className="border border-gray-300 p-2">Hours Spent</th>
              <th className="border border-gray-300 p-2">Project Name</th>
              <th className="border border-gray-300 p-2">Project Code</th>
              <th className="border border-gray-300 p-2">Type</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, index) => (
              <tr key={index} className="bg-gray-50">
                <td className="border border-gray-300 p-2">{entry.task}</td>
                <td className="border border-gray-300 p-2">{entry.hours}</td>
                <td className="border border-gray-300 p-2">{entry.projectName}</td>
                <td className="border border-gray-300 p-2">{entry.projectCode}</td>
                <td className="border border-gray-300 p-2">{entry.type}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TimeTrackingPage;
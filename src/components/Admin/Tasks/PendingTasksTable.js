import React from "react";
import { FiEdit, FiChevronDown, FiChevronUp } from "react-icons/fi";
import StatusBadge from "./StatusBadge";

const PendingTasksTable = ({ tasks, setSelectedTask }) => {
  const [expandedTask, setExpandedTask] = React.useState(null);
  const [sortConfig, setSortConfig] = React.useState({
    key: null,
    direction: "ascending",
  });

  const toggleExpand = (taskId) => {
    setExpandedTask(expandedTask === taskId ? null : taskId);
  };

  const requestSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const sortedTasks = React.useMemo(() => {
    if (!sortConfig.key) return tasks;

    return [...tasks].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === "ascending" ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === "ascending" ? 1 : -1;
      }
      return 0;
    });
  }, [tasks, sortConfig]);

  if (tasks.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
        No pending task requests
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-4 border-b border-gray-100 bg-[#f8f9fa]">
        <h2 className="text-xl font-semibold text-[#a8499c]">
          Pending Task Requests
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          {tasks.length} pending requests
        </p>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {[
                  { key: "requestedName", label: "Name" },
                  { key: "Task", label: "Task" },
                  { key: "hours", label: "Hours" },
                  { key: "project", label: "Project" },
                  { key: "department", label: "Department" },
                  { key: "requester", label: "Requester" },
                  { key: "status", label: "Status" },
                  { key: "actions", label: "Actions" },
                ].map((header) => (
                  <th
                    key={header.key}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() =>
                      header.key !== "actions" && requestSort(header.key)
                    }
                  >
                    <div className="flex items-center">
                      {header.label}
                      {sortConfig.key === header.key && (
                        <span className="ml-1">
                          {sortConfig.direction === "ascending" ? (
                            <FiChevronUp size={14} />
                          ) : (
                            <FiChevronDown size={14} />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedTasks.map((task) => (
                <tr
                  key={task._id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 break-words whitespace-normal max-w-xs">
                    {task.requestedName}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 break-words whitespace-normal max-w-xs">
                    {task.Task}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {task.hours}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 break-words whitespace-normal max-w-xs">
                    {task.project}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {task.department}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {task.requester || "-"}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={task.status} />
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium">
                    <button
                      onClick={() => setSelectedTask(task)}
                      className="text-[#a8499c] hover:text-[#8a3a7d] flex items-center gap-1 bg-[#f3e6f1] px-3 py-1 rounded-md hover:bg-[#e8d4e6] transition-colors"
                    >
                      <FiEdit size={14} /> Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden">
        {sortedTasks.map((task) => (
          <div
            key={task._id}
            className="border-b border-gray-200 last:border-b-0 p-4 hover:bg-gray-50 transition-colors"
          >
            <div
              className="flex justify-between items-center cursor-pointer"
              onClick={() => toggleExpand(task._id)}
            >
              <div>
                <h3 className="font-medium text-gray-900">
                  {task.requestedName}
                </h3>
                <p className="text-sm text-gray-500">{task.Task}</p>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={task.status} />
                <button className="text-gray-400">
                  {expandedTask === task._id ? (
                    <FiChevronUp />
                  ) : (
                    <FiChevronDown />
                  )}
                </button>
              </div>
            </div>

            {expandedTask === task._id && (
              <div className="mt-3 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-xs text-gray-500">Hours</p>
                    <p className="text-sm">{task.hours}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Project</p>
                    <p className="text-sm">{task.project}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Department</p>
                    <p className="text-sm">{task.department}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Requester</p>
                    <p className="text-sm">{task.requester || "-"}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Notes</p>
                  <p className="text-sm">{task.Notes || "No notes"}</p>
                </div>
                <button
                  onClick={() => setSelectedTask(task)}
                  className="w-full mt-2 text-[#a8499c] hover:text-[#8a3a7d] flex items-center justify-center gap-1 bg-[#f3e6f1] px-3 py-2 rounded-md hover:bg-[#e8d4e6] transition-colors"
                >
                  <FiEdit size={14} /> Review Task
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PendingTasksTable;

import React, { useMemo, useState } from "react";
import {
  FiEdit,
  FiCalendar,
  FiTrash2,
  FiEye,
  FiFilter,
  FiX,
} from "react-icons/fi";
import { format, startOfWeek, parseISO, isWithinInterval } from "date-fns";

const ApprovedRejectedTasksTable = ({
  approvedTasks,
  rejectedTasks,
  setSelectedTask,
  onDeleteTask,
  onViewDetails,
}) => {
  // State for filter controls
  const [showFilters, setShowFilters] = useState(false);
  const [nameFilter, setNameFilter] = useState("");
  const [projectFilter, setProjectFilter] = useState("");
  const [dateRange, setDateRange] = useState({
    start: null,
    end: null,
  });

  // Memoized task processing with filters
  const { weekGroups, filteredRejectedTasks } =
    useMemo(() => {
      // Filter function for tasks
      const applyFilters = (task) => {
        // Name filter
        if (
          nameFilter &&
          !task.requestedName.toLowerCase().includes(nameFilter.toLowerCase())
        ) {
          return false;
        }

        // Project filter
        if (
          projectFilter &&
          !task.project.toLowerCase().includes(projectFilter.toLowerCase())
        ) {
          return false;
        }

        // Date range filter
        if (dateRange.start && dateRange.end && task.date) {
          const taskDate = parseISO(task.date);
          if (
            !isWithinInterval(taskDate, {
              start: dateRange.start,
              end: dateRange.end,
            })
          ) {
            return false;
          }
        }

        return true;
      };

      const getConsolidatedTasks = (tasks) => {
        const taskMap = new Map();

        tasks.forEach((task) => {
          if (!applyFilters(task)) return;

          const baseId = task._id.split("-")[0];

          if (!taskMap.has(baseId)) {
            taskMap.set(baseId, {
              ...task,
              _id: baseId,
              allDates: [],
              weekHours: task.weekHours || [],
            });
          }

          const currentTask = taskMap.get(baseId);
          if (task.date) {
            const dateKey = new Date(task.date).toISOString();
            if (
              !currentTask.allDates.some(
                (d) => new Date(d.date).toISOString() === dateKey
              )
            ) {
              currentTask.allDates.push({
                date: task.date,
                hours: task.approvedHours || task.hours,
              });
            }
          }
        });

        return Array.from(taskMap.values()).flatMap((task) => {
          return task.allDates.length > 0
            ? task.allDates.map((dateInfo) => ({
                ...task,
                _id: `${task._id}-${new Date(dateInfo.date).getTime()}`,
                date: dateInfo.date,
                approvedHours: dateInfo.hours,
                weekHours: task.weekHours.filter(
                  (wh) =>
                    new Date(wh.date).getTime() ===
                    new Date(dateInfo.date).getTime()
                ),
              }))
            : [task];
        });
      };

      const groupByWeek = (tasks) => {
        const weeks = {};

        tasks.forEach((task) => {
          const taskDate = task.date ? parseISO(task.date) : new Date();
          const weekStart = startOfWeek(taskDate, { weekStartsOn: 1 });
          const weekKey = format(weekStart, "yyyy-MM-dd");

          if (!weeks[weekKey]) {
            weeks[weekKey] = {
              weekStart,
              tasks: [],
            };
          }

          weeks[weekKey].tasks.push(task);
        });

        return Object.values(weeks).sort((a, b) => b.weekStart - a.weekStart);
      };

      const consolidated = getConsolidatedTasks(approvedTasks);
      const groups = groupByWeek(consolidated);
      const filteredRejected = rejectedTasks.filter(applyFilters);

      return {
        consolidatedApprovedTasks: consolidated,
        weekGroups: groups,
        filteredRejectedTasks: filteredRejected,
      };
    }, [approvedTasks, rejectedTasks, nameFilter, projectFilter, dateRange]);

  const clearFilters = () => {
    setNameFilter("");
    setProjectFilter("");
    setDateRange({ start: null, end: null });
  };

  const hasActiveFilters =
    nameFilter || projectFilter || dateRange.start || dateRange.end;

  return (
    <div className="bg-white p-6 shadow rounded-lg mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Approved/Rejected Tasks</h2>
        <div className="flex gap-2">
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 text-sm bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded"
            >
              <FiX size={14} /> Clear filters
            </button>
          )}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-1 text-sm bg-blue-100 hover:bg-blue-200 px-3 py-1 rounded"
          >
            <FiFilter size={14} /> {showFilters ? "Hide" : "Show"} Filters
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="bg-gray-50 p-4 rounded-lg mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
              placeholder="Filter by name..."
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Project</label>
            <input
              type="text"
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              placeholder="Filter by project..."
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Date Range</label>
            <div className="flex gap-2">
              <input
                type="date"
                value={
                  dateRange.start ? format(dateRange.start, "yyyy-MM-dd") : ""
                }
                onChange={(e) =>
                  setDateRange({
                    ...dateRange,
                    start: e.target.value ? parseISO(e.target.value) : null,
                  })
                }
                className="w-full p-2 border rounded"
              />
              <input
                type="date"
                value={dateRange.end ? format(dateRange.end, "yyyy-MM-dd") : ""}
                onChange={(e) =>
                  setDateRange({
                    ...dateRange,
                    end: e.target.value ? parseISO(e.target.value) : null,
                  })
                }
                className="w-full p-2 border rounded"
              />
            </div>
          </div>
        </div>
      )}

      <div className="max-h-96 overflow-y-auto">
        {weekGroups.map((week) => (
          <div
            key={`week-${format(week.weekStart, "yyyy-MM-dd")}`}
            className="mb-6"
          >
            <h3 className="font-medium mb-2 flex items-center">
              <FiCalendar className="mr-2" />
              Week of {format(week.weekStart, "PP")}
            </h3>
            <table className="w-full border-collapse border border-gray-200 mb-4">
              <thead className="bg-gray-100 sticky top-0">
                <tr>
                  <th className="border p-2 text-left">Name</th>
                  <th className="border p-2 text-left">Task</th>
                  <th className="border p-2 text-left">Project</th>
                  <th className="border p-2 text-left">Hours</th>
                  <th className="border p-2 text-left">Date</th>
                  <th className="border p-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {week.tasks.map((task) => (
                  <TaskRow
                    key={task._id}
                    task={task}
                    status="Approved"
                    setSelectedTask={setSelectedTask}
                    onDelete={onDeleteTask}
                    onViewDetails={onViewDetails}
                  />
                ))}
              </tbody>
            </table>
          </div>
        ))}

        {filteredRejectedTasks.length > 0 && (
          <div className="mt-8">
            <h3 className="font-medium mb-2">Rejected Tasks</h3>
            <table className="w-full border-collapse border border-gray-200">
              <thead className="bg-gray-100 sticky top-0">
                <tr>
                  <th className="border p-2 text-left">Name</th>
                  <th className="border p-2 text-left">Task</th>
                  <th className="border p-2 text-left">Project</th>
                  <th className="border p-2 text-left">Status</th>
                  <th className="border p-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRejectedTasks.map((task) => (
                  <TaskRow
                    key={task._id}
                    task={task}
                    status="Rejected"
                    setSelectedTask={setSelectedTask}
                    onDelete={onDeleteTask}
                    onViewDetails={onViewDetails}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}

        {weekGroups.length === 0 && filteredRejectedTasks.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No tasks found matching your filters
          </div>
        )}
      </div>
    </div>
  );
};

const TaskRow = React.memo(
  ({ task, status, setSelectedTask, onDelete, onViewDetails }) => {
    const handleEdit = () => {
      setSelectedTask({
        ...task,
        weekHours: task.weekHours || [],
        isEditing: true,
      });
    };

    const handleDelete = () => {
      if (
        window.confirm(
          `Are you sure you want to delete this ${status.toLowerCase()} task?`
        )
      ) {
        onDelete(task._id, status);
      }
    };

    const handleViewDetails = () => {
      onViewDetails(task);
    };

    const taskDate = task.date ? parseISO(task.date) : null;
    const weekHourEntry = task.weekHours?.find(
      (wh) => task.date && new Date(wh.date).getTime() === taskDate?.getTime()
    );

    return (
      <tr className="border hover:bg-gray-50">
        <td className="border p-2">{task.requestedName}</td>
        <td className="border p-2">{task.Task}</td>
        <td className="border p-2">{task.project}</td>
        {status === "Approved" && (
          <>
            <td className="border p-2">
              <span
                className={`px-2 py-1 rounded ${
                  (weekHourEntry?.hours || 0) > 8
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-green-100 text-green-800"
                }`}
              >
                {weekHourEntry?.hours || task.approvedHours || task.hours}
              </span>
            </td>
            <td className="border p-2">
              {taskDate ? format(taskDate, "PP") : "-"}
            </td>
          </>
        )}
        {status === "Rejected" && (
          <td className="border p-2">
            <span className="px-2 py-1 rounded bg-red-100 text-red-800">
              Rejected
            </span>
          </td>
        )}
        <td className="border p-2">
          <div className="flex gap-2">
            <button
              onClick={handleEdit}
              className="p-1 text-blue-600 hover:text-blue-800"
              title="Edit"
            >
              <FiEdit />
            </button>
            <button
              onClick={handleDelete}
              className="p-1 text-red-600 hover:text-red-800"
              title="Delete"
            >
              <FiTrash2 />
            </button>
            <button
              onClick={handleViewDetails}
              className="p-1 text-gray-600 hover:text-gray-800"
              title="View Details"
            >
              <FiEye />
            </button>
          </div>
        </td>
      </tr>
    );
  }
);

export default ApprovedRejectedTasksTable;

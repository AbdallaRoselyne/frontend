import React, { useMemo, useState } from "react";
import { FiEdit, FiCalendar, FiFilter, FiX } from "react-icons/fi";
import { format, startOfWeek, parseISO, isWithinInterval } from "date-fns";
import StatusBadge from "./StatusBadge";

const ApprovedRejectedTasksTable = ({
  approvedTasks = [],
  rejectedTasks = [],
  setSelectedTask,
  onDeleteTask,
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const [nameFilter, setNameFilter] = useState("");
  const [projectFilter, setProjectFilter] = useState("");
  const [dateRange, setDateRange] = useState({ start: null, end: null });

  const { weekGroups, filteredRejectedTasks } = useMemo(() => {
    const applyFilters = (task) => {
      if (
        nameFilter &&
        !task.requestedName.toLowerCase().includes(nameFilter.toLowerCase())
      ) {
        return false;
      }
      if (
        projectFilter &&
        !task.project.toLowerCase().includes(projectFilter.toLowerCase())
      ) {
        return false;
      }
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

  if (approvedTasks.length === 0 && rejectedTasks.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
        No approved or rejected tasks
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200">
      <div className="p-4 border-b border-gray-200 bg-[#f8f9fa]">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-[#a8499c]">
            Approved/Rejected Tasks
          </h2>
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
              className="flex items-center gap-1 text-sm bg-[#e8d4e6] hover:bg-[#dcc3da] px-3 py-1 rounded text-[#a8499c]"
            >
              <FiFilter size={14} /> {showFilters ? "Hide" : "Show"} Filters
            </button>
          </div>
        </div>
      </div>

      {showFilters && (
        <div className="bg-gray-50 p-4 border-b border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Name
            </label>
            <input
              type="text"
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
              placeholder="Filter by name..."
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Project
            </label>
            <input
              type="text"
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              placeholder="Filter by project..."
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Date Range
            </label>
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
                className="w-full p-2 border border-gray-300 rounded"
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
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
          </div>
        </div>
      )}

      <div className="overflow-y-auto max-h-[500px]">
        {weekGroups.map((week) => (
          <div
            key={`week-${format(week.weekStart, "yyyy-MM-dd")}`}
            className="p-4 border-b border-gray-200 last:border-b-0"
          >
            <h3 className="font-medium mb-3 flex items-center text-[#a8499c]">
              <FiCalendar className="mr-2" />
              Week of {format(week.weekStart, "PP")}
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-2 text-left text-sm font-medium text-gray-700">
                      Name
                    </th>
                    <th className="p-2 text-left text-sm font-medium text-gray-700">
                      Task
                    </th>
                    <th className="p-2 text-left text-sm font-medium text-gray-700">
                      Project
                    </th>
                    <th className="p-2 text-left text-sm font-medium text-gray-700">
                      Hours
                    </th>
                    <th className="p-2 text-left text-sm font-medium text-gray-700">
                      Date
                    </th>
                    <th className="p-2 text-left text-sm font-medium text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {week.tasks.map((task) => (
                    <TaskRow
                      key={task._id}
                      task={task}
                      status="Approved"
                      setSelectedTask={setSelectedTask}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}

        {filteredRejectedTasks.length > 0 && (
          <div className="p-4">
            <h3 className="font-medium mb-3 text-[#a8499c]">Rejected Tasks</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-2 text-left text-sm font-medium text-gray-700">
                      Name
                    </th>
                    <th className="p-2 text-left text-sm font-medium text-gray-700">
                      Task
                    </th>
                    <th className="p-2 text-left text-sm font-medium text-gray-700">
                      Project
                    </th>
                    <th className="p-2 text-left text-sm font-medium text-gray-700">
                      Status
                    </th>
                    <th className="p-2 text-left text-sm font-medium text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRejectedTasks.map((task) => (
                    <TaskRow
                      key={task._id}
                      task={task}
                      status="Rejected"
                      setSelectedTask={setSelectedTask}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const TaskRow = React.memo(({ task, status, setSelectedTask }) => {
  const taskDate = task.date ? parseISO(task.date) : null;
  const weekHourEntry = task.weekHours?.find(
    (wh) => task.date && new Date(wh.date).getTime() === taskDate?.getTime()
  );

  return (
    <tr className="hover:bg-gray-50">
      <td className="p-2 text-sm border-b border-gray-200">
        {task.requestedName}
      </td>
      <td className="p-2 text-sm border-b border-gray-200">{task.Task}</td>
      <td className="p-2 text-sm border-b border-gray-200">{task.project}</td>
      {status === "Approved" && (
        <>
          <td className="p-2 text-sm border-b border-gray-200">
            <span
              className={`px-2 py-1 rounded ${
                (weekHourEntry?.hours || 0) > 8
                  ? "bg-[#fef9c3] text-[#713f12]"
                  : "bg-[#dcfce7] text-[#166534]"
              }`}
            >
              {weekHourEntry?.hours || task.approvedHours || task.hours}
            </span>
          </td>
          <td className="p-2 text-sm border-b border-gray-200">
            {taskDate ? format(taskDate, "PP") : "-"}
          </td>
        </>
      )}
      {status === "Rejected" && (
        <td className="p-2 text-sm border-b border-gray-200">
          <StatusBadge status={status} />
        </td>
      )}
      <td className="p-2 text-sm border-b border-gray-200">
        <button
          onClick={() => setSelectedTask(task)}
          className="p-1 text-[#a8499c] hover:text-[#8a3a7d]"
          title="Edit"
        >
          <FiEdit />
        </button>
      </td>
    </tr>
  );
});

export default ApprovedRejectedTasksTable;

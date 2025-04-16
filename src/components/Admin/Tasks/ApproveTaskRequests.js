import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useTaskApprovalLogic } from "./TaskApprovalLogic";
import FiltersPanel from "./FiltersPanel";
import PendingTasksTable from "./PendingTasksTable";
import TaskDetailsPanel from "./TaskDetailsPanel";
import ApprovedRejectedTasksTable from "./ApprovedRejectedTasksTable";

const ApproveTaskRequests = () => {
  const [taskRequests, setTaskRequests] = useState([]);
  const [approvedTasks, setApprovedTasks] = useState([]);
  const [rejectedTasks, setRejectedTasks] = useState([]);
  const [filters, setFilters] = useState({
    requestedName: "",
    project: "",
    date: "",
  });

  const {
    selectedTask,
    setSelectedTask,
    weekHours,
    setWeekHours,
    comment,
    setComment,
    handleDateChange,
    handleHoursChange,
    handleApprove,
    handleReject,
    handleUpdateTask,
    handleDeleteDate,
  } = useTaskApprovalLogic();

  useEffect(() => {
    fetchTaskRequests();
    fetchApprovedRejectedTasks();
  }, []);

  const fetchTaskRequests = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/requests");
      const data = await response.json();
      setTaskRequests(data);
    } catch (error) {
      console.error("Error fetching task requests:", error);
      toast.error("Failed to fetch tasks");
    }
  };

  const fetchApprovedRejectedTasks = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/tasks");
      const data = await response.json();
      const approved = data.filter((task) => task.status === "Approved");
      const rejected = data.filter((task) => task.status === "Rejected");
      setApprovedTasks(approved);
      setRejectedTasks(rejected);
    } catch (error) {
      console.error("Error fetching approved/rejected tasks:", error);
      toast.error("Failed to fetch tasks");
    }
  };

  const handleViewDetails = (task) => {
    setSelectedTask(task);
    // If the task has weekHours, set them for viewing
    if (task.weekHours && task.weekHours.length > 0) {
      const weekHoursWithDefaults = [
        { day: "Monday", date: null, hours: 0 },
        { day: "Tuesday", date: null, hours: 0 },
        { day: "Wednesday", date: null, hours: 0 },
        { day: "Thursday", date: null, hours: 0 },
        { day: "Friday", date: null, hours: 0 },
      ];

      task.weekHours.forEach((wh) => {
        const dayIndex = new Date(wh.date).getDay() - 1; // Monday is 1
        if (dayIndex >= 0 && dayIndex < 5) {
          weekHoursWithDefaults[dayIndex] = {
            day: weekHoursWithDefaults[dayIndex].day,
            date: wh.date,
            hours: wh.hours,
          };
        }
      });

      setWeekHours(weekHoursWithDefaults);
    }
  };

  const filteredTasks = taskRequests.filter((task) => {
    const taskDate = task.date
      ? new Date(task.date).toISOString().split("T")[0]
      : null;
    const filterDate = filters.date
      ? new Date(filters.date).toISOString().split("T")[0]
      : null;

    return (
      (!filters.requestedName ||
        task.requestedName.includes(filters.requestedName)) &&
      (!filters.project || task.project.includes(filters.project)) &&
      (!filters.date || taskDate === filterDate)
    );
  });

  return (
    <div className="flex h-screen p-6 bg-gray-100 overflow-y-auto">
      <ToastContainer />
      <div className="flex-1">
        <div className="bg-white p-4 shadow rounded-lg mb-6">
          <h1 className="text-2xl font-bold text-[#3b0764]">
            Approve Task Requests
          </h1>
        </div>
        
        <FiltersPanel filters={filters} setFilters={setFilters} />
        
        <PendingTasksTable 
          tasks={filteredTasks} 
          setSelectedTask={setSelectedTask} 
        />
        
        {selectedTask && (
          <TaskDetailsPanel
            selectedTask={selectedTask}
            setSelectedTask={setSelectedTask}
            weekHours={weekHours}
            setWeekHours={setWeekHours}
            comment={comment}
            setComment={setComment}
            handleDateChange={handleDateChange}
            handleHoursChange={handleHoursChange}
            handleApprove={() => handleApprove(
              selectedTask,
              approvedTasks,
              setApprovedTasks,
              taskRequests,
              setTaskRequests
            )}
            handleReject={() => handleReject(
              selectedTask,
              rejectedTasks,
              setRejectedTasks,
              taskRequests,
              setTaskRequests
            )}
            handleUpdateTask={() => handleUpdateTask(
              selectedTask,
              setApprovedTasks,
              setRejectedTasks
            )}
            handleDeleteDate={handleDeleteDate}
          />
        )}
        
        {(approvedTasks.length > 0 || rejectedTasks.length > 0) && (
          <ApprovedRejectedTasksTable
            approvedTasks={approvedTasks}
            rejectedTasks={rejectedTasks}
            setSelectedTask={setSelectedTask}
            onViewDetails={handleViewDetails}
          />
        )}
      </div>
    </div>
  );
};

export default ApproveTaskRequests;
import React, { useState, useEffect } from "react";
import { useTaskManagement } from "./TaskApprovalLogic";
import FiltersPanel from "./FiltersPanel";
import PendingTasksTable from "./PendingTasksTable";
import ApprovedRejectedTasksTable from "./ApprovedRejectedTasksTable";
import TaskDetailsPanel from "./TaskDetailsPanel";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

const ApproveTaskRequests = () => {
  const [taskRequests, setTaskRequests] = useState([]);
  const [approvedTasks, setApprovedTasks] = useState([]);
  const [rejectedTasks, setRejectedTasks] = useState([]);
  const [filters, setFilters] = useState({
    requestedName: "",
    project: "",
    date: ""
  });
  const [isLoading, setIsLoading] = useState(true);

  const {
    selectedTask,
    setSelectedTask,
    weekHours,
    setWeekHours,
    comment,
    setComment,
    activeTab,
    setActiveTab,
    handleDateChange,
    handleHoursChange,
    handleDeleteDate,
    handleApprove,
    handleReject,
    handleUpdateTask,
    resetForm
  } = useTaskManagement();

  useEffect(() => {
    fetchAllTasks();
  }, []);

  useEffect(() => {
    // Set default tab based on available tasks
    if (!isLoading) {
      if (taskRequests.length > 0) {
        setActiveTab("pending");
      } else if (approvedTasks.length > 0) {
        setActiveTab("approved");
      } else {
        setActiveTab("rejected");
      }
    }
  }, [isLoading, taskRequests, approvedTasks, rejectedTasks, setActiveTab]); // Added setActiveTab to dependencies

  const fetchAllTasks = async () => {
    setIsLoading(true);
    try {
      const [requestsRes, tasksRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/requests`),
        fetch(`${API_BASE_URL}/api/tasks`)
      ]);

      if (!requestsRes.ok || !tasksRes.ok) {
        throw new Error("Failed to fetch tasks");
      }

      const requests = await requestsRes.json();
      const tasks = await tasksRes.json();

      setTaskRequests(requests);
      setApprovedTasks(tasks.filter(t => t.status === "Approved"));
      setRejectedTasks(tasks.filter(t => t.status === "Rejected"));
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTasks = taskRequests.filter(task => {
    const matchesName = !filters.requestedName || 
      task.requestedName.toLowerCase().includes(filters.requestedName.toLowerCase());
    const matchesProject = !filters.project || 
      task.project.toLowerCase().includes(filters.project.toLowerCase());
    const matchesDate = !filters.date || 
      (task.date && new Date(task.date).toISOString().split('T')[0] === filters.date);

    return matchesName && matchesProject && matchesDate;
  });

  const handleTaskApproved = async (taskId) => {
    const approvedTask = await handleApprove(taskId);
    if (approvedTask) {
      setApprovedTasks(prev => [...prev, approvedTask.task]);
      setTaskRequests(prev => prev.filter(t => t._id !== taskId));
      fetchAllTasks();
    }
  };

  const handleTaskRejected = async (taskId) => {
    const rejectedTask = await handleReject(taskId);
    if (rejectedTask) {
      setRejectedTasks(prev => [...prev, rejectedTask.task]);
      setTaskRequests(prev => prev.filter(t => t._id !== taskId));
      fetchAllTasks();
    }
  };

  const handleTaskUpdated = async (taskId) => {
    const updatedTask = await handleUpdateTask(taskId);
    if (updatedTask) {
      if (updatedTask.status === "Approved") {
        setApprovedTasks(prev => 
          prev.map(t => t._id === taskId ? updatedTask : t)
        );
      } else if (updatedTask.status === "Rejected") {
        setRejectedTasks(prev => 
          prev.map(t => t._id === taskId ? updatedTask : t)
        );
      }
      fetchAllTasks();
    }
  };

  const handleDateDeleted = async (taskId, date) => {
    const result = await handleDeleteDate(taskId, date);
    if (result) {
      if (result.deleted) {
        setApprovedTasks(prev => prev.filter(t => t._id !== taskId));
      } else {
        setApprovedTasks(prev => 
          prev.map(t => t._id === taskId ? result.task : t)
        );
      }
      fetchAllTasks();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-[#a8499c]">Task Management</h2>
      </div>

      <FiltersPanel 
        filters={filters} 
        setFilters={setFilters} 
      />

      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="flex border-b border-gray-200">
          <button
            className={`px-4 py-3 font-medium ${activeTab === 'pending' ? 'text-[#a8499c] border-b-2 border-[#a8499c]' : 'text-gray-500'}`}
            onClick={() => setActiveTab('pending')}
          >
            Pending ({taskRequests.length})
          </button>
          <button
            className={`px-4 py-3 font-medium ${activeTab === 'approved' ? 'text-[#a8499c] border-b-2 border-[#a8499c]' : 'text-gray-500'}`}
            onClick={() => setActiveTab('approved')}
          >
            Approved ({approvedTasks.length})
          </button>
          <button
            className={`px-4 py-3 font-medium ${activeTab === 'rejected' ? 'text-[#a8499c] border-b-2 border-[#a8499c]' : 'text-gray-500'}`}
            onClick={() => setActiveTab('rejected')}
          >
            Rejected ({rejectedTasks.length})
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-8">Loading tasks...</div>
        ) : (
          <>
            {activeTab === 'pending' && (
              <>
                {filteredTasks.length > 0 ? (
                  <PendingTasksTable 
                    tasks={filteredTasks} 
                    setSelectedTask={setSelectedTask} 
                  />
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No pending tasks found
                  </div>
                )}
              </>
            )}

            {activeTab === 'approved' && (
              <>
                {approvedTasks.length > 0 ? (
                  <ApprovedRejectedTasksTable
                    approvedTasks={approvedTasks}
                    rejectedTasks={[]}
                    setSelectedTask={setSelectedTask}
                    onDeleteTask={handleDateDeleted}
                  />
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No approved tasks found
                  </div>
                )}
              </>
            )}

            {activeTab === 'rejected' && (
              <>
                {rejectedTasks.length > 0 ? (
                  <ApprovedRejectedTasksTable
                    approvedTasks={[]}
                    rejectedTasks={rejectedTasks}
                    setSelectedTask={setSelectedTask}
                    onDeleteTask={handleDateDeleted}
                  />
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No rejected tasks found
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>

      {(selectedTask) && (
        <TaskDetailsPanel
          selectedTask={selectedTask}
          setSelectedTask={setSelectedTask}
          weekHours={weekHours}
          setWeekHours={setWeekHours}
          comment={comment}
          setComment={setComment}
          handleDateChange={handleDateChange}
          handleHoursChange={handleHoursChange}
          handleApprove={handleTaskApproved}
          handleReject={handleTaskRejected}
          handleUpdateTask={handleTaskUpdated}
          handleDeleteDate={handleDateDeleted}
          resetForm={resetForm}
        />
      )}
    </div>
  );
};

export default ApproveTaskRequests;
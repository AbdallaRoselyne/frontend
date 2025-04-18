import { useState } from "react";
import { toast } from "react-toastify";

export const useTaskApprovalLogic = () => {
  const [selectedTask, setSelectedTask] = useState(null);
  const [weekHours, setWeekHours] = useState([
    { day: "Monday", date: null, hours: 0 },
    { day: "Tuesday", date: null, hours: 0 },
    { day: "Wednesday", date: null, hours: 0 },
    { day: "Thursday", date: null, hours: 0 },
    { day: "Friday", date: null, hours: 0 },
  ]);
  const [comment, setComment] = useState("");

  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

  const handleDateChange = (index, date) => {
    const newWeekHours = [...weekHours];
    newWeekHours[index].date = date;
    setWeekHours(newWeekHours);
  };

  const handleHoursChange = (index, hours) => {
    const newWeekHours = [...weekHours];
    if (hours > 8) {
      toast.error("Maximum 8 hours allowed per day.");
      return;
    }
    newWeekHours[index].hours = hours;
    setWeekHours(newWeekHours);
  };

  const validateWeekHours = () => {
    const filledWeekHours = weekHours.filter(
      (day) => day.date !== null && day.hours > 0
    );

    if (filledWeekHours.length === 0) {
      toast.error("At least one day must be filled.");
      return false;
    }

    const totalHours = filledWeekHours.reduce((sum, day) => sum + day.hours, 0);
    if (totalHours > 40) {
      toast.error("Maximum 40 hours allowed per week.");
      return false;
    }

    return true;
  };

  const resetWeekHours = () => {
    setWeekHours([
      { day: "Monday", date: null, hours: 0 },
      { day: "Tuesday", date: null, hours: 0 },
      { day: "Wednesday", date: null, hours: 0 },
      { day: "Thursday", date: null, hours: 0 },
      { day: "Friday", date: null, hours: 0 },
    ]);
  };

  const handleDeleteDate = async (date) => {
    if (!selectedTask) return toast.error("No task selected");
  
    try {
      const dateObj = date instanceof Date ? date : new Date(date);
      if (isNaN(dateObj.getTime())) {
        throw new Error("Invalid date format");
      }
  
      const taskId = selectedTask._id.split("-")[0];
      const dateString = dateObj.toISOString().split('T')[0];
  
      const response = await fetch(
        `${API_BASE_URL}/api/tasks/${taskId}?date=${dateString}`,
        { method: "DELETE" }
      );
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete date");
      }
  
      const result = await response.json();
      
      if (result.deleted) {
        setSelectedTask(null);
        toast.success("Task deleted (no remaining dates)");
      } else {
        const updatedTask = {
          ...result.task,
          weekHours: result.task.weekHours,
          _id: selectedTask._id
        };
        
        setSelectedTask(updatedTask);
        
        const remainingWeekHours = weekHours.filter(
          wh => !wh.date || new Date(wh.date).toISOString().split('T')[0] !== dateString
        );
        setWeekHours(remainingWeekHours);
        
        toast.success("Date deleted successfully");
      }
    } catch (error) {
      console.error("Delete error details:", error);
      toast.error(`Failed to delete date: ${error.message}`);
    }
  };
  
  const handleApprove = async (
    selectedTask,
    approvedTasks,
    setApprovedTasks,
    taskRequests,
    setTaskRequests
  ) => {
    if (!selectedTask) return toast.error("Select a task first!");
    if (!validateWeekHours()) return;

    try {
      const filledWeekHours = weekHours.filter(
        (day) => day.date !== null && day.hours > 0
      );

      const response = await fetch(
        `${API_BASE_URL}/api/requests/${selectedTask._id}/approve`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ weekHours: filledWeekHours }),
        }
      );

      if (!response.ok) throw new Error("Failed to approve task");

      const approvedTask = await response.json();
      setApprovedTasks([...approvedTasks, approvedTask.task]);
      setTaskRequests(
        taskRequests.filter((task) => task._id !== selectedTask._id)
      );
      setSelectedTask(null);
      resetWeekHours();
      toast.success("Task approved!");
    } catch (error) {
      console.error("Error approving task:", error);
      toast.error("Failed to approve task");
    }
  };

  const handleReject = async (
    selectedTask,
    rejectedTasks,
    setRejectedTasks,
    taskRequests,
    setTaskRequests
  ) => {
    if (!selectedTask) return toast.error("Select a task first!");
    if (!comment) return toast.error("Please provide a reason for rejection.");

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/requests/${selectedTask._id}/reject`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ comment }),
        }
      );

      if (!response.ok) throw new Error("Failed to reject task");

      const rejectedTask = await response.json();
      setRejectedTasks([...rejectedTasks, rejectedTask.task]);
      setTaskRequests(
        taskRequests.filter((task) => task._id !== selectedTask._id)
      );
      setSelectedTask(null);
      setComment("");
      toast.warning("Task rejected!");
    } catch (error) {
      console.error("Error rejecting task:", error);
      toast.error("Failed to reject task");
    }
  };

  const handleUpdateTask = async (
    selectedTask,
    setApprovedTasks,
    setRejectedTasks
  ) => {
    if (!selectedTask) return toast.error("Select a task first!");
    if (!validateWeekHours()) return;

    try {
      const filledWeekHours = weekHours
        .filter((day) => day.date && day.hours > 0)
        .map((day) => {
          const date = day.date instanceof Date ? day.date : new Date(day.date);
          if (isNaN(date.getTime())) {
            throw new Error(`Invalid date for ${day.day}`);
          }
          return {
            day: day.day,
            date: date.toISOString(),
            hours: day.hours,
          };
        });

      const taskId = selectedTask._id.split("-")[0];
      const updateData = {
        ...selectedTask,
        weekHours: filledWeekHours,
      };

      delete updateData._reactInternalFiber;
      delete updateData._reactFragment;

      const response = await fetch(
        `${API_BASE_URL}/api/tasks/${taskId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updateData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update task");
      }

      const updatedTask = await response.json();

      if (updatedTask.status === "Approved") {
        setApprovedTasks((prev) =>
          prev.map((task) =>
            task._id.split("-")[0] === taskId ? updatedTask : task
          )
        );
      } else if (updatedTask.status === "Rejected") {
        setRejectedTasks((prev) =>
          prev.map((task) =>
            task._id.split("-")[0] === taskId ? updatedTask : task
          )
        );
      }

      setSelectedTask(null);
      resetWeekHours();
      toast.success("Task updated successfully!");
    } catch (error) {
      console.error("Update error details:", error);
      toast.error(`Failed to update task: ${error.message}`);
    }
  };

  return {
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
  };
};
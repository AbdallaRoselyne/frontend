import { useState } from "react";
import { toast } from "react-hot-toast";

export const useTaskManagement = () => {
  const [selectedTask, setSelectedTask] = useState(null);
  const [weekHours, setWeekHours] = useState(
    ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map((day) => ({
      day,
      date: null,
      hours: 0,
    }))
  );
  const [comment, setComment] = useState("");
  const [activeTab, setActiveTab] = useState("pending");

  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

  const resetForm = () => {
    setWeekHours(
      ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map((day) => ({
        day,
        date: null,
        hours: 0,
      }))
    );
    setComment("");
    setSelectedTask(null);
  };

  const handleDateChange = (index, date) => {
    const newWeekHours = [...weekHours];
    newWeekHours[index].date = date;
    setWeekHours(newWeekHours);
  };

  const handleHoursChange = (index, hours) => {
    if (hours > 8) {
      toast.error("Maximum 8 hours allowed per day");
      return;
    }
    const newWeekHours = [...weekHours];
    newWeekHours[index].hours = hours;
    setWeekHours(newWeekHours);
  };

  const validateWeekHours = () => {
    const filledDays = weekHours.filter((day) => day.date && day.hours > 0);

    if (filledDays.length === 0) {
      toast.error("At least one day must be filled");
      return false;
    }

    const totalHours = filledDays.reduce((sum, day) => sum + day.hours, 0);
    if (totalHours > 40) {
      toast.error("Maximum 40 hours allowed per week");
      return false;
    }

    return true;
  };

  const handleDeleteDate = async (taskId, date) => {
    if (!taskId || !date) {
      toast.error("Missing task or date information");
      return false;
    }

    try {
      // Extract the original MongoDB ID (first 24 characters)
      const cleanTaskId = taskId.length > 24 ? taskId.substring(0, 24) : taskId;
      const dateStr = new Date(date).toISOString().split("T")[0];

      const response = await fetch(
        `${API_BASE_URL}/api/tasks/${cleanTaskId}?date=${dateStr}`,
        { method: "DELETE" }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete date");
      }

      const result = await response.json();

      if (result.deleted) {
        toast.success("Task deleted (no remaining dates)");
        return { deleted: true };
      } else {
        toast.success("Date deleted successfully");
        return { deleted: false, task: result.task };
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(`Failed to delete date: ${error.message}`);
      return false;
    }
  };

  const handleApprove = async (taskId) => {
    if (!taskId) {
      toast.error("No task selected for approval");
      return null;
    }
    if (!validateWeekHours()) return null;

    try {
      const filledWeekHours = weekHours
        .filter((day) => day.date && day.hours > 0)
        .map((day) => ({
          day: day.day,
          date: day.date.toISOString(),
          hours: day.hours,
        }));

      const response = await fetch(
        `${API_BASE_URL}/api/requests/${taskId}/approve`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ weekHours: filledWeekHours }),
        }
      );

      if (!response.ok) throw new Error("Failed to approve task");

      const approvedTask = await response.json();
      toast.success("Task approved successfully!");
      resetForm();
      return approvedTask;
    } catch (error) {
      console.error("Error approving task:", error);
      toast.error(`Failed to approve task: ${error.message}`);
      return null;
    }
  };

  const handleReject = async (taskId) => {
    if (!taskId) {
      toast.error("No task selected for rejection");
      return null;
    }
    if (!comment) {
      toast.error("Please provide a reason for rejection");
      return null;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/requests/${taskId}/reject`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ comment }),
        }
      );

      if (!response.ok) throw new Error("Failed to reject task");

      const rejectedTask = await response.json();
      toast.success("Task rejected successfully!");
      resetForm();
      return rejectedTask;
    } catch (error) {
      console.error("Error rejecting task:", error);
      toast.error(`Failed to reject task: ${error.message}`);
      return null;
    }
  };

  const handleUpdateTask = async (taskId) => {
    if (!taskId) {
      toast.error("No task selected for update");
      return null;
    }
    if (!validateWeekHours()) return null;

    try {
      const filledWeekHours = weekHours
        .filter((day) => day.date && day.hours > 0)
        .map((day) => ({
          day: day.day,
          date:
            day.date instanceof Date
              ? day.date.toISOString()
              : new Date(day.date).toISOString(),
          hours: day.hours,
        }));

      // Clean the task ID
      const cleanTaskId = taskId.length > 24 ? taskId.substring(0, 24) : taskId;

      const response = await fetch(`${API_BASE_URL}/api/tasks/${cleanTaskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...selectedTask,
          weekHours: filledWeekHours,
        }),
      });

      if (!response.ok) throw new Error("Failed to update task");

      const updatedTask = await response.json();
      toast.success("Task updated successfully!");
      resetForm();
      return updatedTask;
    } catch (error) {
      console.error("Error updating task:", error);
      toast.error(`Failed to update task: ${error.message}`);
      return null;
    }
  };

  return {
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
    resetForm,
  };
};

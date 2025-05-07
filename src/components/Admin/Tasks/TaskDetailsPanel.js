import React, { useEffect } from "react";
import DateTimePicker from "react-datetime-picker";
import "react-calendar/dist/Calendar.css";
import "react-datetime-picker/dist/DateTimePicker.css";
import {
  FiCheckCircle,
  FiEdit,
  FiXCircle,
  FiX,
  FiTrash2,
} from "react-icons/fi";

const TaskDetailsPanel = ({
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
  resetForm,
}) => {
  useEffect(() => {
    if (selectedTask?.status === "Approved" && selectedTask.weekHours) {
      const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
      const updatedWeekHours = days.map((day) => {
        const existingEntry = selectedTask.weekHours.find(
          (wh) => wh.day === day
        );
        return existingEntry || { day, date: null, hours: 0 };
      });
      setWeekHours(updatedWeekHours);
    }
  }, [selectedTask, setWeekHours]);

  if (!selectedTask) return null;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-2xl overflow-y-auto max-h-[90vh]">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-[#a8499c]">
          Task Details: {selectedTask.Task || ""}
        </h2>
        <button
          onClick={resetForm}
          className="text-gray-500 hover:text-gray-700 p-1"
        >
          <FiX size={24} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block font-medium text-gray-700 mb-1">Name:</label>
          <p>{selectedTask.requestedName}</p>
        </div>
        <div>
          <label className="block font-medium text-gray-700 mb-1">Email:</label>
          <p>{selectedTask.email || "-"}</p>
        </div>
        <div>
          <label className="block font-medium text-gray-700 mb-1">
            Project:
          </label>
          <p>{selectedTask.project}</p>
        </div>
        <div>
          <label className="block font-medium text-gray-700 mb-1">
            Hours Requested:
          </label>
          <p>{selectedTask.hours}</p>
        </div>
        <div>
          <label className="block font-medium text-gray-700 mb-1">
            Department:
          </label>
          <p>{selectedTask.department}</p>
        </div>
        <div>
          <label className="block font-medium text-gray-700 mb-1">
            Requester:
          </label>
          <p>{selectedTask.requester || "-"}</p>
        </div>
        <div>
          <label className="block font-medium text-gray-700 mb-1">Notes:</label>
          <p>{selectedTask.Notes || "-"}</p>
        </div>
        <div>
          <label className="block font-medium text-gray-700 mb-1">
            Status:
          </label>
          <p
            className={`inline-block px-2 py-1 rounded ${
              selectedTask.status === "Approved"
                ? "bg-green-100 text-green-800"
                : selectedTask.status === "Rejected"
                ? "bg-red-100 text-red-800"
                : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {selectedTask.status}
          </p>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4 text-[#a8499c]">
          {selectedTask.status === "Approved"
            ? "Schedule Task Hours"
            : "Approve/Reject Task"}
        </h3>

        <div className="space-y-4">
          {weekHours.map((day, index) => (
            <div
              key={`${day.day}-${index}`}
              className="flex flex-col md:flex-row gap-4"
            >
              <div className="flex-1">
                <label className="block font-medium text-gray-700 mb-1">
                  {day.day}:
                </label>
                <DateTimePicker
                  onChange={(date) => handleDateChange(index, date)}
                  value={day.date}
                  format="yyyy-MM-dd"
                  className="w-full p-2 border border-gray-300 rounded"
                  disabled={selectedTask.status === "Approved" && day.date}
                />
              </div>
              <div className="flex-1">
                <label className="block font-medium text-gray-700 mb-1">
                  Hours:
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="0"
                    max="8"
                    value={day.hours}
                    onChange={(e) =>
                      handleHoursChange(index, Number(e.target.value))
                    }
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                  {selectedTask.status === "Approved" && day.date && (
                    <button
                      type="button"
                      onClick={() =>
                        handleDeleteDate(selectedTask._id, day.date)
                      }
                      className="text-red-500 hover:text-red-700 p-2"
                      title="Delete this date"
                    >
                      <FiTrash2 />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {(selectedTask.status === "Rejected" ||
          selectedTask.status === "Pending") && (
          <div className="mt-4">
            <label className="block font-medium text-gray-700 mb-1">
              {selectedTask.status === "Rejected"
                ? "Rejection Reason"
                : "Comment (for rejection):"}
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              rows="3"
              required={selectedTask.status === "Pending"}
            />
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        {selectedTask.status === "Pending" ? (
          <>
            <button
              type="button"
              onClick={() => handleApprove(selectedTask._id)}
              className="bg-[#c8db00] text-gray-800 px-4 py-2 rounded hover:bg-[#b0c200] flex items-center gap-2"
            >
              <FiCheckCircle /> Approve
            </button>
            <button
              type="button"
              onClick={() => handleReject(selectedTask._id)}
              className="bg-[#818181] text-white px-4 py-2 rounded hover:bg-[#6a6a6a] flex items-center gap-2"
            >
              <FiXCircle /> Reject
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => handleUpdateTask(selectedTask._id)}
              className="bg-[#a8499c] text-white px-4 py-2 rounded hover:bg-[#8a3a7d] flex items-center gap-2"
            >
              <FiEdit /> Update
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 flex items-center gap-2"
            >
              <FiX /> Close
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default TaskDetailsPanel;

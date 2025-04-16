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
    <div className="bg-white p-6 shadow rounded-lg mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">
          Task Details:{" "}
          <span className="text-[#3b0764]">{selectedTask.Task}</span>
        </h2>
        <button
          onClick={() => setSelectedTask(null)}
          className="text-gray-500 hover:text-gray-700"
        >
          <FiX size={24} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="font-semibold">Name:</label>
          <p>{selectedTask.requestedName}</p>
        </div>
        <div>
          <label className="font-semibold">Email:</label>
          <p>{selectedTask.email}</p>
        </div>
        <div>
          <label className="font-semibold">Project:</label>
          <p>{selectedTask.project}</p>
        </div>
        <div>
          <label className="font-semibold">Hours Requested:</label>
          <p>{selectedTask.hours}</p>
        </div>
        <div>
          <label className="font-semibold">Department:</label>
          <p>{selectedTask.department}</p>
        </div>
        <div>
          <label className="font-semibold">Requester:</label>
          <p>{selectedTask.requester}</p>
        </div>
        <div>
          <label className="font-semibold">Notes:</label>
          <p>{selectedTask.Notes}</p>
        </div>
        <div>
          <label className="font-semibold">Status:</label>
          <p>{selectedTask.status}</p>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-4">
          {selectedTask.status === "Approved"
            ? "Edit Approved Task"
            : "Approve/Reject Task"}
        </h3>
        <div className="flex flex-col gap-4 min-h-[200px]">
          {weekHours.map((day, index) => (
            <div
              key={`${day.day}-${index}`}
              className="flex items-center gap-4 group"
            >
              <div className="flex-1">
                <label className="font-semibold">{day.day}:</label>
                <DateTimePicker
                  onChange={(date) => handleDateChange(index, date)}
                  value={day.date}
                  format="yyyy-MM-dd"
                  className="w-full p-2 border rounded"
                  disabled={selectedTask.status === "Approved" && day.date}
                />
              </div>
              <div className="flex-1">
                <label className="font-semibold">Hours:</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="0"
                    max="8"
                    value={day.hours}
                    onChange={(e) =>
                      handleHoursChange(index, Number(e.target.value))
                    }
                    className="w-full p-2 border rounded"
                  />
                  {selectedTask.status === "Approved" && day.date && (
                    <button
                      onClick={() => {
                        // Ensure we're passing a Date object
                        const dateToDelete =
                          day.date instanceof Date
                            ? day.date
                            : new Date(day.date);
                        handleDeleteDate(dateToDelete);
                      }}
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

          {(selectedTask.status === "Rejected" ||
            selectedTask.status === "Pending") && (
            <div>
              <label className="font-semibold">Comment (for rejection):</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full p-2 border rounded"
                rows="3"
                required
              />
            </div>
          )}

          <div className="flex gap-4">
            {selectedTask.status === "Pending" ? (
              <>
                <button
                  onClick={handleApprove}
                  className="bg-[#3b0764] text-white px-4 py-2 rounded hover:bg-green-600"
                >
                  <FiCheckCircle /> Approve
                </button>
                <button
                  onClick={handleReject}
                  className="bg-[#bef264] text- px-4 py-2 rounded hover:bg-red-600"
                >
                  <FiXCircle /> Reject
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleUpdateTask}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  <FiEdit /> Update
                </button>
                <button
                  onClick={() => setSelectedTask(null)}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                  <FiX /> Close
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailsPanel;

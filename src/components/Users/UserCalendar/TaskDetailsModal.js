import React from "react";
import { FiX } from "react-icons/fi";

const DetailItem = ({ label, value }) => (
  <div className="flex flex-col gap-1">
    <span className="text-sm font-medium text-gray-500">{label}:</span>
    <span className="text-gray-900">{value || "N/A"}</span>
  </div>
);

export const TaskDetailsModal = ({ task, onClose }) => {
  if (!task) return null;

  const getDepartmentColor = (department) => {
    switch (department?.toLowerCase()) {
      case "leed":
        return "bg-[#a8499c] text-white";
      case "bim":
        return "bg-[#c8db00] text-gray-900";
      case "mep":
        return "bg-[#818181] text-white";
      default:
        return "bg-gray-200 text-gray-800";
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Task Details</h2>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700"
          >
            <FiX size={24} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
          <DetailItem label="Task" value={task.Task} />
          <DetailItem label="Assignee" value={task.requestedName} />
          <DetailItem label="Project" value={task.project} />
          
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium text-gray-500">Department:</span>
            <span className={`px-2 py-1 rounded-full text-sm w-fit ${getDepartmentColor(task.department)}`}>
              {task.department || "N/A"}
            </span>
          </div>
          
          <DetailItem label="Hours" value={task.hours} />
          
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium text-gray-500">Status:</span>
            <span className={`px-2 py-1 rounded-full text-sm w-fit ${getStatusColor(task.status)}`}>
              {task.status || "N/A"}
            </span>
          </div>
          
          <DetailItem 
            label="Start" 
            value={task.start?.toLocaleString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          />
          
          <DetailItem 
            label="End" 
            value={task.end?.toLocaleString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          />
          
          {task.description && (
            <div className="col-span-1 md:col-span-2 flex flex-col gap-1">
              <span className="text-sm font-medium text-gray-500">Description:</span>
              <p className="text-gray-700 mt-1">{task.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskDetailsModal;
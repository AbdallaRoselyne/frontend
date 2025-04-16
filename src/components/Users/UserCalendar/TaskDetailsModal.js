import React from "react";
import { FiX } from "react-icons/fi";

export const TaskDetailsModal = ({ task, onClose }) => {
  if (!task) return null;

  const getDepartmentColor = (department) => {
    switch (department?.toLowerCase()) {
      case "leed":
        return "bg-purple-100 text-purple-800";
      case "bim":
        return "bg-emerald-100 text-emerald-800";
      case "mep":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
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
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">Task Details</h2>
          <button onClick={onClose} className="modal-close">
            <FiX />
          </button>
        </div>

        <div className="detail-grid">
          <DetailItem label="Task" value={task.Task} />
          <DetailItem label="Assignee" value={task.requestedName} />
          <DetailItem label="Project" value={task.project} />
          
          <div className="detail-item">
            <span className="detail-label">Department:</span>
            <span className={`detail-value ${getDepartmentColor(task.department)} px-2 py-1 rounded-full text-sm`}>
              {task.department || "N/A"}
            </span>
          </div>
          
          <DetailItem label="Hours" value={task.hours} />
          
          <div className="detail-item">
            <span className="detail-label">Status:</span>
            <span className={`detail-value ${getStatusColor(task.status)} px-2 py-1 rounded-full text-sm`}>
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
            <div className="detail-item col-span-2">
              <span className="detail-label">Description:</span>
              <p className="detail-value text-gray-700 mt-1">{task.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const DetailItem = ({ label, value }) => (
  <div className="detail-item">
    <span className="detail-label">{label}:</span>
    <span className="detail-value">{value || "N/A"}</span>
  </div>
);

export default TaskDetailsModal;
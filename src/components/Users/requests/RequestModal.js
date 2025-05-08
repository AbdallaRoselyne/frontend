import React from "react";
import { FiX } from "react-icons/fi";
import RequestForm from "./RequestForm";

const RequestModal = ({
  showModal,
  resetForm,
  editMode,
  requestData,
  handleChange,
  handleSubmit,
  members,
  projects,
  selectedTask,
  setSelectedTask,
}) => {
  if (!showModal && !selectedTask) return null;

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white z-10">
          <h2 className="text-xl font-semibold text-[#a8499c]">
            {selectedTask
              ? "Request Details"
              : editMode
              ? "Edit Request"
              : "New Resource Request"}
          </h2>
          <button
            onClick={selectedTask ? () => setSelectedTask(null) : resetForm}
            className="text-[#818181] hover:text-[#a8499c] p-1 rounded-full hover:bg-gray-100"
          >
            <FiX className="text-xl" />
          </button>
        </div>

        <div className="p-6">
          {selectedTask ? (
            <div className="space-y-4">
              <DetailItem label="Name" value={selectedTask.requestedName} />
              <DetailItem label="Email" value={selectedTask.email} />
              <DetailItem
                label="Project Code"
                value={selectedTask.projectCode}
              />
              <DetailItem label="Project" value={selectedTask.project} />
              <DetailItem label="Department" value={selectedTask.department} />
              <DetailItem label="Hours" value={selectedTask.hours} />
              <DetailItem label="Requester" value={selectedTask.requester} />
              <DetailItem label="Task" value={selectedTask.Task} />
              <DetailItem label="Notes" value={selectedTask.Notes} />
            </div>
          ) : (
            <RequestForm
              requestData={requestData}
              handleChange={handleChange}
              members={members}
              projects={projects}
              editMode={editMode}
              onSubmit={handleSubmit}
            />
          )}
        </div>
      </div>
    </div>
  );
};

const DetailItem = ({ label, value }) => (
  <div>
    <h3 className="text-sm font-medium text-[#818181]">{label}</h3>
    <p className="mt-1 text-gray-900">{value || "-"}</p>
  </div>
);

export default RequestModal;

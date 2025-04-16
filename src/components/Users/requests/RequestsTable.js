import React from "react";
import { FiEdit, FiTrash2 } from "react-icons/fi";

const RequestsTable = ({
  filteredMembers,
  filterText,
  setFilterText,
  handleEdit,
  handleDelete,
  setSelectedTask
}) => {
  return (
    <div className="bg-white p-6 shadow rounded-lg mb-6">
      <h2 className="text-lg font-semibold mb-4">Requested Resources</h2>
      <input
        type="text"
        placeholder="Filter by name, project code, or department"
        value={filterText}
        onChange={(e) => setFilterText(e.target.value)}
        className="w-full p-3 border border-gray-200 rounded-lg mb-4 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
      />
      
      {filteredMembers.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 text-lg">No resources requested yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 text-left text-gray-600 font-medium">
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Project</th>
                <th className="p-3">Department</th>
                <th className="p-3">Hours</th>
                <th className="p-3">Requester</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredMembers.map((member) => (
                <tr 
                  key={member._id} 
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedTask(member)}
                >
                  <td className="p-3">{member.requestedName}</td>
                  <td className="p-3 text-gray-500">{member.email}</td>
                  <td className="p-3">
                    <span className="font-medium">{member.projectCode}</span>
                    <p className="text-sm text-gray-500">{member.project}</p>
                  </td>
                  <td className="p-3">{member.department}</td>
                  <td className="p-3 font-medium">{member.hours}</td>
                  <td className="p-3">{member.requester}</td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(member);
                        }}
                        className="p-2 rounded-lg hover:bg-gray-100 text-green-600"
                        aria-label="Edit"
                      >
                        <FiEdit />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(member._id);
                        }}
                        className="p-2 rounded-lg hover:bg-gray-100 text-red-600"
                        aria-label="Delete"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RequestsTable;
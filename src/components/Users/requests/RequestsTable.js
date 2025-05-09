import React from "react";
import { FiEdit, FiTrash2, FiSearch } from "react-icons/fi";

const RequestsTable = ({
  filteredMembers,
  filterText,
  setFilterText,
  handleEdit,
  handleDelete,
  setSelectedTask,
}) => {
  // Department color mapping using Pantone colors
  const getDepartmentColor = (department) => {
    switch (department?.toLowerCase()) {
      case "leed":
        return "bg-[#a8499c]/10 text-[#a8499c]";
      case "bim":
        return "bg-[#c8db00]/10 text-[#c8db00]";
      case "mep":
        return "bg-[#818181]/10 text-[#818181]";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="bg-white p-6 shadow rounded-lg border border-[#818181]/20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Requested Resources
        </h2>
        <div className="relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="text-[#818181]" />
          </div>
          <input
            type="text"
            placeholder="Filter by name, project or department..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-[#818181]/30 rounded-lg focus:ring-2 focus:ring-[#a8499c]/50 focus:border-transparent"
          />
        </div>
      </div>

      {filteredMembers.length === 0 ? (
        <div className="text-center py-12 border-t border-[#818181]/10">
          <p className="text-[#818181] text-lg">No matching resources found</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#818181]/5 text-left text-[#818181] font-medium text-sm uppercase tracking-wider">
                <th className="p-4">Resource</th>
                <th className="p-4">Project</th>
                <th className="p-4">Department</th>
                <th className="p-4">Hours</th>
                <th className="p-4">Requester</th>
                <th className="p-4">Task</th>
                <th className="p-4">Notes</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#818181]/10">
              {filteredMembers.map((member) => (
                <tr
                  key={member._id}
                  className="hover:bg-[#a8499c]/5 transition-colors cursor-pointer group"
                  onClick={() => setSelectedTask(member)}
                >
                  {/* Resource Column */}
                  <td className="p-4 break-words whitespace-normal max-w-xs">
                    <div className="font-medium text-gray-900 group-hover:text-[#a8499c] transition-colors">
                      {member.requestedName}
                    </div>
                    <div className="text-sm text-[#818181]">{member.email}</div>
                  </td>

                  {/* Project Column */}
                  <td className="p-4">
                    <div className="font-medium">{member.projectCode}</div>
                    <div className="text-sm text-[#818181] line-clamp-1">
                      {member.project}
                    </div>
                  </td>

                  {/* Department Column */}
                  <td className="p-4">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getDepartmentColor(
                        member.department
                      )}`}
                    >
                      {member.department || "Unassigned"}
                    </span>
                  </td>

                  {/* Hours Column */}
                  <td className="p-4 font-medium text-gray-900">
                    {member.hours}
                  </td>

                  {/* Requester Column */}
                  <td className="p-4 text-[#818181] text-sm">
                    {member.requester}
                  </td>
                  {/* Task Column */}
                  <td className="p-4 text-[#818181] text-sm break-words whitespace-normal max-w-xs">
                    {member.Task || "—"}
                  </td>

                  {/* Notes Column */}
                  <td className="p-4 break-words whitespace-normal max-w-xs">
                    <div className="text-sm text-[#818181] line-clamp-2 max-w-xs">
                      {member.Notes || "—"}
                    </div>
                  </td>

                  {/* Actions Column */}
                  <td className="p-4">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(member);
                        }}
                        className="p-2 rounded-lg hover:bg-[#c8db00]/10 text-[#c8db00] hover:text-[#a8499c] transition-colors"
                        aria-label="Edit"
                      >
                        <FiEdit />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(member._id);
                        }}
                        className="p-2 rounded-lg hover:bg-[#818181]/10 text-[#818181] hover:text-red-500 transition-colors"
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

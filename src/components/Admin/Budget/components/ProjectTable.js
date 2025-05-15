import React from "react";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import FilterControls from "./FilterControls";

const ProjectTable = ({ 
  projects, 
  loading, 
  onEdit, 
  onDelete, 
  onSelect,  // Make sure this prop is received
  filterCriteria,
  filter,
  onFilterChange,
  onFilterCriteriaChange
}) => {
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-lg font-semibold text-gray-900">Project Budgets</h2>
        <FilterControls 
          filter={filter}
          filterCriteria={filterCriteria}
          onFilterChange={onFilterChange}
          onFilterCriteriaChange={onFilterCriteriaChange}
        />
      </div>

      {loading ? (
        <div className="p-8 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Budget</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hours</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {projects.map((project) => (
                <tr key={project._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {project.code}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => onSelect(project)}  
                      className="text-left"
                    >
                      <div className="text-sm font-medium text-indigo-600 hover:text-indigo-800">
                        {project.name}
                      </div>
                      <div className="text-sm text-gray-500">{project.teamLeader}</div>
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${project.department === 'LEED' ? 'bg-purple-100 text-purple-800' : 
                        project.department === 'BIM' ? 'bg-green-100 text-green-800' : 
                        'bg-blue-100 text-blue-800'}`}>
                      {project.department}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">${parseFloat(project.budget).toLocaleString()}</div>
                    <div className="text-xs text-gray-500">
                      {((project.budgetSpent / project.budget) * 100 || 0).toFixed(1)}% spent
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{project.hours}</div>
                    <div className="text-xs text-gray-500">
                      {((project.hoursLogged / project.hours) * 100 || 0).toFixed(1)}% logged
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-indigo-600 h-2.5 rounded-full" 
                        style={{ width: `${Math.max(
                          ((project.budgetSpent / project.budget) * 100 || 0),
                          ((project.hoursLogged / project.hours) * 100 || 0)
                        )}%` }}
                      ></div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => onEdit(project)}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      <FiEdit2 />
                    </button>
                    <button
                      onClick={() => onDelete(project._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <FiTrash2 />
                    </button>
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

export default ProjectTable;
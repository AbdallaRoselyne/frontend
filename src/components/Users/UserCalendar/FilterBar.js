import React from "react";
import { FiFilter, FiX } from "react-icons/fi";
import PropTypes from 'prop-types';

export const FilterBar = ({ filters = {}, setFilters, clearFilters }) => {
  const departments = ["LEED", "BIM", "MEP", "Other"];

  const safeFilters = {
    requestedName: filters.requestedName || '',
    project: filters.project || '',
    projectCode: filters.projectCode || '',
    date: filters.date || '',
    department: filters.department || ''
  };

  const handleClearFilters = () => {
    clearFilters();
  };

  return (
    <div className="p-4 bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <FiFilter className="text-[#a8499c]" />
        <h3 className="text-gray-900 font-semibold">Filters</h3>
        <button 
          onClick={handleClearFilters} 
          className="ml-auto flex items-center gap-1 text-gray-500 hover:text-[#a8499c] transition-colors"
        >
          <FiX /> Clear all
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-500">Assignee</label>
          <input
            type="text"
            placeholder="Search by name"
            value={safeFilters.requestedName}
            onChange={(e) => setFilters({ ...filters, requestedName: e.target.value })}
            className="p-2 border border-gray-200 rounded-md text-sm focus:border-[#a8499c] focus:ring-1 focus:ring-[#a8499c]"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-500">Project</label>
          <input
            type="text"
            placeholder="Search by project"
            value={safeFilters.project}
            onChange={(e) => setFilters({ ...filters, project: e.target.value })}
            className="p-2 border border-gray-200 rounded-md text-sm focus:border-[#a8499c] focus:ring-1 focus:ring-[#a8499c]"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-500">Project Code</label>
          <input
            type="text"
            placeholder="Search by code"
            value={safeFilters.projectCode}
            onChange={(e) => setFilters({ ...filters, projectCode: e.target.value })}
            className="p-2 border border-gray-200 rounded-md text-sm focus:border-[#a8499c] focus:ring-1 focus:ring-[#a8499c]"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-500">Date</label>
          <input
            type="date"
            value={safeFilters.date}
            onChange={(e) => setFilters({ ...filters, date: e.target.value })}
            className="p-2 border border-gray-200 rounded-md text-sm focus:border-[#a8499c] focus:ring-1 focus:ring-[#a8499c]"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-500">Department</label>
          <select
            value={safeFilters.department}
            onChange={(e) => setFilters({ ...filters, department: e.target.value })}
            className="p-2 border border-gray-200 rounded-md text-sm focus:border-[#a8499c] focus:ring-1 focus:ring-[#a8499c]"
          >
            <option value="">All Departments</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

FilterBar.propTypes = {
  filters: PropTypes.shape({
    requestedName: PropTypes.string,
    project: PropTypes.string,
    projectCode: PropTypes.string,
    date: PropTypes.string,
    department: PropTypes.string
  }),
  setFilters: PropTypes.func.isRequired,
  clearFilters: PropTypes.func.isRequired
};

FilterBar.defaultProps = {
  filters: {
    requestedName: '',
    project: '',
    projectCode: '',
    date: '',
    department: ''
  }
};

export default FilterBar;
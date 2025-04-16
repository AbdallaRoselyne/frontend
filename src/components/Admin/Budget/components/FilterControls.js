// components/FilterControls.js
import React from "react";
import { FiFilter } from "react-icons/fi";

// Changed to default export
export default function FilterControls({ 
  filter, 
  filterCriteria, 
  onFilterChange, 
  onFilterCriteriaChange 
}) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
      <div className="relative flex-grow sm:w-48">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <FiFilter className="text-gray-400" />
        </div>
        <select
          value={filterCriteria}
          onChange={onFilterCriteriaChange}
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        >
          <option value="name">Project Name</option>
          <option value="code">Project Code</option>
          <option value="department">Department</option>
          <option value="teamLeader">Team Leader</option>
          <option value="director">Director</option>
          <option value="stage">Stage</option>
        </select>
      </div>
      
      <div className="relative flex-grow">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <FiFilter className="text-gray-400" />
        </div>
        <input
          type="text"
          placeholder={`Filter by ${filterCriteria}`}
          value={filter}
          onChange={onFilterChange}
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>
    </div>
  );
}


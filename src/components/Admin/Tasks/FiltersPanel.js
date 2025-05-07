import React from "react";
import { FiX } from "react-icons/fi";

const FiltersPanel = ({ filters, setFilters }) => (
  <div className="bg-white p-4 rounded-lg shadow border border-gray-200 mb-6">
    <div className="flex flex-wrap gap-4 items-end">
      <div className="flex-1 min-w-[200px]">
        <label className="block text-sm font-medium mb-1 text-gray-700">Filter by Assignee</label>
        <input
          type="text"
          placeholder="Search assignees..."
          value={filters.requestedName}
          onChange={(e) => setFilters({ ...filters, requestedName: e.target.value })}
          className="w-full p-2 border border-gray-300 rounded"
        />
      </div>
      <div className="flex-1 min-w-[200px]">
        <label className="block text-sm font-medium mb-1 text-gray-700">Filter by Project</label>
        <input
          type="text"
          placeholder="Search projects..."
          value={filters.project}
          onChange={(e) => setFilters({ ...filters, project: e.target.value })}
          className="w-full p-2 border border-gray-300 rounded"
        />
      </div>
      <div className="flex-1 min-w-[200px]">
        <label className="block text-sm font-medium mb-1 text-gray-700">Filter by Date</label>
        <input
          type="date"
          value={filters.date}
          onChange={(e) => setFilters({ ...filters, date: e.target.value })}
          className="w-full p-2 border border-gray-300 rounded"
        />
      </div>
      <button
        onClick={() => setFilters({
          requestedName: "",
          project: "",
          date: ""
        })}
        className="bg-[#818181] text-white px-4 py-2 rounded hover:bg-[#6a6a6a] flex items-center gap-2"
      >
        <FiX /> Clear Filters
      </button>
    </div>
  </div>
);

export default FiltersPanel;
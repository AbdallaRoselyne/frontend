import React from "react";

const CalendarFilters = ({ filters, setFilters }) => {
  const handleDateChange = (e) => {
    setFilters({ ...filters, date: e.target.value });
  };

  return (
    <div className="bg-white p-4 shadow rounded-xl border border-[#818181] mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-[#a8499c]">Filters</h2>
        <button
          onClick={() => setFilters({
            requestedName: "",
            project: "",
            projectCode: "",
            date: ""
          })}
          className="text-sm text-[#a8499c] hover:text-[#8a3a7f] flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
          </svg>
          Reset
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        <div>
          <label htmlFor="assignee" className="block text-sm font-medium text-[#818181] mb-1">Assignee</label>
          <input
            id="assignee"
            type="text"
            placeholder="Filter by name"
            value={filters.requestedName}
            onChange={(e) => setFilters({ ...filters, requestedName: e.target.value })}
            className="border border-[#818181] p-2 rounded-lg w-full focus:ring-[#a8499c] focus:border-[#a8499c]"
          />
        </div>
        <div>
          <label htmlFor="project" className="block text-sm font-medium text-[#818181] mb-1">Project</label>
          <input
            id="project"
            type="text"
            placeholder="Filter by project"
            value={filters.project}
            onChange={(e) => setFilters({ ...filters, project: e.target.value })}
            className="border border-[#818181] p-2 rounded-lg w-full focus:ring-[#a8499c] focus:border-[#a8499c]"
          />
        </div>
        <div>
          <label htmlFor="projectCode" className="block text-sm font-medium text-[#818181] mb-1">Project Code</label>
          <input
            id="projectCode"
            type="text"
            placeholder="Filter by code"
            value={filters.projectCode}
            onChange={(e) => setFilters({ ...filters, projectCode: e.target.value })}
            className="border border-[#818181] p-2 rounded-lg w-full focus:ring-[#a8499c] focus:border-[#a8499c]"
          />
        </div>
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-[#818181] mb-1">Jump to Date</label>
          <input
            id="date"
            type="date"
            value={filters.date}
            onChange={handleDateChange}
            className="border border-[#818181] p-2 rounded-lg w-full focus:ring-[#a8499c] focus:border-[#a8499c]"
          />
        </div>
      </div>
    </div>
  );
};

export default CalendarFilters;
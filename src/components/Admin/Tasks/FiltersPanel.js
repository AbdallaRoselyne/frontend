import React from "react";
import { FiFilter } from "react-icons/fi";

const FiltersPanel = ({ filters, setFilters }) => (
  <div className="bg-white p-6 shadow rounded-lg mb-6">
    <h2 className="text-lg font-semibold mb-4">Filters</h2>
    <div className="flex gap-4">
      <input
        type="text"
        placeholder="Filter by Assignee"
        value={filters.requestedName}
        onChange={(e) =>
          setFilters({ ...filters, requestedName: e.target.value })
        }
        className="border p-2 rounded"
      />
      <input
        type="text"
        placeholder="Filter by Project"
        value={filters.project}
        onChange={(e) =>
          setFilters({ ...filters, project: e.target.value })
        }
        className="border p-2 rounded"
      />
      <input
        type="date"
        value={filters.date}
        onChange={(e) => setFilters({ ...filters, date: e.target.value })}
        className="border p-2 rounded"
      />
      <button
        onClick={() =>
          setFilters({ requestedName: "", project: "", date: "" })
        }
        className="bg-[#3b0764] text-white px-4 py-2 rounded hover:bg-[#4c0a86]"
      >
        <FiFilter /> Clear Filters
      </button>
    </div>
  </div>
);

export default FiltersPanel;
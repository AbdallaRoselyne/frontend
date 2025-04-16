import React from 'react';
import { FiSearch, FiFilter, FiCalendar } from 'react-icons/fi';

const TaskFilters = ({ filters, setFilters }) => {
  return (
    <div className="filter-bar">
      <div className="search-box">
        <FiSearch className="search-icon" />
        <input
          type="text"
          placeholder="Search tasks, projects..."
          value={filters.search}
          onChange={(e) => setFilters({...filters, search: e.target.value.toLowerCase()})}
        />
      </div>

      <div className="filter-group">
        <div className="filter-select-wrapper">
          <FiFilter className="filter-icon" />
          <select
            value={filters.status}
            onChange={(e) => setFilters({...filters, status: e.target.value})}
            className="filter-select"
          >
            <option value="all">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        <div className="filter-select-wrapper">
          <FiCalendar className="filter-icon" />
          <select
            value={filters.timeRange}
            onChange={(e) => setFilters({...filters, timeRange: e.target.value})}
            className="filter-select"
          >
            <option value="all">All Time</option>
            <option value="week">This Week</option>
            <option value="today">Today</option>
          </select>
        </div>
      </div>
    </div>
  );
};


import React from "react";
import { FiFilter, FiX } from "react-icons/fi";
import PropTypes from 'prop-types';

export const FilterBar = ({ filters = {}, setFilters, clearFilters }) => {
  const departments = ["LEED", "BIM", "MEP", "Other"];

  // Safely initialize all filter values
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
    <div className="filter-container">
      <div className="filter-header">
        <FiFilter className="filter-icon" />
        <h3>Filters</h3>
        <button onClick={handleClearFilters} className="clear-all">
          <FiX /> Clear all
        </button>
      </div>

      <div className="filter-grid">
        <div className="filter-group">
          <label>Assignee</label>
          <input
            type="text"
            placeholder="Search by name"
            value={safeFilters.requestedName}
            onChange={(e) =>
              setFilters({ ...filters, requestedName: e.target.value })
            }
            className="filter-input"
          />
        </div>

        <div className="filter-group">
          <label>Project</label>
          <input
            type="text"
            placeholder="Search by project"
            value={safeFilters.project}
            onChange={(e) => setFilters({ ...filters, project: e.target.value })}
            className="filter-input"
          />
        </div>

        <div className="filter-group">
          <label>Project Code</label>
          <input
            type="text"
            placeholder="Search by code"
            value={safeFilters.projectCode}
            onChange={(e) =>
              setFilters({ ...filters, projectCode: e.target.value })
            }
            className="filter-input"
          />
        </div>

        <div className="filter-group">
          <label>Date</label>
          <input
            type="date"
            value={safeFilters.date}
            onChange={(e) => setFilters({ ...filters, date: e.target.value })}
            className="filter-input"
          />
        </div>

        <div className="filter-group">
          <label>Department</label>
          <select
            value={safeFilters.department}
            onChange={(e) =>
              setFilters({ ...filters, department: e.target.value })
            }
            className="filter-select"
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
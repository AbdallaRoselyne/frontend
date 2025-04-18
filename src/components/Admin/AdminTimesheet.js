import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  Table,
  Spin,
  DatePicker,
  Button,
  message,
  Alert,
  Input,
  Select,
  Space,
  Tag,
} from "antd";
import { FiDownload, FiFilter, FiSearch } from "react-icons/fi";
import "./Timesheet.css";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

const { RangePicker } = DatePicker;
const { Option } = Select;

const AdminTimesheet = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState([]);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    userEmail: "",
    project: "",
    status: "",
    searchText: "",
  });

  // Get unique values for filter dropdowns
  const uniqueEmails = [...new Set(data.map((item) => item.userEmail))];
  const uniqueProjects = [...new Set(data.map((item) => item.project))];

  const fetchAllCompletedTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {};

      // Safe date range access
      if (dateRange && dateRange[0] && dateRange[1]) {
        params.startDate = dateRange[0].toISOString();
        params.endDate = dateRange[1].toISOString();
      }

      const response = await axios.get(`${API_BASE_URL}/api/completions/all`, {
        params,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const responseData = Array.isArray(response.data)
        ? response.data
        : response.data?.data || [];

      if (!Array.isArray(responseData)) {
        throw new Error("Invalid data format received from server");
      }

      setData(responseData);
      setFilteredData(responseData);
    } catch (error) {
      console.error("Fetch error:", error);
      if (error.response?.status === 401) {
        message.error("Session expired. Please login again.");
      }
      setError(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch timesheet data"
      );
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  const applyFilters = useCallback(() => {
    let result = [...data];

    if (filters.userEmail) {
      result = result.filter((item) =>
        item.userEmail.toLowerCase().includes(filters.userEmail.toLowerCase())
      );
    }

    if (filters.project) {
      result = result.filter((item) =>
        item.project.toLowerCase().includes(filters.project.toLowerCase())
      );
    }

    if (filters.status) {
      result = result.filter((item) =>
        filters.status === "locked" ? item.locked : !item.locked
      );
    }

    if (filters.searchText) {
      const searchText = filters.searchText.toLowerCase();
      result = result.filter(
        (item) =>
          item.taskTitle.toLowerCase().includes(searchText) ||
          (item.userEmail &&
            item.userEmail.toLowerCase().includes(searchText)) ||
          (item.project && item.project.toLowerCase().includes(searchText))
      );
    }

    setFilteredData(result);
  }, [data, filters]);

  useEffect(() => {
    fetchAllCompletedTasks();
  }, [dateRange, fetchAllCompletedTasks]);

  useEffect(() => {
    applyFilters();
  }, [filters, data, applyFilters]);

  const columns = [
    {
      title: "User",
      dataIndex: "userEmail",
      key: "userEmail",
      render: (email) => <Tag color="blue">{email}</Tag>,
      sorter: (a, b) => a.userEmail.localeCompare(b.userEmail),
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      render: (date) => new Date(date).toLocaleDateString(),
      sorter: (a, b) => new Date(a.date) - new Date(b.date),
    },
    {
      title: "Project",
      dataIndex: "project",
      key: "project",
      render: (project) => <Tag color="geekblue">{project}</Tag>,
      sorter: (a, b) => a.project.localeCompare(b.project),
    },
    {
      title: "Task",
      dataIndex: "taskTitle",
      key: "taskTitle",
    },
    {
      title: "Hours",
      dataIndex: "actualHours",
      key: "actualHours",
      sorter: (a, b) => a.actualHours - b.actualHours,
    },
    {
      title: "Status",
      dataIndex: "locked",
      key: "locked",
      render: (locked) => (
        <Tag color={locked ? "green" : "orange"}>
          {locked ? "Locked" : "Editable"}
        </Tag>
      ),
    },
  ];

  const exportToCSV = () => {
    if (filteredData.length === 0) {
      message.error("No data to export");
      return;
    }

    const headers = ["User", "Date", "Project", "Task", "Hours", "Status"];
    const csvContent = [
      headers.join(","),
      ...filteredData.map((item) =>
        [
          `"${item.userEmail}"`,
          new Date(item.date).toLocaleDateString(),
          `"${item.project}"`,
          `"${item.taskTitle}"`,
          item.actualHours,
          item.locked ? "Locked" : "Editable",
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `admin-timesheet-${
      new Date().toISOString().split("T")[0]
    }.csv`;
    link.click();
  };

  if (error) {
    return (
      <div className="timesheet-container">
        <Alert message="Error" description={error} type="error" showIcon />
        <Button
          type="primary"
          onClick={fetchAllCompletedTasks}
          style={{ marginTop: 16 }}
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="timesheet-container">
      <div className="timesheet-header">
        <h2>Admin Timesheet Dashboard</h2>
        <div className="timesheet-controls">
          <RangePicker
            onChange={(dates) => setDateRange(dates || [])}
            style={{ marginRight: 16 }}
            value={dateRange.length ? dateRange : null}
          />
          <Button
            type="primary"
            icon={<FiDownload />}
            onClick={exportToCSV}
            disabled={filteredData.length === 0}
          >
            Export
          </Button>
        </div>
      </div>

      <div className="admin-filters">
        <Space size="middle" style={{ marginBottom: 16 }}>
          <Input
            placeholder="Search tasks..."
            prefix={<FiSearch />}
            value={filters.searchText}
            onChange={(e) =>
              setFilters({ ...filters, searchText: e.target.value })
            }
            style={{ width: 200 }}
          />

          <Select
            placeholder="Filter by user"
            style={{ width: 200 }}
            allowClear
            onChange={(value) => setFilters({ ...filters, userEmail: value })}
          >
            {uniqueEmails.map((email) => (
              <Option key={email} value={email}>
                {email}
              </Option>
            ))}
          </Select>

          <Select
            placeholder="Filter by project"
            style={{ width: 200 }}
            allowClear
            onChange={(value) => setFilters({ ...filters, project: value })}
          >
            {uniqueProjects.map((project) => (
              <Option key={project} value={project}>
                {project}
              </Option>
            ))}
          </Select>

          <Select
            placeholder="Filter by status"
            style={{ width: 150 }}
            allowClear
            onChange={(value) => setFilters({ ...filters, status: value })}
          >
            <Option value="locked">Locked</Option>
            <Option value="unlocked">Editable</Option>
          </Select>

          <Button icon={<FiFilter />} onClick={applyFilters}>
            Apply Filters
          </Button>
        </Space>
      </div>

      <div className="timesheet-summary">
        <div className="summary-card">
          <h3>Total Entries</h3>
          <p>{filteredData.length}</p>
        </div>
        <div className="summary-card">
          <h3>Total Hours</h3>
          <p>
            {filteredData.reduce(
              (sum, item) => sum + (Number(item.actualHours) || 0),
              0
            )}
          </p>
        </div>
        <div className="summary-card">
          <h3>Unique Users</h3>
          <p>
            {[...new Set(filteredData.map((item) => item.userEmail))].length}
          </p>
        </div>
      </div>

      <Spin spinning={loading}>
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="_id"
          pagination={{ pageSize: 10 }}
          locale={{
            emptyText: loading
              ? "Loading timesheet data..."
              : "No timesheet data available",
          }}
        />
      </Spin>
    </div>
  );
};

export default AdminTimesheet;

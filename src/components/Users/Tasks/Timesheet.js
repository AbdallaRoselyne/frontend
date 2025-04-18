import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Table, Spin, DatePicker, Button, message, Alert } from 'antd';
import { FiLock, FiDownload } from 'react-icons/fi';
import { jwtDecode } from 'jwt-decode';
import { toast } from 'react-toastify';
import './Timesheet.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

const UserTimesheet = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState([null, null]);
  const [totalHours, setTotalHours] = useState(0);
  const [error, setError] = useState(null);
  const [userEmail, setUserEmail] = useState(null);

  const getEmailFromToken = useCallback(() => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      const decoded = jwtDecode(token);
      console.log("Decoded token:", decoded);

      if (!decoded.email) throw new Error("Email not found in token");
      return decoded.email.toLowerCase();
    } catch (error) {
      console.error("Token decoding error:", error);
      toast.error("Authentication error. Please login again.");
      localStorage.removeItem("token");
      window.location.href = "/login";
      throw error;
    }
  }, []);

  const fetchTimesheetData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const email = getEmailFromToken();
      setUserEmail(email);
      
      const params = { userEmail: email };
      
      if (dateRange[0] && dateRange[1]) {
        params.startDate = dateRange[0].toISOString();
        params.endDate = dateRange[1].toISOString();
      }
  
      const response = await axios.get(`${API_BASE_URL}/api/completions`, { 
        params,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });
      
      const responseData = response.data?.data || response.data || [];
      
      if (!Array.isArray(responseData)) {
        throw new Error('Invalid data format received from server');
      }
      
      setData(responseData);
      const hours = responseData.reduce((sum, item) => sum + (item.actualHours || 0), 0);
      setTotalHours(hours);
    } catch (error) {
      console.error('Fetch error:', error);
      if (error.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
      setError(error.response?.data?.message || error.message || 'Failed to fetch timesheet data');
    } finally {
      setLoading(false);
    }
  }, [dateRange, getEmailFromToken]);

  useEffect(() => {
    fetchTimesheetData();
  }, [dateRange, fetchTimesheetData]);

  const columns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: date => new Date(date).toLocaleDateString(),
      sorter: (a, b) => new Date(a.date) - new Date(b.date),
    },
    {
      title: 'Project',
      dataIndex: 'project',
      key: 'project',
    },
    {
      title: 'Task',
      dataIndex: 'taskTitle',
      key: 'taskTitle',
    },
    {
      title: 'Hours',
      dataIndex: 'actualHours',
      key: 'actualHours',
      sorter: (a, b) => a.actualHours - b.actualHours,
    },
    {
      title: 'Status',
      dataIndex: 'locked',
      key: 'locked',
      render: locked => (
        <span style={{ color: locked ? '#52c41a' : '#faad14' }}>
          {locked ? (
            <>
              <FiLock /> Locked
            </>
          ) : (
            'Editable'
          )}
        </span>
      ),
    },
  ];

  const exportToCSV = () => {
    if (!userEmail) {
      message.error('Cannot export - authentication required');
      return;
    }

    const headers = ['Date', 'Project', 'Task', 'Hours', 'Status'];
    const csvContent = [
      headers.join(','),
      ...data.map(item => [
        new Date(item.date).toLocaleDateString(),
        `"${item.project}"`,
        `"${item.taskTitle}"`,
        item.actualHours,
        item.locked ? 'Locked' : 'Editable'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `timesheet-${userEmail}-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  if (error) {
    return (
      <div className="timesheet-container">
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
        />
        <Button 
          type="primary" 
          onClick={fetchTimesheetData}
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
        <h2>My Timesheet</h2>
        <div className="timesheet-controls">
          <DatePicker.RangePicker
            onChange={dates => setDateRange(dates)}
            style={{ marginRight: 16 }}
          />
          <Button 
            type="primary" 
            icon={<FiDownload />} 
            onClick={exportToCSV}
            disabled={data.length === 0 || !userEmail}
          >
            Export
          </Button>
        </div>
      </div>

      <div className="timesheet-summary">
        <div className="summary-card">
          <h3>Total Hours</h3>
          <p>{totalHours}</p>
        </div>
        <div className="summary-card">
          <h3>Days Worked</h3>
          <p>{data.length}</p>
        </div>
        <div className="summary-card">
          <h3>Average Hours/Day</h3>
          <p>{data.length ? (totalHours / data.length).toFixed(2) : 0}</p>
        </div>
      </div>

      <Spin spinning={loading}>
        <Table
          columns={columns}
          dataSource={data}
          rowKey="_id"
          pagination={{ pageSize: 10 }}
          locale={{
            emptyText: loading ? 'Loading timesheet data...' : 'No timesheet data available'
          }}
        />
      </Spin>
    </div>
  );
};

export default UserTimesheet;
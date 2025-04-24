import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Table, Spin, DatePicker, Button, message, Alert } from 'antd';
import { FiLock, FiDownload } from 'react-icons/fi';
import { jwtDecode } from 'jwt-decode';
import { toast } from 'react-toastify';

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
        <span className={locked ? 'text-[#c8db00]' : 'text-yellow-500'}>
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
      <div className="p-5 max-w-6xl mx-auto">
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
        />
        <Button 
          type="primary" 
          onClick={fetchTimesheetData}
          className="mt-4 bg-[#a8499c] hover:bg-[#c8db00]"
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="p-5 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-5 flex-wrap gap-4">
        <h2 className="text-2xl font-bold text-[#a8499c]">My Timesheet</h2>
        <div className="flex items-center gap-2">
          <DatePicker.RangePicker
            onChange={dates => setDateRange(dates)}
            className="mr-4"
          />
          <Button 
            type="primary" 
            icon={<FiDownload />} 
            onClick={exportToCSV}
            disabled={data.length === 0 || !userEmail}
            className="bg-[#a8499c] hover:bg-[#818181] text-white"
          >
            Export
          </Button>
        </div>
      </div>

      <div className="flex gap-4 mb-5 flex-wrap">
        <div className="bg-gray-100 p-4 rounded-lg min-w-[150px]">
          <h3 className="m-0 mb-2 text-sm text-gray-600">Total Hours</h3>
          <p className="m-0 text-2xl font-bold text-[#a8499c]">{totalHours}</p>
        </div>
        <div className="bg-gray-100 p-4 rounded-lg min-w-[150px]">
          <h3 className="m-0 mb-2 text-sm text-gray-600">Days Worked</h3>
          <p className="m-0 text-2xl font-bold text-[#a8499c]">{data.length}</p>
        </div>
        <div className="bg-gray-100 p-4 rounded-lg min-w-[150px]">
          <h3 className="m-0 mb-2 text-sm text-gray-600">Average Hours/Day</h3>
          <p className="m-0 text-2xl font-bold text-[#a8499c]">{data.length ? (totalHours / data.length).toFixed(2) : 0}</p>
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
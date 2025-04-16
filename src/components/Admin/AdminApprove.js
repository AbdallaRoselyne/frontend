import React from "react";
import ApproveTaskRequests from "./Tasks/ApproveTaskRequests"; // Default import

const AdminApprove = () => {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-6">Admin Dashboard</h1>
      <ApproveTaskRequests />
    </div>
  );
};

export default AdminApprove;
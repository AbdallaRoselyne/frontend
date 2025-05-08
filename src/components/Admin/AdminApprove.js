import React from "react";
import ApproveTaskRequests from "./Tasks/ApproveTaskRequests";
import { Toaster } from "react-hot-toast";

const AdminApprove = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6">
        <Toaster position="top-right" />
        <h1 className="text-3xl font-bold text-[#a8499c] mb-8">
          Task Management Dashboard
        </h1>
        <ApproveTaskRequests />
      </div>
    </div>
  );
};

export default AdminApprove;

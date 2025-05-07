import React from "react";

const StatusBadge = ({ status }) => {
  const getStatusStyles = () => {
    switch (status) {
      case "Approved":
        return "bg-[#c8db00] text-gray-800";
      case "Rejected":
        return "bg-[#818181] text-white";
      case "Pending":
      default:
        return "bg-[#f3e6f1] text-[#a8499c]";
    }
  };

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusStyles()}`}
    >
      {status}
    </span>
  );
};

export default StatusBadge;
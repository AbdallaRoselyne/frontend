import React, { useState, useEffect } from "react";
import {
  FiUsers,
  FiClipboard,
  FiDollarSign,
  FiCalendar,
  FiMenu,
  FiX,
  FiClock,
} from "react-icons/fi";
import { Link } from "react-router-dom";

const AdminSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={toggleSidebar}
        className={`md:hidden fixed top-4 left-4 z-50 p-2 rounded-md ${
          isOpen ? "bg-[#a8499c]" : "bg-[#a8499c]"
        } text-white shadow-md hover:bg-[#8f3a8a] transition-colors`}
      >
        {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed md:relative z-40 w-64 h-screen bg-[#a8499c] text-white flex flex-col p-6 transition-all duration-300 ease-in-out ${
          isOpen ? "left-0" : "-left-full"
        } md:left-0`}
      >
        <div className="text-2xl font-bold mb-8">
          Pro<span className="text-[#c8db00]">Design</span>
        </div>

        <nav className="flex flex-col gap-2">
          <Link
            to="/admin/dashboard"
            className="flex items-center gap-3 p-3 hover:bg-[#8f3a8a] rounded-lg transition-colors"
            onClick={() => isMobile && setIsOpen(false)}
          >
            <FiCalendar className="text-xl" />
            <span>Calendar</span>
          </Link>
          <Link
            to="/admin/users"
            className="flex items-center gap-3 p-3 hover:bg-[#8f3a8a] rounded-lg transition-colors"
            onClick={() => isMobile && setIsOpen(false)}
          >
            <FiUsers className="text-xl" />
            <span>Manage Users & Teams</span>
          </Link>
          <Link
            to="/admin/tasks"
            className="flex items-center gap-3 p-3 hover:bg-[#8f3a8a] rounded-lg transition-colors"
            onClick={() => isMobile && setIsOpen(false)}
          >
            <FiClipboard className="text-xl" />
            <span>Approve Task Requests</span>
          </Link>
          <Link
            to="/admin/budget"
            className="flex items-center gap-3 p-3 hover:bg-[#8f3a8a] rounded-lg transition-colors"
            onClick={() => isMobile && setIsOpen(false)}
          >
            <FiDollarSign className="text-xl" />
            <span>Budget & Time Tracking</span>
          </Link>
          <Link
            to="/admin/timesheet"
            className="flex items-center gap-3 p-3 hover:bg-[#8f3a8a] rounded-lg transition-colors"
            onClick={() => isMobile && setIsOpen(false)}
          >
            <FiClock className="text-xl" />
            <span>Timesheet</span>
          </Link>
        </nav>
      </div>

      {/* Overlay for mobile */}
      {isOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={toggleSidebar}
        />
      )}
    </>
  );
};

export default AdminSidebar;

import React, { useState, useEffect } from "react";
import { FiUsers, FiClipboard, FiDollarSign, FiLogOut, FiCalendar, FiMenu, FiX, FiClock } from "react-icons/fi";
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
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-[#3b0764] text-white"
      >
        {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed md:relative z-40 w-64 h-screen bg-[#3b0764] text-white flex flex-col p-6 transition-all duration-300 ease-in-out ${
          isOpen ? "left-0" : "-left-full"
        } md:left-0`}
      >
        <div className="text-large font-bold mb-8">
          Pro<span className="text-[#bef264]">Design</span>
        </div>
        
        <nav className="flex flex-col gap-4">
          <Link 
            to="/admin/dashboard" 
            className="flex items-center gap-2 p-2 hover:bg-[#374151] rounded"
            onClick={() => isMobile && setIsOpen(false)}
          >
            <FiCalendar className="text-xl" /> Calendar
          </Link>
          <Link 
            to="/admin/users" 
            className="flex items-center gap-2 p-2 hover:bg-[#374151] rounded"
            onClick={() => isMobile && setIsOpen(false)}
          >
            <FiUsers className="text-xl" /> Manage Users & Teams
          </Link>
          <Link 
            to="/admin/tasks" 
            className="flex items-center gap-2 p-2 hover:bg-[#374151] rounded"
            onClick={() => isMobile && setIsOpen(false)}
          >
            <FiClipboard className="text-xl" /> Approve Task Requests
          </Link>
          <Link 
            to="/admin/budget" 
            className="flex items-center gap-2 p-2 hover:bg-[#374151] rounded"
            onClick={() => isMobile && setIsOpen(false)}
          >
            <FiDollarSign className="text-xl" /> Budget & Time Tracking
          </Link>

          <Link
             to="/admin/timesheet"
             className="flex items-center gap-2 p-2 hover:bg-[#374151] rounded"
              onClick={() => isMobile && setIsOpen(false)}
          >
            <FiClock className="text-xl" /> Timesheet
          </Link>
        </nav>
        
        <div className="mt-auto">
          <button className="flex items-center gap-2 p-2 bg-[#bef264] hover:bg-[#a3d133] rounded w-full text-black">
            <FiLogOut className="text-xl" /> Logout
          </button>
        </div>
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
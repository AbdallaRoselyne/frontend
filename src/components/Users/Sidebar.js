import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FiClock,
  FiCheckCircle,
  FiUserPlus,
  FiHome,
  FiMenu,
  FiX,
} from "react-icons/fi";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { id: "dashboard", icon: <FiHome />, label: "Dashboard", href: "/dashboard" },
    { id: "members", icon: <FiUserPlus />, label: "Request Member", href: "/members" },
    { id: "tasks", icon: <FiCheckCircle />, label: "Assigned Tasks", href: "/tasks" },
    { id: "timesheet", icon: <FiClock />, label: "Time Sheet", href: "/timesheet" },
  ];

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-[#a54399] text-white rounded-lg shadow-lg"
      >
        {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 fixed md:relative inset-y-0 left-0 w-64 
          bg-[#a54399] text-white p-6 flex flex-col 
          transition-transform duration-300 ease-in-out z-40 shadow-lg`}
      >
        {/* Logo */}
        <div className="text-3xl font-extrabold mb-10">
          <span>Pro</span>
          <span className="text-[#c8db00]">Design</span>
        </div>

        {/* Navigation Links */}
        <nav className="flex flex-col space-y-2 flex-grow">
          {navItems.map((item) => (
            <Link
              key={item.id}
              to={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-lg 
                transition-all duration-200 
                ${
                  location.pathname === item.href
                    ? "bg-[#818181] text-[#c8db00] font-semibold"
                    : "hover:bg-[#818181] hover:text-[#c8db00]"
                }`}
              onClick={() => setIsOpen(false)} // Optional: close sidebar on mobile after click
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Dark Overlay for Mobile */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-40 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;

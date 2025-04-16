import React, { useState } from "react";
import { 
  FiClock, 
  FiCheckCircle, 
  FiUserPlus, 
  FiLogOut, 
  FiHome,
  FiMenu,
  FiX
} from "react-icons/fi";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeItem, setActiveItem] = useState('dashboard');
  
  const navItems = [
    { id: 'dashboard', icon: <FiHome className="text-xl" />, label: 'Dashboard', href: '/dashboard' },
    { id: 'members', icon: <FiUserPlus className="text-xl" />, label: 'Request Member', href: '/members' },
    { id: 'tasks', icon: <FiCheckCircle className="text-xl" />, label: 'Assigned Tasks', href: '/tasks' },
    { id: 'timesheet', icon: <FiClock className="text-xl" />, label: 'Time Sheet', href: '/timesheet' },
  ];

  return (
    <>
      {/* Mobile Hamburger Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-[#3b0764] text-white"
      >
        {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
      </button>

      {/* Sidebar */}
      <div className={`${isOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0 fixed md:relative inset-y-0 left-0 w-64 bg-[#3b0764] text-white 
        flex flex-col p-6 transition-transform duration-300 ease-in-out z-40`}
      >
        {/* Logo */}
        <div className="text-2xl font-bold mb-8 flex items-center">
          <span>Pro</span>
          <span className="text-[#bef264]">Design</span>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-2 flex-grow">
          {navItems.map((item) => (
            <a 
              key={item.id}
              href={item.href}
              className={`flex items-center gap-3 p-3 rounded-lg transition-all
                ${activeItem === item.id ? 'bg-[#4c0a86] text-[#bef264]' : 'hover:bg-[#4c0a86]'}`}
              onClick={() => setActiveItem(item.id)}
            >
              {item.icon}
              <span>{item.label}</span>
            </a>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="mt-auto">
          <button 
            className="flex items-center justify-center gap-3 p-3 bg-[#bef264] hover:bg-[#d9f99d] 
              rounded-lg w-full text-black font-medium transition-colors"
          >
            <FiLogOut className="text-xl" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;
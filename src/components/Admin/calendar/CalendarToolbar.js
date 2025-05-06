import React from "react";
import { exportToCSV } from "./CalendarUtils";

const CalendarToolbar = ({ events, view, setView, onNavigate }) => {
  const views = [
    {
      label: "Day",
      value: "timeGridDay",
      icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
    },
    {
      label: "Week",
      value: "timeGridWeek",
      icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
    },
    {
      label: "Month",
      value: "dayGridMonth",
      icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
    },
  ];

  return (
    <div className="flex flex-wrap justify-between items-center mb-4 gap-3">
      <div className="flex items-center space-x-2">
        <button
          onClick={() => onNavigate("PREV")}
          className="p-2 rounded-md hover:bg-[#f0f0f0] text-[#818181] hover:text-[#a8499c]"
          aria-label="Previous"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        <button
          onClick={() => onNavigate("TODAY")}
          className="px-3 py-1.5 text-sm rounded-md bg-[#f0f0f0] hover:bg-[#e0e0e0] text-[#818181]"
        >
          Today
        </button>

        <button
          onClick={() => onNavigate("NEXT")}
          className="p-2 rounded-md hover:bg-[#f0f0f0] text-[#818181] hover:text-[#a8499c]"
          aria-label="Next"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>

      <div className="flex space-x-1 bg-[#f0f0f0] p-1 rounded-lg">
        {views.map((v) => (
          <button
            key={v.value}
            onClick={() => setView(v.value)}
            className={`px-3 py-1.5 rounded-md flex items-center ${
              view === v.value
                ? "bg-white shadow text-[#a8499c]"
                : "text-[#818181] hover:text-[#a8499c]"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={v.icon}
              />
            </svg>
            {v.label}
          </button>
        ))}
      </div>

      <div className="flex space-x-2">
        <button
          onClick={() => exportToCSV(events)}
          className="bg-[#818181] hover:bg-[#6a6a6a] text-white px-4 py-2 rounded-lg transition-colors font-medium flex items-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          Export
        </button>
      </div>
    </div>
  );
};

export default CalendarToolbar;
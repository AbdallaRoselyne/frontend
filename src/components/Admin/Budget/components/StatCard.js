// components/StatCard.js
import React from "react";
import { FiTrendingUp, FiTrendingDown } from "react-icons/fi";

const trendColors = {
  up: "text-green-600",
  down: "text-red-600",
  neutral: "text-gray-600"
};

// Changed to default export
export default function StatCard({ icon, title, value, trend, trendValue }) {
  const TrendIcon = trend === "up" ? FiTrendingUp : 
                   trend === "down" ? FiTrendingDown : 
                   FiTrendingUp;

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0 bg-indigo-100 rounded-md p-3">
            {icon}
          </div>
          <div className="ml-5 w-0 flex-1">
            <dt className="text-sm font-medium text-gray-500 truncate">
              {title}
            </dt>
            <dd className="flex items-baseline">
              <div className="text-2xl font-semibold text-gray-900">
                {value}
              </div>
              <div className={`ml-2 flex items-baseline text-sm font-semibold ${trendColors[trend]}`}>
                <TrendIcon className="self-center flex-shrink-0 h-4 w-4" />
                <span className="sr-only">
                  {trend === "up" ? "Increased" : trend === "down" ? "Decreased" : ""} by
                </span>
                <span className="ml-1">{trendValue}</span>
              </div>
            </dd>
          </div>
        </div>
      </div>
    </div>
  );
}
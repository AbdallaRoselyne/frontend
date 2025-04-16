import React from "react";
import { FiX, FiPieChart } from "react-icons/fi";

const ProjectDetailModal = ({ project, onClose }) => {
  if (!project) return null;

  // Safely parse numbers with defaults
  const budget = parseFloat(project.budget) || 0;
  const budgetSpent = parseFloat(project.budgetSpent) || 0;
  const hours = parseFloat(project.hours) || 0;
  const hoursLogged = parseFloat(project.hoursLogged) || 0;

  // Calculate values with safeguards
  const remainingBudget = budget - budgetSpent;
  const remainingHours = hours - hoursLogged;
  const budgetPercentage = budget > 0 ? (budgetSpent / budget) * 100 : 0;
  const hoursPercentage = hours > 0 ? (hoursLogged / hours) * 100 : 0;

  return (
    <div className="fixed z-50 inset-0 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>
        
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="absolute top-0 right-0 pt-4 pr-4">
              <button
                type="button"
                className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                onClick={onClose}
              >
                <FiX className="h-6 w-6" />
              </button>
            </div>
            
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                <div className="flex items-center justify-center sm:justify-start">
                  <div className="mx-auto sm:mx-0 flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100">
                    <FiPieChart className="h-6 w-6 text-indigo-600" />
                  </div>
                  <h3 className="ml-3 text-lg leading-6 font-medium text-gray-900">
                    {project.name || 'Unnamed Project'} <span className="text-indigo-600">(#{project.code || 'N/A'})</span>
                  </h3>
                </div>
                
                <div className="mt-4 space-y-4">
                  <div className="border-t border-gray-200 pt-4">
                    <h4 className="text-sm font-medium text-gray-500">Budget Overview</h4>
                    <div className="mt-2">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Total Budget: ${budget.toLocaleString()}</span>
                        <span>Spent: ${budgetSpent.toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="bg-indigo-600 h-2.5 rounded-full" 
                          style={{ width: `${budgetPercentage}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between mt-1 text-sm">
                        <span className="text-gray-600">Spent: {budgetPercentage.toFixed(1)}%</span>
                        <span className="text-green-600">
                          Remaining: ${remainingBudget.toLocaleString()} ({(100 - budgetPercentage).toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-4">
                    <h4 className="text-sm font-medium text-gray-500">Hours Overview</h4>
                    <div className="mt-2">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Total Hours: {hours.toLocaleString()}</span>
                        <span>Logged: {hoursLogged.toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="bg-blue-600 h-2.5 rounded-full" 
                          style={{ width: `${hoursPercentage}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between mt-1 text-sm">
                        <span className="text-gray-600">Logged: {hoursPercentage.toFixed(1)}%</span>
                        <span className="text-green-600">
                          Remaining: {remainingHours.toLocaleString()} ({(100 - hoursPercentage).toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 border-t border-gray-200 pt-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Department</p>
                      <p className="mt-1 text-sm text-gray-900">{project.department || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Stage</p>
                      <p className="mt-1 text-sm text-gray-900">{project.stage || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Team Leader</p>
                      <p className="mt-1 text-sm text-gray-900">{project.teamLeader || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Director</p>
                      <p className="mt-1 text-sm text-gray-900">{project.director || 'Not specified'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailModal;
import React, { useState } from "react";
import { 
  FiPlus, FiPieChart, FiDollarSign, 
  FiClock, FiUsers, FiTrendingUp, FiX 
} from "react-icons/fi";
import { useProjects } from "./hooks/useProjects";
import { useBudgetStats } from "./hooks/useBudgetStats";
import StatCard from "./components/StatCard";
import ProjectModal from "./components/ProjectModal";
import ProjectDetailModal from "./components/ProjectDetailModal";
import ProjectTable from "./components/ProjectTable";

const BudgetTracking = () => {
  const [showModal, setShowModal] = useState(false);
  const [editProject, setEditProject] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [filter, setFilter] = useState("");
  const [filterCriteria, setFilterCriteria] = useState("name");
  
  const {
    projects,
    loading,
    error,
    addProject,
    updateProject,
    deleteProject,
    setError,
  } = useProjects();

  const {
    totalBudget,
    totalHours,
    totalLogged,
    remainingBudget,
    budgetSpentPercentage,
    hoursLoggedPercentage,
  } = useBudgetStats(projects);

  const [newProject, setNewProject] = useState({
    code: "",
    name: "",
    department: "",
    budget: "",
    hours: "",
    teamLeader: "",
    director: "",
    stage: "",
    budgetSpent: 0,
    hoursLogged: 0,
  });

  const handleAddProject = async (e) => {
    e.preventDefault();
    try {
      await addProject(newProject);
      setNewProject({
        code: "",
        name: "",
        department: "",
        budget: "",
        hours: "",
        teamLeader: "",
        director: "",
        stage: "",
        budgetSpent: 0,
        hoursLogged: 0,
      });
      setShowModal(false);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to add project");
    }
  };

  const handleEditProject = async (e) => {
    e.preventDefault();
    try {
      await updateProject(editProject._id, editProject);
      setEditProject(null);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to update project");
    }
  };

  const handleDeleteProject = async (id) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      try {
        await deleteProject(id);
      } catch (error) {
        setError("Failed to delete project");
      }
    }
  };

  const handleProjectSelect = (project) => {
    setSelectedProject(project);
  };

  const filteredProjects = projects.filter(project =>
    project[filterCriteria]?.toString().toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-indigo-800">
            <FiPieChart className="inline mr-2" />
            Budget & Time Tracking
          </h1>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <FiPlus /> New Project
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard 
            icon={<FiDollarSign className="text-indigo-500" />}
            title="Total Budget"
            value={`$${totalBudget.toLocaleString()}`}
            trend="neutral"
            trendValue={`${projects.length} projects`}
          />
          <StatCard 
            icon={<FiClock className="text-blue-500" />}
            title="Total Hours"
            value={totalHours.toLocaleString()}
            trend={totalHours - totalLogged > 0 ? "up" : "down"}
            trendValue={`${hoursLoggedPercentage.toFixed(1)}% logged`}
          />
          <StatCard 
            icon={<FiUsers className="text-green-500" />}
            title="Active Projects"
            value={projects.length}
            trend="neutral"
            trendValue={`${filteredProjects.length} filtered`}
          />
          <StatCard 
            icon={<FiTrendingUp className="text-purple-500" />}
            title="Remaining Budget"
            value={`$${remainingBudget.toLocaleString()}`}
            trend={remainingBudget > 0 ? "up" : "down"}
            trendValue={`${(100 - budgetSpentPercentage).toFixed(1)}% remaining`}
          />
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r">
            <div className="flex">
              <div className="flex-shrink-0">
                <FiX className="h-5 w-5 text-red-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        <ProjectTable 
          projects={filteredProjects}
          loading={loading}
          onEdit={setEditProject}
          onDelete={handleDeleteProject}
          onSelect={handleProjectSelect}  // Fixed: Passing the handler correctly
          filter={filter}
          filterCriteria={filterCriteria}
          onFilterChange={(e) => setFilter(e.target.value)}
          onFilterCriteriaChange={(e) => setFilterCriteria(e.target.value)}
        />
      </main>

      <ProjectModal 
        open={showModal} 
        onClose={() => setShowModal(false)}
        title="Add New Project"
        project={newProject}
        onChange={(e) => setNewProject({...newProject, [e.target.name]: e.target.value})}
        onSubmit={handleAddProject}
      />

      <ProjectModal 
        open={!!editProject} 
        onClose={() => setEditProject(null)}
        title="Edit Project"
        project={editProject}
        onChange={(e) => setEditProject({...editProject, [e.target.name]: e.target.value})}
        onSubmit={handleEditProject}
      />

      {/* Project Detail Modal - Now properly connected */}
      {selectedProject && (
        <ProjectDetailModal 
          project={selectedProject} 
          onClose={() => setSelectedProject(null)}
        />
      )}
    </div>
  );
};

export default BudgetTracking;
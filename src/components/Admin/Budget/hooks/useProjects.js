import { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "../constants";

export const useProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_URL);
      setProjects(response.data);
    } catch (error) {
      console.error("Error fetching projects:", error);
      setError("Failed to load projects. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const addProject = async (project) => {
    try {
      const payload = {
        ...project,
        budget: parseFloat(project.budget),
        hours: parseFloat(project.hours),
      };
      const response = await axios.post(API_URL, payload);
      return response.data;
    } catch (error) {
      console.error("Error adding project:", error);
      throw error;
    }
  };

  const updateProject = async (id, project) => {
    try {
      const payload = {
        ...project,
        budget: parseFloat(project.budget),
        hours: parseFloat(project.hours),
      };
      const response = await axios.put(`${API_URL}/${id}`, payload);
      return response.data;
    } catch (error) {
      console.error("Error updating project:", error);
      throw error;
    }
  };

  const deleteProject = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
    } catch (error) {
      console.error("Error deleting project:", error);
      throw error;
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return {
    projects,
    loading,
    error,
    setProjects,
    addProject,
    updateProject,
    deleteProject,
    fetchProjects,
    setError,
  };
};
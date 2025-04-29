import { useState, useEffect, useCallback } from "react";
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";
const PROJECTS_ENDPOINT = "/api/projects";

export const useProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getAuthConfig = useCallback(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }
    return {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    };
  }, []);

  const handleApiError = useCallback((error) => {
    console.error("API Error:", error);
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      setError("Session expired. Please login again.");
    } else {
      setError(
        error.response?.data?.message ||
        error.message ||
        "An unexpected error occurred"
      );
    }
    throw error;
  }, []);

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await axios.get(
        `${API_BASE_URL}${PROJECTS_ENDPOINT}`,
        getAuthConfig()
      );
      
      const responseData = response.data;
      const projectsData = responseData.data || responseData.projects || responseData;
      
      if (!Array.isArray(projectsData)) {
        throw new Error(`Expected array but got: ${JSON.stringify(responseData)}`);
      }
      
      setProjects(projectsData);
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  }, [getAuthConfig, handleApiError]);

  const addProject = useCallback(async (project) => {
    try {
      const payload = {
        ...project,
        budget: parseFloat(project.budget),
        hours: parseFloat(project.hours),
      };
      const response = await axios.post(
        `${API_BASE_URL}${PROJECTS_ENDPOINT}`,
        payload,
        getAuthConfig()
      );
      await fetchProjects();
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  }, [fetchProjects, getAuthConfig, handleApiError]);

  const updateProject = useCallback(async (id, project) => {
    try {
      const payload = {
        ...project,
        budget: parseFloat(project.budget),
        hours: parseFloat(project.hours),
      };
      const response = await axios.put(
        `${API_BASE_URL}${PROJECTS_ENDPOINT}/${id}`,
        payload,
        getAuthConfig()
      );
      await fetchProjects();
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  }, [fetchProjects, getAuthConfig, handleApiError]);

  const deleteProject = useCallback(async (id) => {
    try {
      await axios.delete(
        `${API_BASE_URL}${PROJECTS_ENDPOINT}/${id}`,
        getAuthConfig()
      );
      await fetchProjects();
    } catch (error) {
      handleApiError(error);
    }
  }, [fetchProjects, getAuthConfig, handleApiError]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return {
    projects,
    loading,
    error,
    addProject,
    updateProject,
    deleteProject,
    fetchProjects,
  };
};
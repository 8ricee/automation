'use client';

import { useState, useEffect } from 'react';
import { projectApi, Project, ProjectInsert, ProjectUpdate } from '../api/projectApi';

export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await projectApi.getAll();
      setProjects(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi tải danh sách dự án');
    } finally {
      setLoading(false);
    }
  };

  const createProject = async (projectData: ProjectInsert) => {
    try {
      const newProject = await projectApi.create(projectData);
      setProjects(prev => [newProject, ...prev]);
      return newProject;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi tạo dự án');
      throw err;
    }
  };

  const updateProject = async (id: string, updates: ProjectUpdate) => {
    try {
      const updatedProject = await projectApi.update(id, updates);
      setProjects(prev => 
        prev.map(project => project.id === id ? updatedProject : project)
      );
      return updatedProject;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi cập nhật dự án');
      throw err;
    }
  };

  const deleteProject = async (id: string) => {
    try {
      await projectApi.delete(id);
      setProjects(prev => prev.filter(project => project.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi xóa dự án');
      throw err;
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return {
    projects,
    loading,
    error,
    refetch: fetchProjects,
    create: createProject,
    update: updateProject,
    delete: deleteProject
  };
};

export const useProjectFilters = () => {
  const [status, setStatus] = useState<string | null>(null);
  const [customerFilter, setCustomerFilter] = useState<string | null>(null);
  const [dateFrom, setDateFrom] = useState<string | null>(null);
  const [dateTo, setDateTo] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const clearFilters = () => {
    setStatus(null);
    setCustomerFilter(null);
    setDateFrom(null);
    setDateTo(null);
    setSearchQuery('');
  };

  const getFilteredProjects = async (projects: Project[]) => {
    let filtered = [...projects];

    // Apply status filter
    if (status) {
      filtered = filtered.filter(project => project.status === status);
    }

    // Apply customer filter
    if (customerFilter) {
      filtered = filtered.filter(project => project.customer_id === customerFilter);
    }

    // Apply date filters
    if (dateFrom) {
      filtered = filtered.filter(project => project.start_date && project.start_date >= dateFrom);
    }
    if (dateTo) {
      filtered = filtered.filter(project => project.start_date && project.start_date <= dateTo);
    }

    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(project => 
        project.title.toLowerCase().includes(query) ||
        (project.description && project.description.toLowerCase().includes(query)) ||
        project.customers?.name.toLowerCase().includes(query)
      );
    }

    return filtered;
  };

  return {
    filters: {
      status,
      customerFilter,
      dateFrom,
      dateTo,
      searchQuery
    },
    setFilters: {
      setStatus,
      setCustomerFilter,
      setDateFrom,
      setDateTo,
      setSearchQuery
    },
    clearFilters,
    getFilteredProjects
  };
};

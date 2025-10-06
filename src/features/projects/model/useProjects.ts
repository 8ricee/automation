'use client';

import { useState } from 'react';
import { useEntity } from '@/hooks/use-entity';
import { ProjectAPI } from '../api/projectApi';
import type { Project, ProjectInsert, ProjectUpdate } from '../api/projectApi';

// Create singleton instance
const projectAPI = new ProjectAPI();

export function useProjects() {
  return useEntity<Project, ProjectInsert, ProjectUpdate>(projectAPI);
}

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
        project.name.toLowerCase().includes(query) ||
        (project.description && project.description.toLowerCase().includes(query))
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

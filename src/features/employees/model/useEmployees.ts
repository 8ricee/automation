'use client';

import { useEntity, useFilters } from '@/hooks/use-entity';
import { EmployeeAPI } from '../api/employeeApi';
import type { Employee, EmployeeInsert, EmployeeUpdate } from '../api/employeeApi';

// Create singleton instance
const employeeAPI = new EmployeeAPI();

export const useEmployees = () => {
  return useEntity<Employee, EmployeeInsert, EmployeeUpdate>(employeeAPI);
};

export const useEmployeeFilters = () => {
  const filters = useFilters({
    status: null,
    department: null,
    role: null,
    searchQuery: ''
  });

  const getFilteredEmployees = async (employees: Employee[]) => {
    let filtered = [...employees];

    // Apply status filter
    if (filters.filters.status) {
      filtered = filtered.filter(emp => emp.status === filters.filters.status);
    }

    // Apply department filter
    if (filters.filters.department) {
      filtered = filtered.filter(emp => emp.department === filters.filters.department);
    }

    // Apply role filter
    if (filters.filters.role) {
      filtered = filtered.filter(emp => emp.role_id === filters.filters.role);
    }

    // Apply search query
    if (filters.filters.searchQuery) {
      const query = String(filters.filters.searchQuery).toLowerCase();
      filtered = filtered.filter(emp => 
        emp.name.toLowerCase().includes(query) ||
        (emp.email && emp.email.toLowerCase().includes(query)) ||
        (emp.position && emp.position.toLowerCase().includes(query))
      );
    }

    return filtered;
  };

  return {
    ...filters,
    getFilteredEmployees
  };
};

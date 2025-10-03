'use client';

import { useState, useEffect } from 'react';
import { employeeApi, Employee, EmployeeInsert, EmployeeUpdate } from '../api/employeeApi';

export const useEmployees = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await employeeApi.getAll();
      setEmployees(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi tải danh sách nhân viên');
    } finally {
      setLoading(false);
    }
  };

  const createEmployee = async (employeeData: EmployeeInsert) => {
    try {
      const newEmployee = await employeeApi.create(employeeData);
      setEmployees(prev => [newEmployee, ...prev]);
      return newEmployee;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi tạo nhân viên');
      throw err;
    }
  };

  const updateEmployee = async (id: string, updates: EmployeeUpdate) => {
    try {
      const updatedEmployee = await employeeApi.update(id, updates);
      setEmployees(prev => 
        prev.map(emp => emp.id === id ? updatedEmployee : emp)
      );
      return updatedEmployee;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi cập nhật nhân viên');
      throw err;
    }
  };

  const deleteEmployee = async (id: string) => {
    try {
      await employeeApi.delete(id);
      setEmployees(prev => prev.filter(emp => emp.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi xóa nhân viên');
      throw err;
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  return {
    employees,
    loading,
    error,
    refetch: fetchEmployees,
    create: createEmployee,
    update: updateEmployee,
    delete: deleteEmployee
  };
};

export const useEmployeeFilters = () => {
  const [status, setStatus] = useState<string | null>(null);
  const [department, setDepartment] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const clearFilters = () => {
    setStatus(null);
    setDepartment(null);
    setRole(null);
    setSearchQuery('');
  };

  const getFilteredEmployees = async (employees: Employee[]) => {
    let filtered = [...employees];

    // Apply status filter
    if (status) {
      filtered = filtered.filter(emp => emp.status === status);
    }

    // Apply department filter
    if (department) {
      filtered = filtered.filter(emp => emp.department === department);
    }

    // Apply role filter
    if (role) {
      filtered = filtered.filter(emp => emp.role === role);
    }

    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(emp => 
        emp.name.toLowerCase().includes(query) ||
        emp.email.toLowerCase().includes(query) ||
        (emp.title && emp.title.toLowerCase().includes(query))
      );
    }

    return filtered;
  };

  return {
    filters: {
      status,
      department,
      role,
      searchQuery
    },
    setFilters: {
      setStatus,
      setDepartment,
      setRole,
      setSearchQuery
    },
    clearFilters,
    getFilteredEmployees
  };
};

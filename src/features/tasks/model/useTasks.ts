'use client';

import { useState, useEffect } from 'react';
import { taskApi, Task, TaskInsert, TaskUpdate } from '../api/taskApi';

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await taskApi.getAll();
      setTasks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi tải danh sách công việc');
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (taskData: TaskInsert) => {
    try {
      const newTask = await taskApi.create(taskData);
      setTasks(prev => [newTask, ...prev]);
      return newTask;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi tạo công việc');
      throw err;
    }
  };

  const updateTask = async (id: string, updates: TaskUpdate) => {
    try {
      const updatedTask = await taskApi.update(id, updates);
      setTasks(prev => 
        prev.map(task => task.id === id ? updatedTask : task)
      );
      return updatedTask;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi cập nhật công việc');
      throw err;
    }
  };

  const deleteTask = async (id: string) => {
    try {
      await taskApi.delete(id);
      setTasks(prev => prev.filter(task => task.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi xóa công việc');
      throw err;
    }
  };

  const updateTaskStatus = async (id: string, status: Task['status']) => {
    try {
      const updatedTask = await taskApi.update(id, { status });
      setTasks(prev => 
        prev.map(task => task.id === id ? updatedTask : task)
      );
      return updatedTask;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi cập nhật trạng thái công việc');
      throw err;
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return {
    tasks,
    loading,
    error,
    refetch: fetchTasks,
    create: createTask,
    update: updateTask,
    delete: deleteTask,
    updateStatus: updateTaskStatus
  };
};

export const useTaskFilters = () => {
  const [status, setStatus] = useState<string | null>(null);
  const [priority, setPriority] = useState<string | null>(null);
  const [projectFilter, setProjectFilter] = useState<string | null>(null);
  const [assigneeFilter, setAssigneeFilter] = useState<string | null>(null);
  const [dateFrom, setDateFrom] = useState<string | null>(null);
  const [dateTo, setDateTo] = useState<string | null>(null);
  const [overdueOnly, setOverdueOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const clearFilters = () => {
    setStatus(null);
    setPriority(null);
    setProjectFilter(null);
    setAssigneeFilter(null);
    setDateFrom(null);
    setDateTo(null);
    setOverdueOnly(false);
    setSearchQuery('');
  };

  const getFilteredTasks = async (tasks: Task[]) => {
    let filtered = [...tasks];

    // Apply status filter
    if (status) {
      filtered = filtered.filter(task => task.status === status);
    }

    // Apply priority filter
    if (priority) {
      filtered = filtered.filter(task => task.priority === priority);
    }

    // Apply project filter
    if (projectFilter) {
      filtered = filtered.filter(task => task.project_id === projectFilter);
    }

    // Apply assignee filter
    if (assigneeFilter) {
      filtered = filtered.filter(task => task.assignee_id === assigneeFilter);
    }

    // Apply date filters
    if (dateFrom) {
      filtered = filtered.filter(task => task.due_date && task.due_date >= dateFrom);
    }
    if (dateTo) {
      filtered = filtered.filter(task => task.due_date && task.due_date <= dateTo);
    }

    // Apply overdue filter
    if (overdueOnly) {
      const today = new Date().toISOString().split('T')[0];
      filtered = filtered.filter(task => 
        task.due_date && task.due_date < today &&
        task.status !== 'done' && task.status !== 'cancelled'
      );
    }

    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(query) ||
        (task.description && task.description.toLowerCase().includes(query))
      );
    }

    return filtered;
  };

  return {
    filters: {
      status,
      priority,
      projectFilter,
      assigneeFilter,
      dateFrom,
      dateTo,
      overdueOnly,
      searchQuery
    },
    setFilters: {
      setStatus,
      setPriority,
      setProjectFilter,
      setAssigneeFilter,
      setDateFrom,
      setDateTo,
      setOverdueOnly,
      setSearchQuery
    },
    clearFilters,
    getFilteredTasks
  };
};

export const useTaskStatistics = () => {
  const [statistics, setStatistics] = useState({
    total_tasks: 0,
    completed_tasks: 0,
    in_progress_tasks: 0,
    pending_tasks: 0,
    high_priority_tasks: 0,
    overdue_tasks: 0,
    average_progress: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await taskApi.getStatistics();
      setStatistics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi tải thống kê công việc');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatistics();
  }, []);

  return {
    statistics,
    loading,
    error,
    refetch: fetchStatistics
  };
};

import { supabase } from '@/lib/supabase';
import { Task, TaskInsert, TaskUpdate } from '@/lib/tasks-api';

// API functions for tasks
export const taskApi = {
  // Get all tasks
  async getAll() {
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        projects!project_id (
          title
        ),
        assignee:employees!assignee_id (
          name, email
        )
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Get task by ID
  async getById(id: string) {
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        projects!project_id (
          title, description, status
        ),
        assignee:employees!assignee_id (
          name, email, department
        )
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Create new task
  async create(task: TaskInsert) {
    const { data, error } = await supabase
      .from('tasks')
      .insert([task])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Update task
  async update(id: string, updates: TaskUpdate) {
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Delete task
  async delete(id: string) {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Get tasks by project
  async getByProject(projectId: string) {
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        assignee:employees!assignee_id (
          name, email
        )
      `)
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Get tasks by assignee
  async getByAssignee(employeeId: string) {
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        projects!project_id (
          title, status
        )
      `)
      .eq('assigned_to', employeeId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Get tasks by status
  async getByStatus(status: Task['status']) {
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        projects!project_id (
          title
        ),
        assignee:employees!assignee_id (
          name
        )
      `)
      .eq('status', status)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Get overdue tasks
  async getOverdueTasks() {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        projects!project_id (
          title
        ),
        assignee:employees!assignee_id (
          name
        )
      `)
      .lt('due_date', today)
      .in('status', ['todo', 'in_progress', 'review'])
      .order('due_date');
    
    if (error) throw error;
    return data;
  },

  // Get upcoming tasks
  async getUpcomingTasks(days: number = 7) {
    const today = new Date();
    const futureDate = new Date(today.getTime() + days * 24 * 60 * 60 * 1000);
    
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        projects!project_id (
          title
        ),
        assignee:employees!assignee_id (
          name
        )
      `)
      .lte('due_date', futureDate.toISOString().split('T')[0])
      .gte('due_date', today.toISOString().split('T')[0])
      .in('status', ['todo', 'in_progress', 'review'])
      .order('due_date');
    
    if (error) throw error;
    return data;
  },

  // Search tasks
  async search(query: string) {
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        projects!project_id (
          title
        ),
        assignee:employees!assignee_id (
          name
        )
      `)
      .or(`title.ilike.%${query}%,description.ilike.%${query}%,tags.ilike.%${query}%,projects.title.ilike.%${query}%`)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Get task statistics
  async getStatistics() {
    const { data, error } = await supabase
      .from('tasks')
      .select('id, status, priority, estimated_hours, completed_hours, due_date');
    
    if (error) throw error;
    
    const stats = {
      total_tasks: data.length,
      todo_tasks: 0,
      in_progress_tasks: 0,
      review_tasks: 0,
      done_tasks: 0,
      overdue_tasks: 0,
      total_estimated_hours: 0,
      total_completed_hours: 0,
      avg_completion_rate: 0
    };

    const today = new Date().toISOString().split('T')[0];

    data.forEach(task => {
      // Count by status
      switch (task.status) {
        case 'todo':
          stats.todo_tasks++;
          break;
        case 'in_progress':
          stats.in_progress_tasks++;
          break;
        case 'review':
          stats.review_tasks++;
          break;
        case 'done':
          stats.done_tasks++;
          break;
      }

      // Count overdue tasks
      if (task.due_date && task.due_date < today && 
          task.status !== 'done' && task.status !== 'cancelled') {
        stats.overdue_tasks++;
      }

      // Calculate hours
      if (task.estimated_hours) {
        stats.total_estimated_hours += task.estimated_hours;
      }
      if (task.completed_hours) {
        stats.total_completed_hours += task.completed_hours;
      }
    });

    // Calculate completion rate
    if (stats.total_estimated_hours > 0) {
      stats.avg_completion_rate = (stats.total_completed_hours / stats.total_estimated_hours) * 100;
    }

    return stats;
  }
};

// Export functions for tasks
export const taskExportApi = {
  async exportToCSV() {
    const tasks = await taskApi.getAll();
    const headers = [
      'ID', 'Tiêu đề', 'Mô tả', 'Trạng thái', 'Ưu tiên',
      'Dự án', 'Người phụ trách', 'Hạn hoàn thành', 'Giờ ước tính', 'Giờ hoàn thành'
    ];
    
    const csvContent = [
      headers.join(','),
      ...tasks.map(task => [
        task.id,
        task.title,
        task.description || '',
        task.status,
        task.priority,
        task.projects?.title || '',
        task.employees?.name || '',
        task.due_date || '',
        task.estimated_hours || 0,
        task.completed_hours || 0
      ].join(','))
    ].join('\n');
    
    return csvContent;
  }
};

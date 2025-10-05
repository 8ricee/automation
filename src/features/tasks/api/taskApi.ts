import { BaseAPI, BaseEntity, APIError } from '@/lib/api/base-api';
import { Tables } from '@/lib/supabase-types';
import { supabase } from '@/utils/supabase';

export type Task = Tables['tasks'];
export type TaskInsert = Omit<Task, 'id' | 'created_at' | 'updated_at'>;
export type TaskUpdate = Partial<TaskInsert>;

export class TaskAPI extends BaseAPI<Task, TaskInsert, TaskUpdate> {
  tableName = 'tasks';
  entityName = 'nhiệm vụ';

  // Override getAll to include project and assignee information
  async getAll(): Promise<Task[]> {
    try {

      const { data, error } = await supabase
        .from(this.tableName)
        .select(`
          *,
          projects!project_id (
            name
          ),
          assignee:employees!assignee_id (
            name, email
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []) as unknown as Task[];
    } catch (error) {
      console.error(`Supabase query failed for ${this.entityName}:`, error);
      throw new APIError(`Không thể tải dữ liệu ${this.entityName}`);
    }
  }

  // Override getById to include detailed project and assignee information
  async getById(id: string): Promise<Task | null> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select(`
          *,
          projects!project_id (
            name, description, status
          ),
          assignee:employees!assignee_id (
            name, email, department
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }
      return data as unknown as Task;
    } catch (error) {
      console.error(`Failed to get ${this.entityName} by ID:`, error);
      throw new APIError(`Không thể tải thông tin ${this.entityName}`);
    }
  }

  // Additional task-specific methods
  async getByStatus(status: Task['status']): Promise<Task[]> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select(`
          *,
          projects!project_id (
            name
          ),
          assignee:employees!assignee_id (
            name, email
          )
        `)
        .eq('status', status)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as unknown as Task[];
    } catch (error) {
      console.error(`Failed to get ${this.entityName} by status:`, error);
      throw new APIError(`Không thể lấy ${this.entityName} theo trạng thái`);
    }
  }

  async getByProject(projectId: string): Promise<Task[]> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select(`
          *,
          projects!project_id (
            name
          ),
          assignee:employees!assignee_id (
            name, email
          )
        `)
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as unknown as Task[];
    } catch (error) {
      console.error(`Failed to get ${this.entityName} by project:`, error);
      throw new APIError(`Không thể lấy ${this.entityName} theo dự án`);
    }
  }

  async getByAssignee(assigneeId: string): Promise<Task[]> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select(`
          *,
          projects!project_id (
            name
          ),
          assignee:employees!assignee_id (
            name, email
          )
        `)
        .eq('assignee_id', assigneeId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as unknown as Task[];
    } catch (error) {
      console.error(`Failed to get ${this.entityName} by assignee:`, error);
      throw new APIError(`Không thể lấy ${this.entityName} theo người được giao`);
    }
  }

  async updateStatus(id: string, status: Task['status']): Promise<Task> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as unknown as Task;
    } catch (error) {
      console.error(`Failed to update ${this.entityName} status:`, error);
      throw new APIError(`Không thể cập nhật trạng thái ${this.entityName}`);
    }
  }

  async updateProgress(id: string, progress_percentage: number): Promise<Task> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .update({ progress_percentage })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as unknown as Task;
    } catch (error) {
      console.error(`Failed to update ${this.entityName} progress:`, error);
      throw new APIError(`Không thể cập nhật tiến độ ${this.entityName}`);
    }
  }

  async searchTasks(query: string): Promise<Task[]> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select(`
          *,
          projects!project_id (
            name
          ),
          assignee:employees!assignee_id (
            name, email
          )
        `)
        .or(`title.ilike.%${query}%,description.ilike.%${query}%,projects.name.ilike.%${query}%`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as unknown as Task[];
    } catch (error) {
      console.error(`Failed to search ${this.entityName}:`, error);
      throw new APIError(`Không thể tìm kiếm ${this.entityName}`);
    }
  }

  async getStatistics() {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('id, status, priority, progress_percentage');

      if (error) throw error;

      const stats = {
        total_tasks: data.length,
        completed_tasks: 0,
        in_progress_tasks: 0,
        pending_tasks: 0,
        high_priority_tasks: 0,
        overdue_tasks: 0,
        average_progress: 0
      };

      let totalProgress = 0;
      const today = new Date();

      data.forEach((task: any) => {
        switch (task.status) {
          case 'completed':
            stats.completed_tasks++;
            break;
          case 'in_progress':
            stats.in_progress_tasks++;
            break;
          case 'pending':
            stats.pending_tasks++;
            break;
        }

        if (task.priority === 'high' || task.priority === 'urgent') {
          stats.high_priority_tasks++;
        }

        if (task.due_date && new Date(task.due_date) < today && task.status !== 'completed') {
          stats.overdue_tasks++;
        }

        totalProgress += task.progress_percentage || 0;
      });

      stats.average_progress = data.length > 0 ? totalProgress / data.length : 0;

      return stats;
    } catch (error) {
      console.error('Error fetching task statistics:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const taskApi = new TaskAPI();

// Export functions for tasks
export const taskExportApi = {
  async exportToCSV() {
    const tasks = await taskApi.getAll();
    const headers = [
      'ID', 'Tiêu đề', 'Dự án', 'Người được giao', 'Trạng thái', 
      'Ưu tiên', 'Tiến độ (%)', 'Ngày hết hạn'
    ];
    
    const csvContent = [
      headers.join(','),
      ...tasks.map(task => [
        task.id,
        task.title,
        (task as any).projects?.name || '',
        (task as any).assignee?.name || '',
        task.status || '',
        task.priority || '',
        task.progress_percentage || 0,
        task.due_date || ''
      ].join(','))
    ].join('\n');
    
    return csvContent;
  }
};

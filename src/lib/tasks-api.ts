import { supabase } from './supabase'

// Define task types based on schema
export type Task = {
  id: string;
  created_at: string | null;
  updated_at: string | null;
  title: string;
  description: string | null;
  status: 'todo' | 'in_progress' | 'review' | 'done' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  project_id: string | null;
  assigned_to: string | null;
  due_date: string | null;
  estimated_hours: number | null;
  completed_hours: number | null;
  tags: string | null;
};

export type TaskInsert = Omit<Task, 'id' | 'created_at' | 'updated_at'>;
export type TaskUpdate = Partial<TaskInsert>;

export interface TaskStatistic {
  total_tasks: number;
  todo_tasks: number;
  in_progress_tasks: number;
  review_tasks: number;
  done_tasks: number;
  overdue_tasks: number;
  total_estimated_hours: number;
  total_completed_hours: number;
  avg_completion_rate: number;
}

export class TasksAPI {
  static async getAll(): Promise<Task[]> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          projects (
            title
          ),
          employees (
            name, email
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching tasks:', error)
      throw error
    }
  }

  static async getById(id: string): Promise<Task | null> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          projects (
            title, description, status
          ),
          employees (
            name, email, department
          )
        `)
        .eq('id', id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') return null // Not found
        throw error
      }

      return data
    } catch (error) {
      console.error('Error fetching task:', error)
      throw error
    }
  }

  static async create(taskData: TaskInsert): Promise<Task> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert(taskData)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating task:', error)
      throw error
    }
  }

  static async update(id: string, updates: TaskUpdate): Promise<Task> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating task:', error)
      throw error
    }
  }

  static async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id)

      if (error) throw error
    } catch (error) {
      console.error('Error deleting task:', error)
      throw error
    }
  }

  static async updateStatus(id: string, status: Task['status']): Promise<Task> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .update({ status })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating task status:', error)
      throw error
    }
  }

  static async assignTask(id: string, assignedTo: string): Promise<Task> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .update({ assigned_to: assignedTo })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error assigning task:', error)
      throw error
    }
  }

  static async getByProject(projectId: string): Promise<Task[]> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          employees (
            name, email
          )
        `)
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching tasks by project:', error)
      throw error
    }
  }

  static async getByAssignee(employeeId: string): Promise<Task[]> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          projects (
            title, status
          )
        `)
        .eq('assigned_to', employeeId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching tasks by assignee:', error)
      throw error
    }
  }

  static async getByStatus(status: Task['status']): Promise<Task[]> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          projects (
            title
          ),
          employees (
            name
          )
        `)
        .eq('status', status)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching tasks by status:', error)
      throw error
    }
  }

  static async getByPriority(priority: Task['priority']): Promise<Task[]> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          projects (
            title
          ),
          employees (
            name
          )
        `)
        .eq('priority', priority)
        .order('due_date', { ascending: true })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching tasks by priority:', error)
      throw error
    }
  }

  static async getOverdueTasks(): Promise<Task[]> {
    try {
      const today = new Date().toISOString().split('T')[0]
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          projects (
            title
          ),
          employees (
            name
          )
        `)
        .lt('due_date', today)
        .in('status', ['todo', 'in_progress', 'review'])
        .order('due_date')

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching overdue tasks:', error)
      throw error
    }
  }

  static async getUpcomingTasks(days: number = 7): Promise<Task[]> {
    try {
      const today = new Date()
      const futureDate = new Date(today.getTime() + days * 24 * 60 * 60 * 1000)
      
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          projects (
            title
          ),
          employees (
            name
          )
        `)
        .lte('due_date', futureDate.toISOString().split('T')[0])
        .gte('due_date', today.toISOString().split('T')[0])
        .in('status', ['todo', 'in_progress', 'review'])
        .order('due_date')

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching upcoming tasks:', error)
      throw error
    }
  }

  static async search(query: string): Promise<Task[]> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          projects (
            title
          ),
          employees (
            name
          )
        `)
        .or(`title.ilike.%${query}%,description.ilike.%${query}%,tags.ilike.%${query}%,projects.title.ilike.%${query}%`)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error searching tasks:', error)
      throw error
    }
  }

  static async updateCompletionHours(id: string, hours: number): Promise<Task> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .update({ completed_hours: hours })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating completion hours:', error)
      throw error
    }
  }

  static async getStatistics(): Promise<TaskStatistic> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('id, status, priority, estimated_hours, completed_hours, due_date')

      if (error) throw error

      const stats: TaskStatistic = {
        total_tasks: data.length,
        todo_tasks: 0,
        in_progress_tasks: 0,
        review_tasks: 0,
        done_tasks: 0,
        overdue_tasks: 0,
        total_estimated_hours: 0,
        total_completed_hours: 0,
        avg_completion_rate: 0
      }

      const today = new Date().toISOString().split('T')[0]

      data.forEach(task => {
        // Count by status
        switch (task.status) {
          case 'todo':
            stats.todo_tasks++
            break
          case 'in_progress':
            stats.in_progress_tasks++
            break
          case 'review':
            stats.review_tasks++
            break
          case 'done':
            stats.done_tasks++
            break
        }

        // Count overdue tasks
        if (task.due_date && task.due_date < today && 
            task.status !== 'done' && task.status !== 'cancelled') {
          stats.overdue_tasks++
        }

        // Calculate hours
        if (task.estimated_hours) {
          stats.total_estimated_hours += task.estimated_hours
        }
        if (task.completed_hours) {
          stats.total_completed_hours += task.completed_hours
        }
      })

      // Calculate completion rate
      if (stats.total_estimated_hours > 0) {
        stats.avg_completion_rate = (stats.total_completed_hours / stats.total_estimated_hours) * 100
      }

      return stats
    } catch (error) {
      console.error('Error fetching task statistics:', error)
      throw error
    }
  }

  static async exportToCSV(): Promise<string> {
    try {
      const tasks = await this.getAll()
      const headers = [
        'ID', 'Tiêu đề', 'Mô tả', 'Trạng thái', 'Ưu tiên',
        'Dự án', 'Người phụ trách', 'Hạn hoàn thành', 'Giờ ước tính', 'Giờ hoàn thành'
      ]
      
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
      ].join('\n')
      
      return csvContent
    } catch (error) {
      console.error('Error exporting tasks:', error)
      throw error
    }
  }

  // Bulk operations
  static async bulkUpdateStatus(taskIds: string[], status: Task['status']): Promise<Task[]> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .update({ status })
        .in('id', taskIds)
        .select()

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error bulk updating task status:', error)
      throw error
    }
  }

  static async bulkAssignTasks(taskIds: string[], employeeId: string): Promise<Task[]> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .update({ assigned_to: employeeId })
        .in('id', taskIds)
        .select()

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error bulk assigning tasks:', error)
      throw error
    }
  }
}

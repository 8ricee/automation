import { BaseAPI, BaseEntity, APIError } from '@/lib/api/base-api';
import { Tables } from '@/lib/supabase-types';
import { supabase } from '@/utils/supabase';

export type Project = Tables['projects'];
export type ProjectInsert = Omit<Project, 'id' | 'created_at' | 'updated_at'>;
export type ProjectUpdate = Partial<ProjectInsert>;

export class ProjectAPI extends BaseAPI<Project, ProjectInsert, ProjectUpdate> {
  tableName = 'projects';
  entityName = 'dự án';

  // Override getAll to include customer and project manager information
  async getAll(): Promise<Project[]> {
    try {

      const { data, error } = await supabase
        .from(this.tableName)
        .select(`
          *,
          customers (
            name, email, company
          ),
          project_manager:employees!project_manager_id (
            name, email, position
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []) as unknown as Project[];
    } catch (error) {
      console.error(`Supabase query failed for ${this.entityName}:`, error);
      throw new APIError(`Không thể tải dữ liệu ${this.entityName}`);
    }
  }

  // Override getById to include customer and project manager information
  async getById(id: string): Promise<Project | null> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select(`
          *,
          customers (
            name, email, company
          ),
          project_manager:employees!project_manager_id (
            name, email, position
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }
      return data as unknown as Project;
    } catch (error) {
      console.error(`Failed to get ${this.entityName} by ID:`, error);
      throw new APIError(`Không thể tải thông tin ${this.entityName}`);
    }
  }

  // Additional project-specific methods
  async getByStatus(status: Project['status']): Promise<Project[]> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select(`
          *,
          customers (
            name, email, company
          ),
          project_manager:employees!project_manager_id (
            name, email, position
          )
        `)
        .eq('status', status)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as unknown as Project[];
    } catch (error) {
      console.error(`Failed to get ${this.entityName} by status:`, error);
      throw new APIError(`Không thể lấy ${this.entityName} theo trạng thái`);
    }
  }

  async getByCustomer(customerId: string): Promise<Project[]> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select(`
          *,
          customers (
            name, email, company
          ),
          project_manager:employees!project_manager_id (
            name, email, position
          )
        `)
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as unknown as Project[];
    } catch (error) {
      console.error(`Failed to get ${this.entityName} by customer:`, error);
      throw new APIError(`Không thể lấy ${this.entityName} theo khách hàng`);
    }
  }

  async getByProjectManager(managerId: string): Promise<Project[]> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select(`
          *,
          customers (
            name, email, company
          ),
          project_manager:employees!project_manager_id (
            name, email, position
          )
        `)
        .eq('project_manager_id', managerId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as unknown as Project[];
    } catch (error) {
      console.error(`Failed to get ${this.entityName} by project manager:`, error);
      throw new APIError(`Không thể lấy ${this.entityName} theo quản lý dự án`);
    }
  }

  async updateStatus(id: string, status: Project['status']): Promise<Project> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as unknown as Project;
    } catch (error) {
      console.error(`Failed to update ${this.entityName} status:`, error);
      throw new APIError(`Không thể cập nhật trạng thái ${this.entityName}`);
    }
  }

  async updateProgress(id: string, progress_percentage: number): Promise<Project> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .update({ progress_percentage })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as unknown as Project;
    } catch (error) {
      console.error(`Failed to update ${this.entityName} progress:`, error);
      throw new APIError(`Không thể cập nhật tiến độ ${this.entityName}`);
    }
  }

  async searchProjects(query: string): Promise<Project[]> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select(`
          *,
          customers (
            name, email, company
          ),
          project_manager:employees!project_manager_id (
            name, email, position
          )
        `)
        .or(`name.ilike.%${query}%,description.ilike.%${query}%,customers.name.ilike.%${query}%`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as unknown as Project[];
    } catch (error) {
      console.error(`Failed to search ${this.entityName}:`, error);
      throw new APIError(`Không thể tìm kiếm ${this.entityName}`);
    }
  }

  async getStatistics() {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('id, status, budget, progress_percentage');

      if (error) throw error;

      const stats = {
        total_projects: data.length,
        total_budget: 0,
        active_projects: 0,
        completed_projects: 0,
        on_hold_projects: 0,
        cancelled_projects: 0,
        average_progress: 0
      };

      let totalProgress = 0;

      data.forEach((project: unknown) => {
        if (project.budget) {
          stats.total_budget += project.budget;
        }

        switch (project.status) {
          case 'active':
            stats.active_projects++;
            break;
          case 'completed':
            stats.completed_projects++;
            break;
          case 'on_hold':
            stats.on_hold_projects++;
            break;
          case 'cancelled':
            stats.cancelled_projects++;
            break;
        }

        totalProgress += project.progress_percentage || 0;
      });

      stats.average_progress = data.length > 0 ? totalProgress / data.length : 0;

      return stats;
    } catch (error) {
      console.error('Error fetching project statistics:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const projectApi = new ProjectAPI();

// Export functions for projects
export const projectExportApi = {
  async exportToCSV() {
    const projects = await projectApi.getAll();
    const headers = [
      'ID', 'Tên dự án', 'Khách hàng', 'Quản lý dự án', 'Trạng thái', 
      'Ngày bắt đầu', 'Ngày kết thúc', 'Ngân sách', 'Tiến độ (%)'
    ];
    
    const csvContent = [
      headers.join(','),
      ...projects.map(project => [
        project.id,
        project.name,
        (project as Record<string, unknown>).customers?.name || '',
        (project as Record<string, unknown>).project_manager?.name || '',
        project.status || '',
        project.start_date,
        project.end_date || '',
        project.budget || 0,
        project.progress_percentage || 0
      ].join(','))
    ].join('\n');
    
    return csvContent;
  }
};

import { supabase } from '@/lib/supabase';
import { Tables } from '@/lib/supabase-types';

export type Project = Tables['projects'];
export type ProjectInsert = Omit<Project, 'id' | 'created_at' | 'updated_at'>;
export type ProjectUpdate = Partial<ProjectInsert>;

// API functions for projects
export const projectApi = {
  // Get all projects
  async getAll() {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        customers (
          name, email, company
        ),
        project_manager:employees!project_manager_id (
          name, email, title
        )
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Get project by ID
  async getById(id: string) {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        customers (
          name, email, company
        ),
        project_manager:employees!project_manager_id (
          name, email, title
        )
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Create new project
  async create(project: ProjectInsert) {
    const { data, error } = await supabase
      .from('projects')
      .insert([project])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Update project
  async update(id: string, updates: ProjectUpdate) {
    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Delete project
  async delete(id: string) {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Get projects by status
  async getByStatus(status: string) {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        customers (
          name, email, company
        ),
        project_manager:employees!project_manager_id (
          name, email, title
        )
      `)
      .eq('status', status)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Update project progress
  async updateProgress(id: string, progress: number) {
    const { data, error } = await supabase
      .from('projects')
      .update({ progress })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Search projects
  async search(query: string) {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        customers (
          name, email, company
        ),
        project_manager:employees!project_manager_id (
          name, email, title
        )
      `)
      .or(`title.ilike.%${query}%,description.ilike.%${query}%,customers.name.ilike.%${query}%`)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }
};

// Export functions for projects
export const projectExportApi = {
  async exportToCSV() {
    const projects = await projectApi.getAll();
    const headers = ['ID', 'Tên dự án', 'Khách hàng', 'Trạng thái', 'Tiến độ (%)', 'Ngày bắt đầu', 'Ngày kết thúc'];
    
    const csvContent = [
      headers.join(','),
      ...projects.map(project => [
        project.id,
        project.title,
        project.customers?.name || '',
        project.status || '',
        project.progress || 0,
        project.start_date || '',
        project.end_date || ''
      ].join(','))
    ].join('\n');
    
    return csvContent;
  }
};

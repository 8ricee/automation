"use client";

import React from "react";
import { GenericForm, FormField } from "@/components/forms/generic-form";
import type { Project } from "@/lib/supabase-types";

interface ProjectFormProps {
  onSubmit: (data: any) => Promise<void>;
  initialData?: Partial<Project>;
  isLoading?: boolean;
  onCancel?: () => void;
}

export function ProjectForm({ onSubmit, initialData, isLoading = false, onCancel }: ProjectFormProps) {
  const fields: FormField[] = [
    { name: 'name', label: 'Tên dự án', type: 'text', required: true, placeholder: 'Nhập tên dự án' },
    { name: 'description', label: 'Mô tả', type: 'textarea', placeholder: 'Nhập mô tả dự án...' },
    { name: 'customer_id', label: 'ID Khách hàng', type: 'text', required: true, placeholder: 'Nhập ID khách hàng' },
    { name: 'project_manager_id', label: 'ID Quản lý dự án', type: 'text', placeholder: 'Nhập ID quản lý dự án' },
    { name: 'start_date', label: 'Ngày bắt đầu', type: 'date', placeholder: 'Chọn ngày bắt đầu' },
    { name: 'end_date', label: 'Ngày kết thúc', type: 'date', placeholder: 'Chọn ngày kết thúc' },
    { name: 'status', label: 'Trạng thái', type: 'select', options: [
      { value: 'planning', label: 'Đang lập kế hoạch' },
      { value: 'active', label: 'Đang thực hiện' },
      { value: 'completed', label: 'Hoàn thành' },
      { value: 'on_hold', label: 'Tạm dừng' },
      { value: 'cancelled', label: 'Hủy bỏ' },
    ]},
    { name: 'priority', label: 'Ưu tiên', type: 'select', options: [
      { value: 'low', label: 'Thấp' },
      { value: 'medium', label: 'Trung bình' },
      { value: 'high', label: 'Cao' },
      { value: 'urgent', label: 'Khẩn cấp' },
    ]},
    { name: 'budget', label: 'Ngân sách (VNĐ)', type: 'number', placeholder: 'Nhập ngân sách' },
    { name: 'actual_cost', label: 'Chi phí thực tế (VNĐ)', type: 'number', placeholder: 'Nhập chi phí thực tế' },
    { name: 'progress_percentage', label: 'Tiến độ (%)', type: 'number', placeholder: '0', min: 0, max: 100 },
    { name: 'notes', label: 'Ghi chú', type: 'textarea', placeholder: 'Nhập ghi chú...' },
  ];

  return (
    <GenericForm
      fields={fields}
      onSubmit={onSubmit}
      initialData={initialData}
      isLoading={isLoading}
      onCancel={onCancel}
    />
  );
}

export const ProjectCard: React.FC<{ project: Project }> = ({ project }) => {
  return (
    <div className="rounded-lg border p-4">
      <h3 className="text-lg font-semibold">{project.name}</h3>
      <p className="text-sm text-muted-foreground">{project.description}</p>
      <div className="mt-2 space-y-1 text-sm">
        <p><span className="font-medium">Trạng thái:</span> {project.status}</p>
        <p><span className="font-medium">Tiến độ:</span> {project.progress_percentage || 0}%</p>
        <p><span className="font-medium">Ngày bắt đầu:</span> {project.start_date}</p>
        <p><span className="font-medium">Ngày kết thúc:</span> {project.end_date}</p>
      </div>
    </div>
  );
};

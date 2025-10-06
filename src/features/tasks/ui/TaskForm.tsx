'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import type { Task } from '@/lib/supabase-types';

interface TaskFormProps {
  task?: Task;
  onSubmit: (data: Partial<Task>) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export const TaskForm: React.FC<TaskFormProps> = ({
  task,
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const [formData, setFormData] = useState<Partial<Task>>({
    title: task?.title || '',
    description: task?.description || '',
    status: task?.status || 'todo',
    priority: task?.priority || 'medium',
    due_date: task?.due_date || '',
    estimated_hours: task?.estimated_hours || 0,
    assignee_id: task?.assignee_id || undefined,
    project_id: task?.project_id || undefined
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title?.trim()) {
      newErrors.title = 'Tiêu đề công việc là bắt buộc';
    }

    if ((formData.estimated_hours || 0) < 0) {
      newErrors.estimated_hours = 'Giờ ước tính không thể âm';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Lỗi submit form:', error);
    }
  };

  const handleChange = (field: keyof Task, value: string | number | boolean | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>
          {task ? 'Chỉnh sửa công việc' : 'Tạo công việc mới'}
        </CardTitle>
        <CardDescription>
          {task ? 'Cập nhật thông tin công việc' : 'Nhập thông tin để tạo công việc mới'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Tiêu đề công việc *</Label>
            <Input
              id="title"
              value={formData.title || ''}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="Nhập tiêu đề công việc"
              className={errors.title ? 'border-red-500' : ''}
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Mô tả</Label>
            <Textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Nhập mô tả công việc..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Trạng thái</Label>
              <Select
                value={formData.status as string}
                onValueChange={(value) => handleChange('status', value as 'todo' | 'in_progress' | 'completed' | 'cancelled')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">Cần làm</SelectItem>
                  <SelectItem value="in_progress">Đang thực hiện</SelectItem>
                  <SelectItem value="completed">Hoàn thành</SelectItem>
                  <SelectItem value="cancelled">Đã hủy</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Ưu tiên</Label>
              <Select
                value={formData.priority as string}
                onValueChange={(value) => handleChange('priority', value as 'low' | 'medium' | 'high' | 'urgent')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn mức độ ưu tiên" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Thấp</SelectItem>
                  <SelectItem value="medium">Trung bình</SelectItem>
                  <SelectItem value="high">Cao</SelectItem>
                  <SelectItem value="urgent">Khẩn cấp</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="due_date">Hạn cuối</Label>
              <Input
                id="due_date"
                type="date"
                value={formData.due_date || ''}
                onChange={(e) => handleChange('due_date', e.target.value || null)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="estimated_hours">Giờ ước tính</Label>
              <Input
                id="estimated_hours"
                type="number"
                value={formData.estimated_hours || ''}
                onChange={(e) => handleChange('estimated_hours', parseInt(e.target.value) || 0)}
                placeholder="0"
                min="0"
                className={errors.estimated_hours ? 'border-red-500' : ''}
              />
              {errors.estimated_hours && (
                <p className="text-sm text-red-500">{errors.estimated_hours}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="estimated_hours">Giờ ước tính</Label>
              <Input
                id="estimated_hours"
                type="number"
                value={formData.estimated_hours || ''}
                onChange={(e) => handleChange('estimated_hours', parseInt(e.target.value) || 0)}
                placeholder="0"
                min="0"
                className={errors.estimated_hours ? 'border-red-500' : ''}
              />
              {errors.estimated_hours && (
                <p className="text-sm text-red-500">{errors.estimated_hours}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="assignee_id">ID Người thực hiện</Label>
              <Input
                id="assignee_id"
                value={formData.assignee_id || ''}
                onChange={(e) => handleChange('assignee_id', e.target.value || null)}
                placeholder="Nhập ID người thực hiện"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="project_id">ID Dự án</Label>
              <Input
                id="project_id"
                value={formData.project_id || ''}
                onChange={(e) => handleChange('project_id', e.target.value || null)}
                placeholder="Nhập ID dự án"
              />
            </div>
          </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="status"
                checked={formData.status === 'done'}
                onChange={(e) => handleChange('status', e.target.checked ? 'done' : 'todo')}
                className="rounded border-gray-300"
              />
              <Label htmlFor="status">Hoàn thành</Label>
            </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? 'Đang xử lý...' : (task ? 'Cập nhật' : 'Tạo công việc')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export const TaskCard: React.FC<{ task: Task }> = ({ task }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{task.title}</CardTitle>
        <CardDescription>{task.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p><span className="font-medium">Trạng thái:</span> {task.status}</p>
          <p><span className="font-medium">Ưu tiên:</span> {task.priority}</p>
          <p><span className="font-medium">Hạn cuối:</span> {task.due_date}</p>
          <p><span className="font-medium">Giờ ước tính:</span> {task.estimated_hours}</p>
        </div>
      </CardContent>
    </Card>
  );
};

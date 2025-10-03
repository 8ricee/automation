'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Project, ProjectInsert } from '../api/projectApi';

interface ProjectFormProps {
  project?: Project;
  onSubmit: (data: ProjectInsert) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export const ProjectForm: React.FC<ProjectFormProps> = ({
  project,
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const [formData, setFormData] = useState<ProjectInsert>({
    title: project?.title || '',
    description: project?.description || '',
    status: project?.status || 'planning',
    progress: project?.progress || 0,
    customer_id: project?.customer_id || '',
    start_date: project?.start_date || '',
    end_date: project?.end_date || ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Tên dự án là bắt buộc';
    }

    if (!formData.customer_id.trim()) {
      newErrors.customer_id = 'Khách hàng là bắt buộc';
    }

    if ((formData.progress || 0) < 0 || (formData.progress || 0) > 100) {
      newErrors.progress = 'Tiến độ phải từ 0 đến 100';
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

  const handleChange = (field: keyof ProjectInsert, value: string | number) => {
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
          {project ? 'Chỉnh sửa dự án' : 'Tạo dự án mới'}
        </CardTitle>
        <CardDescription>
          {project ? 'Cập nhật thông tin dự án' : 'Nhập thông tin để tạo dự án mới'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Tên dự án *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="Nhập tên dự án"
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
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Nhập mô tả dự án..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customer_id">ID Khách hàng *</Label>
              <Input
                id="customer_id"
                value={formData.customer_id}
                onChange={(e) => handleChange('customer_id', e.target.value)}
                placeholder="Nhập ID khách hàng"
                className={errors.customer_id ? 'border-red-500' : ''}
              />
              {errors.customer_id && (
                <p className="text-sm text-red-500">{errors.customer_id}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Trạng thái</Label>
              <Select
                value={formData.status as string}
                onValueChange={(value) => handleChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planning">Đang lập kế hoạch</SelectItem>
                  <SelectItem value="active">Đang thực hiện</SelectItem>
                  <SelectItem value="on_hold">Tạm dừng</SelectItem>
                  <SelectItem value="completed">Hoàn thành</SelectItem>
                  <SelectItem value="cancelled">Hủy bỏ</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="progress">Tiến độ (%)</Label>
              <Input
                id="progress"
                type="number"
                value={formData.progress || ''}
                onChange={(e) => handleChange('progress', parseInt(e.target.value) || 0)}
                placeholder="0"
                min="0"
                max="100"
                className={errors.progress ? 'border-red-500' : ''}
              />
              {errors.progress && (
                <p className="text-sm text-red-500">{errors.progress}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="start_date">Ngày bắt đầu</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => handleChange('start_date', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_date">Ngày kết thúc</Label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) => handleChange('end_date', e.target.value)}
              />
            </div>
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
              {isLoading ? 'Đang xử lý...' : (project ? 'Cập nhật' : 'Tạo dự án')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export const ProjectCard: React.FC<{ project: Project }> = ({ project }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{project.title}</CardTitle>
        <CardDescription>{project.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p><span className="font-medium">Trạng thái:</span> {project.status}</p>
          <p><span className="font-medium">Tiến độ:</span> {project.progress || 0}%</p>
          <p><span className="font-medium">Ngày bắt đầu:</span> {project.start_date}</p>
          <p><span className="font-medium">Ngày kết thúc:</span> {project.end_date}</p>
        </div>
      </CardContent>
    </Card>
  );
};
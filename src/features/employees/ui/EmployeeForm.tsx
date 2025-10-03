'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Employee, EmployeeInsert } from '../api/employeeApi';

interface EmployeeFormProps {
  employee?: Employee;
  onSubmit: (data: EmployeeInsert) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export const EmployeeForm: React.FC<EmployeeFormProps> = ({
  employee,
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const [formData, setFormData] = useState<EmployeeInsert>({
    name: employee?.name || '',
    email: employee?.email || '',
    title: employee?.title || '',
    department: employee?.department || '',
    status: employee?.status || 'active',
    role: employee?.role || 'sales',
    hourly_rate: employee?.hourly_rate || 0,
    hire_date: employee?.hire_date || new Date().toISOString().split('T')[0],
    password_hash: employee?.password_hash || ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Tên nhân viên là bắt buộc';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email là bắt buộc';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (!formData.hire_date) {
      newErrors.hire_date = 'Ngày tuyển dụng là bắt buộc';
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

  const handleChange = (field: keyof EmployeeInsert, value: string | number) => {
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
          {employee ? 'Chỉnh sửa thông tin nhân viên' : 'Thêm nhân viên mới'}
        </CardTitle>
        <CardDescription>
          {employee ? 'Cập nhật thông tin nhân viên' : 'Nhập thông tin để thêm nhân viên mới vào hệ thống'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Tên nhân viên *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Nhập tên nhân viên"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="example@company.com"
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Chức vụ</Label>
              <Input
                id="title"
                value={formData.title || ''}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="VD: Nhân viên kinh doanh"
              />
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
                  <SelectItem value="active">Hoạt động</SelectItem>
                  <SelectItem value="inactive">Tạm nghỉ</SelectItem>
                  <SelectItem value="terminated">Nghỉ việc</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Phòng ban</Label>
              <Input
                id="department"
                value={formData.department || ''}
                onChange={(e) => handleChange('department', e.target.value)}
                placeholder="VD: Kinh doanh, IT, Nhân sự"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Vai trò</Label>
              <Select
                value={formData.role || ''}
                onValueChange={(value) => handleChange('role', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn vai trò" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Quản trị viên</SelectItem>
                  <SelectItem value="director">Ban giám đốc</SelectItem>
                  <SelectItem value="manager">Trưởng phòng</SelectItem>
                  <SelectItem value="sales">Sales</SelectItem>
                  <SelectItem value="engineer">Kỹ sư</SelectItem>
                  <SelectItem value="accountant">Kế toán</SelectItem>
                  <SelectItem value="warehouse">Thủ kho</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hourly_rate">Lương theo giờ (VND)</Label>
              <Input
                id="hourly_rate"
                type="number"
                value={formData.hourly_rate || ''}
                onChange={(e) => handleChange('hourly_rate', parseInt(e.target.value) || 0)}
                placeholder="VD: 50000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hire_date">Ngày tuyển dụng *</Label>
              <Input
                id="hire_date"
                type="date"
                value={formData.hire_date}
                onChange={(e) => handleChange('hire_date', e.target.value)}
                className={errors.hire_date ? 'border-red-500' : ''}
              />
              {errors.hire_date && (
                <p className="text-sm text-red-500">{errors.hire_date}</p>
              )}
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
              {isLoading ? 'Đang xử lý...' : (employee ? 'Cập nhật' : 'Thêm nhân viên')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export const EmployeeCard: React.FC<{ employee: Employee }> = ({ employee }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{employee.name}</CardTitle>
        <CardDescription>{employee.title}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p><span className="font-medium">Email:</span> {employee.email}</p>
          <p><span className="font-medium">Phòng ban:</span> {employee.department}</p>
          <p><span className="font-medium">Vai trò:</span> {employee.role}</p>
          <p><span className="font-medium">Trạng thái:</span> {employee.status}</p>
          <p><span className="font-medium">Ngày tuyển dụng:</span> {employee.hire_date}</p>
        </div>
      </CardContent>
    </Card>
  );
};

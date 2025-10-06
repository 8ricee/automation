'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Customer } from '@/lib/supabase-types';
import { CustomerInsert } from '../api/customerApi';
import { usePermissions } from '@/hooks/use-permissions';

interface CustomerFormProps {
  customer?: Customer;
  onSubmit: (data: CustomerInsert) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export const CustomerForm: React.FC<CustomerFormProps> = ({
  customer,
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const { canEditCustomers } = usePermissions();
  const [formData, setFormData] = useState<CustomerInsert>({
    name: customer?.name || '',
    email: customer?.email || '',
    company: customer?.company || '',
    status: customer?.status || 'active',
    address: customer?.address || '',
    phone: customer?.phone || '',
    city: customer?.city || '',
    state: customer?.state || '',
    postal_code: customer?.postal_code || '',
    country: customer?.country || '',
    website: customer?.website || '',
    industry: customer?.industry || '',
    customer_type: customer?.customer_type || 'business',
    notes: customer?.notes || '',
    date_added: new Date().toISOString().split('T')[0]
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Tên khách hàng là bắt buộc';
    }

    if (!formData.email || !formData.email.trim()) {
      newErrors.email = 'Email là bắt buộc';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof CustomerInsert, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Tên khách hàng *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Nhập tên khách hàng"
            className={errors.name ? 'border-red-500' : ''}
          />
          {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email || ''}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="email@example.com"
            className={errors.email ? 'border-red-500' : ''}
          />
          {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="company">Công ty</Label>
          <Input
            id="company"
            value={formData.company || ''}
            onChange={(e) => handleChange('company', e.target.value)}
            placeholder="Tên công ty"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Trạng thái</Label>
          <Select
            value={formData.status || ''}
            onValueChange={(value) => handleChange('status', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Chọn trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Hoạt động</SelectItem>
              <SelectItem value="inactive">Không hoạt động</SelectItem>
              <SelectItem value="pending">Chờ duyệt</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="phone">Số điện thoại</Label>
          <Input
            id="phone"
            value={formData.phone || ''}
            onChange={(e) => handleChange('phone', e.target.value)}
            placeholder="Số điện thoại"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="website">Website</Label>
          <Input
            id="website"
            value={formData.website || ''}
            onChange={(e) => handleChange('website', e.target.value)}
            placeholder="https://example.com"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Địa chỉ</Label>
        <Textarea
          id="address"
            value={formData.address || ''}
          onChange={(e) => handleChange('address', e.target.value)}
          placeholder="Địa chỉ"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="city">Thành phố</Label>
          <Input
            id="city"
            value={formData.city || ''}
            onChange={(e) => handleChange('city', e.target.value)}
            placeholder="Thành phố"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="state">Tỉnh/Bang</Label>
          <Input
            id="state"
            value={formData.state || ''}
            onChange={(e) => handleChange('state', e.target.value)}
            placeholder="Tỉnh"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="postal_code">Mã bưu điện</Label>
          <Input
            id="postal_code"
            value={formData.postal_code || ''}
            onChange={(e) => handleChange('postal_code', e.target.value)}
            placeholder="Mã bưu điện"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="country">Quốc gia</Label>
          <Input
            id="country"
            value={formData.country || ''}
            onChange={(e) => handleChange('country', e.target.value)}
            placeholder="Quốc gia"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="industry">Ngành nghề</Label>
          <Input
            id="industry"
            value={formData.industry || ''}
            onChange={(e) => handleChange('industry', e.target.value)}
            placeholder="Ngành nghề"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="customer_type">Loại khách hàng</Label>
        <Select
          value={formData.customer_type || 'business'}
          onValueChange={(value) => handleChange('customer_type', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Chọn loại khách hàng" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="individual">Cá nhân</SelectItem>
            <SelectItem value="business">Doanh nghiệp</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Ghi chú</Label>
        <Textarea
          id="notes"
            value={formData.notes || ''}
          onChange={(e) => handleChange('notes', e.target.value)}
          placeholder="Ghi chú về khách hàng"
          rows={3}
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
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
          disabled={isLoading || !canEditCustomers()}
          title={!canEditCustomers() ? 'Bạn không có quyền chỉnh sửa khách hàng' : ''}
        >
          {isLoading ? 'Đang xử lý...' : 'Cập nhật'}
        </Button>
      </div>
    </form>
  );
};

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Order, OrderInsert } from '../api/orderApi';

interface OrderFormProps {
  order?: Order;
  onSubmit: (data: OrderInsert) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export const OrderForm: React.FC<OrderFormProps> = ({
  order,
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const [formData, setFormData] = useState<OrderInsert>({
    order_number: order?.order_number || '',
    customer_id: order?.customer_id || '',
    status: order?.status || 'pending',
    order_date: order?.order_date || new Date().toISOString().split('T')[0],
    delivery_date: order?.delivery_date || null,
    total_amount: order?.total_amount || 0,
    tax_amount: order?.tax_amount || 0,
    discount_amount: order?.discount_amount || 0,
    shipping_address: order?.shipping_address || null,
    billing_address: order?.billing_address || null,
    payment_method: order?.payment_method || null,
    payment_status: order?.payment_status || 'pending',
    notes: order?.notes || '',
    created_by: order?.created_by || null
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.order_number.trim()) {
      newErrors.order_number = 'Số đơn hàng là bắt buộc';
    }

    if (!formData.customer_id || !formData.customer_id.trim()) {
      newErrors.customer_id = 'Khách hàng là bắt buộc';
    }

    if (!formData.order_date) {
      newErrors.order_date = 'Ngày đặt hàng là bắt buộc';
    }

    if (formData.total_amount !== null && formData.total_amount < 0) {
      newErrors.total_amount = 'Tổng tiền không thể âm';
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

  const handleChange = (field: keyof OrderInsert, value: string | number) => {
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
          {order ? 'Chỉnh sửa đơn hàng' : 'Tạo đơn hàng mới'}
        </CardTitle>
        <CardDescription>
          {order ? 'Cập nhật thông tin đơn hàng' : 'Nhập thông tin để tạo đơn hàng mới'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="order_number">Số đơn hàng *</Label>
              <Input
                id="order_number"
                value={formData.order_number}
                onChange={(e) => handleChange('order_number', e.target.value)}
                placeholder="VD: ORD-2024-001"
                className={errors.order_number ? 'border-red-500' : ''}
              />
              {errors.order_number && (
                <p className="text-sm text-red-500">{errors.order_number}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="customer_id">ID Khách hàng *</Label>
              <Input
                id="customer_id"
                value={formData.customer_id || ''}
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
                  <SelectItem value="pending">Chờ xử lý</SelectItem>
                  <SelectItem value="confirmed">Đã xác nhận</SelectItem>
                  <SelectItem value="processing">Đang xử lý</SelectItem>
                  <SelectItem value="shipped">Đã giao</SelectItem>
                  <SelectItem value="delivered">Đã nhận</SelectItem>
                  <SelectItem value="cancelled">Đã hủy</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="order_date">Ngày đặt hàng *</Label>
              <Input
                id="order_date"
                type="date"
                value={formData.order_date || ''}
                onChange={(e) => handleChange('order_date', e.target.value)}
                className={errors.order_date ? 'border-red-500' : ''}
              />
              {errors.order_date && (
                <p className="text-sm text-red-500">{errors.order_date}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="total_amount">Tổng tiền (VND)</Label>
              <Input
                id="total_amount"
                type="number"
                value={formData.total_amount || ''}
                onChange={(e) => handleChange('total_amount', parseFloat(e.target.value) || 0)}
                placeholder="0"
                className={errors.total_amount ? 'border-red-500' : ''}
                min="0"
              />
              {errors.total_amount && (
                <p className="text-sm text-red-500">{errors.total_amount}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Ghi chú</Label>
            <Textarea
              id="notes"
              value={formData.notes || ''}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Nhập ghi chú cho đơn hàng..."
              rows={3}
            />
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
              {isLoading ? 'Đang xử lý...' : (order ? 'Cập nhật' : 'Tạo đơn hàng')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export const OrderCard: React.FC<{ order: Order }> = ({ order }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{order.order_number}</CardTitle>
        <CardDescription>{order.customer_id}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p><span className="font-medium">Trạng thái:</span> {order.status}</p>
          <p><span className="font-medium">Ngày đặt:</span> {order.order_date}</p>
          <p><span className="font-medium">Tổng tiền:</span> {new Intl.NumberFormat('vi-VN', {
            style: 'currency', currency: 'VND'
          }).format(order.total_amount || 0)}</p>
          {order.notes && (
            <p><span className="font-medium">Ghi chú:</span> {order.notes}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

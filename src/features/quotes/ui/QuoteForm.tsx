'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Quote, QuoteInsert } from '../api/quoteApi';

interface QuoteFormProps {
  quote?: Quote;
  onSubmit: (data: QuoteInsert) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export const QuoteForm: React.FC<QuoteFormProps> = ({
  quote,
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const [formData, setFormData] = useState<QuoteInsert>({
    quote_number: quote?.quote_number || '',
    customer_id: quote?.customer_id || '',
    status: quote?.status || 'draft',
    issue_date: quote?.issue_date || new Date().toISOString().split('T')[0],
    expiry_date: quote?.expiry_date || '',
    valid_for_days: quote?.valid_for_days || 30,
    subtotal: quote?.subtotal || 0,
    vat_rate: quote?.vat_rate || 0,
    vat_amount: quote?.vat_amount || 0,
    shipping_fee: quote?.shipping_fee || 0,
    total_amount: quote?.total_amount || 0,
    notes: quote?.notes || ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.quote_number.trim()) {
      newErrors.quote_number = 'Số báo giá là bắt buộc';
    }

    if (!formData.customer_id.trim()) {
      newErrors.customer_id = 'Khách hàng là bắt buộc';
    }

    if (!formData.issue_date) {
      newErrors.issue_date = 'Ngày tạo báo giá là bắt buộc';
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

  const handleChange = (field: keyof QuoteInsert, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Calculate expiry date based on valid_for_days
  const calculateExpiryDate = (days: number) => {
    const issueDate = new Date(formData.issue_date);
    const expiryDate = new Date(issueDate);
    expiryDate.setDate(issueDate.getDate() + days);

    const formattedExpiry = expiryDate.toISOString().split('T')[0];
    setFormData(prev => ({ ...prev, expiry_date: formattedExpiry }))
  };

  // Auto-calculate expiry date when valid_for_days changes
  useEffect(() => {
    if (formData.valid_for_days && formData.issue_date) {
      calculateExpiryDate(formData.valid_for_days);
    }
  }, [formData.valid_for_days, formData.issue_date]);

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>
          {quote ? 'Chỉnh sửa báo giá' : 'Tạo báo giá mới'}
        </CardTitle>
        <CardDescription>
          {quote ? 'Cập nhật thông tin báo giá' : 'Nhập thông tin để tạo báo giá mới'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quote_number">Số báo giá *</Label>
              <Input
                id="quote_number"
                value={formData.quote_number}
                onChange={(e) => handleChange('quote_number', e.target.value)}
                placeholder="VD: QUO-2024-001"
                className={errors.quote_number ? 'border-red-500' : ''}
              />
              {errors.quote_number && (
                <p className="text-sm text-red-500">{errors.quote_number}</p>
              )}
            </div>

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
                  <SelectItem value="draft">Nháp</SelectItem>
                  <SelectItem value="sent">Đã gửi</SelectItem>
                  <SelectItem value="accepted">Đã chấp nhận</SelectItem>
                  <SelectItem value="rejected">Đã từ chối</SelectItem>
                  <SelectItem value="expired">Đã hết hạn</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="issue_date">Ngày tạo *</Label>
              <Input
                id="issue_date"
                type="date"
                value={formData.issue_date}
                onChange={(e) => {
                  handleChange('issue_date', e.target.value);
                  // Recalculate expiry date when issue date changes
                  if (formData.valid_for_days) {
                    calculateExpiryDate(formData.valid_for_days);
                  }
                }}
                className={errors.issue_date ? 'border-red-500' : ''}
              />
              {errors.issue_date && (
                <p className="text-sm text-red-500">{errors.issue_date}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="valid_for_days">Có hiệu lực (ngày)</Label>
              <Input
                id="valid_for_days"
                type="number"
                value={formData.valid_for_days || ''}
                onChange={(e) => handleChange('valid_for_days', parseInt(e.target.value) || 30)}
                placeholder="30"
                min="1"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiry_date">Ngày hết hạn</Label>
              <Input
                id="expiry_date"
                type="date"
                value={formData.expiry_date}
                onChange={(e) => handleChange('expiry_date', e.target.value)}
                readOnly
                className="bg-gray-50"
              />
            </div>
          </div>

          {/* Financial fields */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="subtotal">Tổng tiền hàng (VND)</Label>
              <Input
                id="subtotal"
                type="number"
                value={formData.subtotal || ''}
                onChange={(e) => handleChange('subtotal', parseFloat(e.target.value) || 0)}
                placeholder="0"
                min="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="vat_rate">Thuế VAT (%)</Label>
              <Input
                id="vat_rate"
                type="number"
                value={formData.vat_rate || ''}
                onChange={(e) => handleChange('vat_rate', parseFloat(e.target.value) || 0)}
                placeholder="10"
                min="0"
                max="100"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="vat_amount">Tiền thuế VAT</Label>
              <Input
                id="vat_amount"
                type="number"
                value={formData.vat_amount || ''}
                onChange={(e) => handleChange('vat_amount', parseFloat(e.target.value) || 0)}
                placeholder="0"
                min="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="shipping_fee">Phí vận chuyển</Label>
              <Input
                id="shipping_fee"
                type="number"
                value={formData.shipping_fee || ''}
                onChange={(e) => handleChange('shipping_fee', parseFloat(e.target.value) || 0)}
                placeholder="0"
                min="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="total_amount">Tổng tiền</Label>
              <Input
                id="total_amount"
                type="number"
                value={formData.total_amount || ''}
                onChange={(e) => handleChange('total_amount', parseFloat(e.target.value) || 0)}
                placeholder="0"
                min="0"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Ghi chú</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Nhập ghi chú cho báo giá..."
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
              {isLoading ? 'Đang xử lý...' : (quote ? 'Cập nhật' : 'Tạo báo giá')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export const QuoteCard: React.FC<{ quote: Quote }> = ({ quote }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'default';
      case 'sent': return 'secondary';
      case 'accepted': return 'default';
      case 'rejected': return 'destructive';
      case 'expired': return 'outline';
      default: return 'default';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{quote.quote_number}</CardTitle>
        <CardDescription>{quote.customers?.name}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p><span className="font-medium">Trạng thái:</span> {quote.status}</p>
          <p><span className="font-medium">Ngày tạo:</span> {quote.issue_date}</p>
          <p><span className="font-medium">Hạn sử dụng:</span> {quote.expiry_date}</p>
          <p><span className="font-medium">Tổng tiền:</span> {new Intl.NumberFormat('vi-VN', {
            style: 'currency', currency: 'VND'
          }).format(quote.total_amount || 0)}</p>
          {quote.notes && (
            <p><span className="font-medium">Ghi chú:</span> {quote.notes}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

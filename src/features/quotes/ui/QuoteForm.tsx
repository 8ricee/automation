'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { CustomerSearch } from '@/components/ui/customer-search';
import { QuoteItemRow, QuoteItem } from './QuoteItemRow';
import { Quote, QuoteInsert, quoteApi } from '../api/quoteApi';
import { supabase } from '@/utils/supabase';

interface QuoteFormProps {
  quote?: Quote;
  onSubmit: (data: QuoteInsert & { items: QuoteItem[] }) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  inDialog?: boolean;
}

export const QuoteForm: React.FC<QuoteFormProps> = ({
  quote,
  onSubmit,
  onCancel,
  isLoading = false,
  inDialog = false
}) => {
  const [formData, setFormData] = useState<any>({
    quote_number: quote?.quote_number || '',
    customer_id: quote?.customer_id || '',
    status: quote?.status || 'draft',
    quote_date: quote?.quote_date || new Date().toISOString().split('T')[0],
    expiry_date: quote?.expiry_date || '',
    subtotal: quote?.subtotal || 0,
    tax_amount: quote?.tax_amount || 0,
    discount_amount: quote?.discount_amount || 0,
    total_amount: quote?.total_amount || 0,
    notes: quote?.notes || ''
  });

  const [customerName, setCustomerName] = useState<string>('');
  const [quoteItems, setQuoteItems] = useState<QuoteItem[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Debug customer selection
  React.useEffect(() => {
    console.log('Customer ID:', formData.customer_id);
    console.log('Customer Name:', customerName);
  }, [formData.customer_id, customerName]);

  // Auto-generate quote number for new quotes
  React.useEffect(() => {
    const generateQuoteNumber = async () => {
      if (!quote?.id && !formData.quote_number) {
        try {
          const nextQuoteNumber = await quoteApi.generateNextQuoteNumber();
          setFormData((prev: any) => ({ ...prev, quote_number: nextQuoteNumber }));
        } catch (error) {
          console.error('Error generating quote number:', error);
        }
      }
    };

    generateQuoteNumber();
  }, [quote?.id]);

  // Check for duplicate quote number
  const checkDuplicateQuoteNumber = async (quoteNumber: string): Promise<boolean> => {
    try {
      return await quoteApi.checkDuplicateQuoteNumber(quoteNumber, quote?.id);
    } catch (error) {
      console.error('Error checking duplicate quote number:', error);
      return false;
    }
  };

  const validateForm = async (): Promise<boolean> => {
    const newErrors: Record<string, string> = {};

    // Required fields validation
    if (!formData.quote_number.trim()) {
      newErrors.quote_number = 'Số báo giá là bắt buộc';
    } else if (!/^Q-\d{4}-\d{3}$/.test(formData.quote_number)) {
      newErrors.quote_number = 'Số báo giá phải có định dạng Q-YYYY-XXX';
    } else {
      // Check for duplicate quote number
      const isDuplicate = await checkDuplicateQuoteNumber(formData.quote_number);
      if (isDuplicate) {
        newErrors.quote_number = 'Số báo giá đã tồn tại';
      }
    }

    if (!formData.customer_id?.trim()) {
      newErrors.customer_id = 'Vui lòng chọn khách hàng';
    }

    if (!formData.quote_date) {
      newErrors.quote_date = 'Ngày tạo báo giá là bắt buộc';
    }

    // Status validation
    const validStatuses = ['draft', 'sent', 'accepted', 'rejected', 'expired'];
    if (formData.status && !validStatuses.includes(formData.status)) {
      newErrors.status = 'Trạng thái không hợp lệ';
    }

    // Financial validation
    if (formData.subtotal && formData.subtotal < 0) {
      newErrors.subtotal = 'Tổng tiền hàng không được âm';
    }

    if (formData.tax_amount && formData.tax_amount < 0) {
      newErrors.tax_amount = 'Tiền thuế không được âm';
    }

    if (formData.discount_amount && formData.discount_amount < 0) {
      newErrors.discount_amount = 'Tiền giảm giá không được âm';
    }

    if (formData.total_amount && formData.total_amount < 0) {
      newErrors.total_amount = 'Tổng tiền không được âm';
    }

    // Quote items validation
    if (quoteItems.length === 0) {
      newErrors.items = 'Báo giá phải có ít nhất một sản phẩm';
    } else {
      quoteItems.forEach((item, index) => {
        if (!item.product_id && !item.custom_description?.trim()) {
          newErrors[`items.${index}.product_id`] = 'Vui lòng chọn sản phẩm hoặc nhập mô tả';
        }
        if (!item.quantity || item.quantity <= 0) {
          newErrors[`items.${index}.quantity`] = 'Số lượng phải lớn hơn 0';
        }
        if (!item.price_perunit || item.price_perunit < 0) {
          newErrors[`items.${index}.price_perunit`] = 'Giá đơn vị không được âm';
        }
        if (item.discount_percentage < 0 || item.discount_percentage > 100) {
          newErrors[`items.${index}.discount_percentage`] = 'Giảm giá phải từ 0% đến 100%';
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!(await validateForm())) return;

    try {
      // Calculate totals from items
      const subtotal = quoteItems.reduce((sum, item) => sum + (item.total_price || 0), 0);
      const taxAmount = formData.tax_amount || 0;
      const discountAmount = formData.discount_amount || 0;
      const totalAmount = subtotal + taxAmount - discountAmount;

      const submitData = {
        ...formData,
        subtotal,
        tax_amount: taxAmount,
        discount_amount: discountAmount,
        total_amount: totalAmount,
        items: quoteItems
      };

      await onSubmit(submitData);
    } catch (error) {
      console.error('Lỗi submit form:', error);
    }
  };

  const handleChange = (field: string, value: string | number) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev: any) => ({ ...prev, [field]: '' }));
    }
    
    // Auto-calculate financial fields
    if (field === 'subtotal' || field === 'tax_amount' || field === 'discount_amount') {
      calculateFinancialTotals(field, value);
    }
  };

  const calculateFinancialTotals = (changedField: string, value: string | number) => {
    setFormData((prev: any) => {
      const subtotal = changedField === 'subtotal' ? (typeof value === 'number' ? value : parseFloat(value.toString()) || 0) : (prev.subtotal || 0);
      const taxAmount = changedField === 'tax_amount' ? (typeof value === 'number' ? value : parseFloat(value.toString()) || 0) : (prev.tax_amount || 0);
      const discountAmount = changedField === 'discount_amount' ? (typeof value === 'number' ? value : parseFloat(value.toString()) || 0) : (prev.discount_amount || 0);
      
      const totalAmount = subtotal + taxAmount - discountAmount;
      
      return {
        ...prev,
        [changedField]: value,
        total_amount: totalAmount
      };
    });
  };

  const handleCustomerSelect = (customer: any) => {
    console.log('handleCustomerSelect called with:', customer);
    if (customer) {
      setFormData((prev: any) => ({ ...prev, customer_id: customer.id }));
      setCustomerName(customer.name);
    } else {
      setFormData((prev: any) => ({ ...prev, customer_id: '' }));
      setCustomerName('');
    }
    // Clear error when customer is selected
    if (errors.customer_id) {
      setErrors((prev: any) => ({ ...prev, customer_id: '' }));
    }
  };

  const addQuoteItem = () => {
    const newItem: QuoteItem = {
      quantity: 1,
      price_perunit: 0,
      discount_percentage: 0,
      total_price: 0
    };
    setQuoteItems(prev => [...prev, newItem]);
  };

  const updateQuoteItem = (index: number, field: keyof QuoteItem, value: any) => {
    setQuoteItems(prev => {
      const newItems = prev.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      );
      
      // Calculate subtotal immediately after state update
      const subtotal = newItems.reduce((sum, item) => sum + (item.total_price || 0), 0);
      
      // Debug logging
      console.log('Quote items:', newItems);
      console.log('Calculated subtotal:', subtotal);
      
      setFormData((prevForm: any) => {
        const taxAmount = prevForm.tax_amount || 0;
        const discountAmount = prevForm.discount_amount || 0;
        const totalAmount = subtotal + taxAmount - discountAmount;
        
        return {
          ...prevForm,
          subtotal,
          total_amount: totalAmount
        };
      });
      
      return newItems;
    });
  };

  const calculateSubtotalFromItems = () => {
    const subtotal = quoteItems.reduce((sum, item) => sum + (item.total_price || 0), 0);
    setFormData((prev: any) => {
      const taxAmount = prev.tax_amount || 0;
      const discountAmount = prev.discount_amount || 0;
      const totalAmount = subtotal + taxAmount - discountAmount;
      
      return {
        ...prev,
        subtotal,
        total_amount: totalAmount
      };
    });
  };

  const removeQuoteItem = (index: number) => {
    setQuoteItems(prev => prev.filter((_, i) => i !== index));
    
    // Recalculate subtotal when items are removed
    setTimeout(() => {
      calculateSubtotalFromItems();
    }, 0);
  };

  // Calculate expiry date based on quote_date
  const calculateExpiryDate = (days: number) => {
    const quoteDate = new Date(formData.quote_date);
    const expiryDate = new Date(quoteDate);
    expiryDate.setDate(quoteDate.getDate() + days);

    const formattedExpiry = expiryDate.toISOString().split('T')[0];
    setFormData((prev: any) => ({ ...prev, expiry_date: formattedExpiry }))
  };

  // Auto-calculate expiry date when quote_date changes
  useEffect(() => {
    if (formData.quote_date) {
      calculateExpiryDate(30); // Default 30 days
    }
  }, [formData.quote_date]);

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Basic Information Section */}
      <div className="space-y-3">
        <h3 className="text-xs font-medium text-gray-700 border-b pb-1">Thông tin cơ bản</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="quote_number" className="text-xs font-medium h-6 flex items-center">Số báo giá *</Label>
                <Input
                  id="quote_number"
                  value={formData.quote_number}
                  onChange={(e) => handleChange('quote_number', e.target.value.toUpperCase())}
                  placeholder="VD: Q-2025-001"
                  className={`h-8 text-sm ${errors.quote_number ? 'border-red-500' : ''}`}
                />
                {errors.quote_number && (
                  <p className="text-xs text-red-500">{errors.quote_number}</p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="customer_id" className="text-xs font-medium h-6 flex items-center">Tên khách hàng *</Label>
                <CustomerSearch
                  value={formData.customer_id || ''}
                  onValueChange={handleCustomerSelect}
                  className={`h-8 text-sm ${errors.customer_id ? 'border-red-500' : ''}`}
                  maxDisplayLength={20}
                />
                {errors.customer_id && (
                  <p className="text-xs text-red-500">{errors.customer_id}</p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="quote_date" className="text-xs font-medium h-6 flex items-center">Ngày tạo *</Label>
                <Input
                  id="quote_date"
                  type="date"
                  value={formData.quote_date}
                  onChange={(e) => {
                    handleChange('quote_date', e.target.value);
                    // Recalculate expiry date when quote date changes
                    calculateExpiryDate(30);
                  }}
                  className={`h-8 text-sm ${errors.quote_date ? 'border-red-500' : ''}`}
                />
                {errors.quote_date && (
                  <p className="text-xs text-red-500">{errors.quote_date}</p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="expiry_date" className="text-xs font-medium h-6 flex items-center">Ngày hết hạn</Label>
                <Input
                  id="expiry_date"
                  type="date"
                  value={formData.expiry_date || ''}
                  onChange={(e) => handleChange('expiry_date', e.target.value)}
                  className="h-8 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Quote Items Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-medium text-gray-700 border-b pb-1 flex-1">Sản phẩm & Dịch vụ</h3>
              <Button
                type="button"
                onClick={addQuoteItem}
                className="h-7 px-3 text-xs"
                variant="outline"
              >
                + Thêm sản phẩm
              </Button>
            </div>
            
            {quoteItems.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-sm">
                Chưa có sản phẩm nào. Nhấn "Thêm sản phẩm" để bắt đầu.
              </div>
            ) : (
              <div className="space-y-3">
                
                {/* Items */}
                {quoteItems.map((item, index) => (
                  <QuoteItemRow
                    key={index}
                    item={item}
                    index={index}
                    onUpdate={updateQuoteItem}
                    onRemove={removeQuoteItem}
                    errors={errors}
                  />
                ))}
              </div>
            )}
            
            {errors.items && (
              <p className="text-xs text-red-500">{errors.items}</p>
            )}
          </div>

          {/* Financial Information Section */}
          <div className="space-y-3">
            <h3 className="text-xs font-medium text-gray-700 border-b pb-1">Thông tin tài chính</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="space-y-1">
                <Label htmlFor="subtotal" className="text-xs font-medium h-6 flex items-center">
                  Tổng tiền hàng (VND)
                </Label>
                <div className="h-8 flex items-center px-3 text-sm font-medium text-gray-700 bg-gray-100 rounded border">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(formData.subtotal || 0)}
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="tax_amount" className="text-xs font-medium h-6 flex items-center">
                  Thuế VAT (VND)
                </Label>
                <Input
                  id="tax_amount"
                  type="text"
                  value={formData.tax_amount ? new Intl.NumberFormat('vi-VN').format(formData.tax_amount) : ''}
                  onChange={(e) => {
                    const cleanValue = e.target.value.replace(/,/g, '');
                    const value = parseFloat(cleanValue) || 0;
                    handleChange('tax_amount', value);
                  }}
                  placeholder="0"
                  className={`h-8 text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${errors.tax_amount ? 'border-red-500' : ''}`}
                />
                {errors.tax_amount && (
                  <p className="text-xs text-red-500">{errors.tax_amount}</p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="discount_amount" className="text-xs font-medium h-6 flex items-center">
                  Giảm giá (VND)
                </Label>
                <Input
                  id="discount_amount"
                  type="text"
                  value={formData.discount_amount ? new Intl.NumberFormat('vi-VN').format(formData.discount_amount) : ''}
                  onChange={(e) => {
                    const cleanValue = e.target.value.replace(/,/g, '');
                    const value = parseFloat(cleanValue) || 0;
                    handleChange('discount_amount', value);
                  }}
                  placeholder="0"
                  className={`h-8 text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${errors.discount_amount ? 'border-red-500' : ''}`}
                />
                {errors.discount_amount && (
                  <p className="text-xs text-red-500">{errors.discount_amount}</p>
                )}
              </div>
            </div>

            {/* Total Amount and Status - Separate Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="total_amount" className="text-xs font-medium h-6 flex items-center">
                  Tổng tiền
                </Label>
                <div className="h-8 flex items-center px-3 text-sm font-semibold text-gray-800 bg-blue-50 rounded border border-blue-200">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(formData.total_amount || 0)}
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="status" className="text-xs font-medium h-6 flex items-center">Trạng thái</Label>
                <div className="h-8">
                  <Select
                    value={formData.status as string}
                    onValueChange={(value) => handleChange('status', value)}
                  >
                    <SelectTrigger className={`h-full text-sm w-full ${errors.status ? 'border-red-500' : ''}`}>
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
                {errors.status && (
                  <p className="text-xs text-red-500">{errors.status}</p>
                )}
              </div>
            </div>
          </div>

          {/* Notes Section */}
          <div className="space-y-3">
            <h3 className="text-xs font-medium text-gray-700 border-b pb-1">Ghi chú</h3>
            <div className="space-y-1">
              <Label htmlFor="notes" className="text-xs font-medium h-6 flex items-center">Ghi chú</Label>
              <Textarea
                id="notes"
                value={formData.notes || ''}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder="Nhập ghi chú cho báo giá..."
                rows={2}
                className="resize-none text-sm"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-3 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
              className="h-8 px-4 text-sm"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="h-8 px-4 text-sm"
            >
              {isLoading ? 'Đang xử lý...' : (quote ? 'Cập nhật' : 'Tạo báo giá')}
            </Button>
          </div>
        </form>
  );

  if (inDialog) {
    return formContent;
  }

  return (
    <Card className="w-full max-w-5xl">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">
          {quote ? 'Chỉnh sửa báo giá' : 'Tạo báo giá mới'}
        </CardTitle>
        <CardDescription className="text-xs">
          {quote ? 'Cập nhật thông tin báo giá' : 'Nhập thông tin để tạo báo giá mới'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {formContent}
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
        <CardDescription>{quote.customer_id}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p><span className="font-medium">Trạng thái:</span> {quote.status}</p>
          <p><span className="font-medium">Ngày tạo:</span> {quote.quote_date}</p>
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

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
import { supabase } from '@/lib/supabase';

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
  const [formData, setFormData] = useState<QuoteInsert>({
    quote_number: quote?.quote_number || '',
    customer_id: quote?.customer_id || '',
    status: quote?.status || 'draft',
    issue_date: quote?.issue_date || new Date().toISOString().split('T')[0],
    expiry_date: quote?.expiry_date || '',
    valid_for_days: quote?.valid_for_days || 30,
    subtotal: quote?.subtotal || 0,
    vat_rate: quote?.vat_rate || 10,
    vat_amount: quote?.vat_amount || 0,
    shipping_fee: quote?.shipping_fee || 0,
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
          setFormData(prev => ({ ...prev, quote_number: nextQuoteNumber }));
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
      const { data, error } = await supabase
        .from('quotes')
        .select('id')
        .eq('quote_number', quoteNumber)
        .neq('id', quote?.id || ''); // Exclude current quote when editing
      
      if (error) throw error;
      return data && data.length > 0;
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

    if (!formData.issue_date) {
      newErrors.issue_date = 'Ngày tạo báo giá là bắt buộc';
    }

    // Status validation
    const validStatuses = ['draft', 'sent', 'accepted', 'rejected', 'expired'];
    if (formData.status && !validStatuses.includes(formData.status)) {
      newErrors.status = 'Trạng thái không hợp lệ';
    }

    // Valid for days validation
    if (formData.valid_for_days && (formData.valid_for_days < 1 || formData.valid_for_days > 365)) {
      newErrors.valid_for_days = 'Số ngày có hiệu lực phải từ 1 đến 365 ngày';
    }

    // Financial validation
    if (formData.subtotal && formData.subtotal < 0) {
      newErrors.subtotal = 'Tổng tiền hàng không được âm';
    }

    if (formData.vat_rate && (formData.vat_rate < 0 || formData.vat_rate > 100)) {
      newErrors.vat_rate = 'Thuế VAT phải từ 0% đến 100%';
    }

    if (formData.vat_amount && formData.vat_amount < 0) {
      newErrors.vat_amount = 'Tiền thuế VAT không được âm';
    }

    if (formData.shipping_fee && formData.shipping_fee < 0) {
      newErrors.shipping_fee = 'Phí vận chuyển không được âm';
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
      const vatAmount = subtotal * (formData.vat_rate || 0);
      const totalAmount = subtotal + vatAmount + (formData.shipping_fee || 0);

      const submitData = {
        ...formData,
        subtotal,
        vat_amount: vatAmount,
        total_amount: totalAmount,
        items: quoteItems
      };

      await onSubmit(submitData);
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
    
    // Auto-calculate financial fields
    if (field === 'subtotal' || field === 'vat_rate' || field === 'shipping_fee') {
      calculateFinancialTotals(field, value);
    }
  };

  const calculateFinancialTotals = (changedField: keyof QuoteInsert, value: string | number) => {
    setFormData(prev => {
      const subtotal = changedField === 'subtotal' ? (typeof value === 'number' ? value : parseFloat(value.toString()) || 0) : (prev.subtotal || 0);
      const vatRate = changedField === 'vat_rate' ? (typeof value === 'number' ? value : parseFloat(value.toString()) || 0) : (prev.vat_rate || 0);
      const shippingFee = changedField === 'shipping_fee' ? (typeof value === 'number' ? value : parseFloat(value.toString()) || 0) : (prev.shipping_fee || 0);
      
      // Convert VAT rate from percentage to decimal (10% = 0.1)
      const vatAmount = subtotal * (vatRate / 100);
      const totalAmount = subtotal + vatAmount + shippingFee;
      
      return {
        ...prev,
        [changedField]: value,
        vat_amount: vatAmount,
        total_amount: totalAmount
      };
    });
  };

  const handleCustomerSelect = (customerId: string, customerName: string) => {
    console.log('handleCustomerSelect called with:', { customerId, customerName });
    if (customerId) {
      setFormData(prev => ({ ...prev, customer_id: customerId }));
      setCustomerName(customerName);
    } else {
      setFormData(prev => ({ ...prev, customer_id: '' }));
      setCustomerName('');
    }
    // Clear error when customer is selected
    if (errors.customer_id) {
      setErrors(prev => ({ ...prev, customer_id: '' }));
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
      
      setFormData(prevForm => {
        const vatAmount = subtotal * ((prevForm.vat_rate || 0) / 100);
        const totalAmount = subtotal + vatAmount + (prevForm.shipping_fee || 0);
        
        return {
          ...prevForm,
          subtotal,
          vat_amount: vatAmount,
          total_amount: totalAmount
        };
      });
      
      return newItems;
    });
  };

  const calculateSubtotalFromItems = () => {
    const subtotal = quoteItems.reduce((sum, item) => sum + (item.total_price || 0), 0);
    setFormData(prev => {
      // Convert VAT rate from percentage to decimal (10% = 0.1)
      const vatAmount = subtotal * ((prev.vat_rate || 0) / 100);
      const totalAmount = subtotal + vatAmount + (prev.shipping_fee || 0);
      
      return {
        ...prev,
        subtotal,
        vat_amount: vatAmount,
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
                  placeholder="Tìm kiếm khách hàng..."
                  className={`h-8 text-sm ${errors.customer_id ? 'border-red-500' : ''}`}
                  maxDisplayLength={20}
                />
                {errors.customer_id && (
                  <p className="text-xs text-red-500">{errors.customer_id}</p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="issue_date" className="text-xs font-medium h-6 flex items-center">Ngày tạo *</Label>
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
                  className={`h-8 text-sm ${errors.issue_date ? 'border-red-500' : ''}`}
                />
                {errors.issue_date && (
                  <p className="text-xs text-red-500">{errors.issue_date}</p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="valid_for_days" className="text-xs font-medium h-6 flex items-center">Có hiệu lực (ngày)</Label>
                <Input
                  id="valid_for_days"
                  type="number"
                  value={formData.valid_for_days || ''}
                  onChange={(e) => handleChange('valid_for_days', parseInt(e.target.value) || 30)}
                  placeholder="30"
                  min="1"
                  max="365"
                  className={`h-8 text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${errors.valid_for_days ? 'border-red-500' : ''}`}
                />
                {errors.valid_for_days && (
                  <p className="text-xs text-red-500">{errors.valid_for_days}</p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="expiry_date" className="text-xs font-medium h-6 flex items-center">Ngày hết hạn</Label>
                <Input
                  id="expiry_date"
                  type="date"
                  value={formData.expiry_date || ''}
                  onChange={(e) => handleChange('expiry_date', e.target.value)}
                  readOnly
                  className="h-8 text-sm bg-gray-50"
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
                <Label htmlFor="vat_rate" className="text-xs font-medium h-6 flex items-center">
                  Thuế VAT (%)
                </Label>
                <Input
                  id="vat_rate"
                  type="number"
                  value={formData.vat_rate?.toString() || ''}
                  onChange={(e) => handleChange('vat_rate', parseFloat(e.target.value) || 0)}
                  placeholder="10"
                  min="0"
                  max="100"
                  step="0.1"
                  className={`h-8 text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${errors.vat_rate ? 'border-red-500' : ''}`}
                />
                {errors.vat_rate && (
                  <p className="text-xs text-red-500">{errors.vat_rate}</p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="vat_amount" className="text-xs font-medium h-6 flex items-center">
                  Tiền thuế VAT
                </Label>
                <div className="h-8 flex items-center px-3 text-sm font-medium text-gray-700 bg-gray-100 rounded border">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(formData.vat_amount || 0)}
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="shipping_fee" className="text-xs font-medium h-6 flex items-center">
                  Phí vận chuyển
                </Label>
                <Input
                  id="shipping_fee"
                  type="text"
                  value={formData.shipping_fee ? new Intl.NumberFormat('vi-VN').format(formData.shipping_fee) : ''}
                  onChange={(e) => {
                    const cleanValue = e.target.value.replace(/,/g, '');
                    const value = parseFloat(cleanValue) || 0;
                    handleChange('shipping_fee', value);
                  }}
                  placeholder="0"
                  className={`h-8 text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${errors.shipping_fee ? 'border-red-500' : ''}`}
                />
                {errors.shipping_fee && (
                  <p className="text-xs text-red-500">{errors.shipping_fee}</p>
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

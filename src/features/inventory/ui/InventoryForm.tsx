'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { InventoryItem } from '../api/inventoryApi';

interface InventoryFormProps {
  inventoryItem?: InventoryItem;
  onSubmit: (data: { stock: number; price?: number; cost?: number }) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export const InventoryForm: React.FC<InventoryFormProps> = ({
  inventoryItem,
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const [formData, setFormData] = useState({
    stock: inventoryItem?.stock || 0,
    price: inventoryItem?.price || 0,
    cost: inventoryItem?.cost || 0
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (formData.stock < 0) {
      newErrors.stock = 'Tồn kho không thể âm';
    }

    if (formData.price < 0) {
      newErrors.price = 'Giá bán không thể âm';
    }

    if (formData.cost < 0) {
      newErrors.cost = 'Giá nhập không thể âm';
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

  const handleChange = (field: string, value: string) => {
    const numValue = parseInt(value) || 0;
    setFormData(prev => ({ ...prev, [field]: numValue }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { text: 'Hết hàng', variant: 'destructive' as const };
    if (stock <= 10) return { text: 'Tồn kho thấp', variant: 'destructive' as const };
    if (stock <= 50) return { text: 'Tồn kho trung bình', variant: 'secondary' as const };
    return { text: 'Tồn kho đủ', variant: 'default' as const };
  };

  const stockStatus = getStockStatus(formData.stock);

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Cập nhật tồn kho</CardTitle>
        <CardDescription>
          {inventoryItem ? `Cập nhật tồn kho cho ${inventoryItem.name}` : 'Điều chỉnh tồn kho và giá'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {inventoryItem && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-lg">{inventoryItem.name}</h3>
            <div className="grid grid-cols-2 gap-4 mt-2 text-sm">
              <div>
                <span className="text-gray-600">SKU:</span> {inventoryItem.sku || 'N/A'}
              </div>
              <div>
                <span className="text-gray-600">Loại:</span> {inventoryItem.type}
              </div>
              <div>
                <span className="text-gray-600">Nhà cung cấp:</span> {inventoryItem.supplier_name || 'N/A'}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-600">Trạng thái:</span>
                <Badge variant={inventoryItem.status === 'active' ? 'default' : 'secondary'}>
                  {inventoryItem.status === 'active' ? 'Hoạt động' : inventoryItem.status}
                </Badge>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stock">Tồn kho *</Label>
              <Input
                id="stock"
                type="number"
                value={formData.stock}
                onChange={(e) => handleChange('stock', e.target.value)}
                placeholder="Nhập số lượng tồn kho"
                className={errors.stock ? 'border-red-500' : ''}
                min="0"
              />
              {errors.stock && (
                <p className="text-sm text-red-500">{errors.stock}</p>
              )}
              <div className="flex items-center gap-2">
                <Badge variant={stockStatus.variant}>{stockStatus.text}</Badge>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Giá bán (VND)</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => handleChange('price', e.target.value)}
                placeholder="Nhập giá bán"
                className={errors.price ? 'border-red-500' : ''}
                min="0"
              />
              {errors.price && (
                <p className="text-sm text-red-500">{errors.price}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cost">Giá nhập (VND)</Label>
              <Input
                id="cost"
                type="number"
                value={formData.cost}
                onChange={(e) => handleChange('cost', e.target.value)}
                placeholder="Nhập giá nhập"
                className={errors.cost ? 'border-red-500' : ''}
                min="0"
              />
              {errors.cost && (
                <p className="text-sm text-red-500">{errors.cost}</p>
              )}
            </div>
          </div>

          {/* Profit calculation */}
          {formData.price > 0 && formData.cost > 0 && (
            <div className="p-4 bg-blue-50 rounded-lg border">
              <h4 className="font-medium text-blue-900 mb-2">Tính toán lợi nhuận</h4>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-blue-700">Lợi nhuận/đơn vị:</span>
                  <div className="font-medium">{new Intl.NumberFormat('vi-VN', {
                    style: 'currency', currency: 'VND'
                  }).format(formData.price - formData.cost)}</div>
                </div>
                <div>
                  <span className="text-blue-700">Tỷ lệ lợi nhuận:</span>
                  <div className="font-medium">
                    {formData.cost > 0 ? `${Math.round(((formData.price - formData.cost) / formData.cost) * 100)}%` : 'N/A'}
                  </div>
                </div>
                <div>
                  <span className="text-blue-700">Tổng giá trị tồn kho:</span>
                  <div className="font-medium">{new Intl.NumberFormat('vi-VN', {
                    style: 'currency', currency: 'VND'
                  }).format(formData.stock * formData.price)}</div>
                </div>
              </div>
            </div>
          )}

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
              {isLoading ? 'Đang cập nhật...' : 'Cập nhật tồn kho'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export const InventoryStatsCard: React.FC<{
  stats: {
    total_items: number;
    total_value: number;
    low_stock_count: number;
    active_items: number;
  };
}> = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground">Tổng sản phẩm</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total_items}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground">Tổng giá trị</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {new Intl.NumberFormat('vi-VN', {
              style: 'currency',
              currency: 'VND',
              minimumFractionDigits: 0
            }).format(stats.total_value)}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground">Tồn kho thấp</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{stats.low_stock_count}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground">Đang hoạt động</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{stats.active_items}</div>
        </CardContent>
      </Card>
    </div>
  );
};

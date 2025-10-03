// Sample UI component for products feature
"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import type { Product } from "@/lib/supabase-types";

interface ProductFormData {
  name?: string;
  description?: string;
  sku?: string;
  price?: number;
  cost?: number;
  stock?: number;
  status?: 'active' | 'inactive' | 'discontinued';
  type?: 'PHYSICAL' | 'DIGITAL' | 'SERVICE';
}

interface ProductFormProps {
  onSubmit: (data: ProductFormData) => void;
  initialData?: Product;
  isLoading?: boolean;
}

export function ProductForm({ onSubmit, initialData, isLoading = false }: ProductFormProps) {
  const [formData, setFormData] = useState<ProductFormData>({
    name: initialData?.name || '',
    description: initialData?.description || '',
    sku: initialData?.sku || '',
    price: initialData?.price || 0,
    cost: initialData?.cost || 0,
    stock: initialData?.stock || 0,
    status: initialData?.status || 'active',
    type: initialData?.type || 'PHYSICAL'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'Tên sản phẩm là bắt buộc';
    }

    if ((formData.price || 0) < 0) {
      newErrors.price = 'Giá bán không thể âm';
    }

    if ((formData.cost || 0) < 0) {
      newErrors.cost = 'Giá nhập không thể âm';
    }

    if ((formData.stock || 0) < 0) {
      newErrors.stock = 'Tồn kho không thể âm';
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

  const handleChange = (field: keyof ProductFormData, value: string | number) => {
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
          {initialData ? 'Chỉnh sửa sản phẩm' : 'Tạo sản phẩm mới'}
        </CardTitle>
        <CardDescription>
          {initialData ? 'Cập nhật thông tin sản phẩm' : 'Nhập thông tin để tạo sản phẩm mới'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Tên sản phẩm *</Label>
              <Input
                id="name"
                value={formData.name || ''}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Nhập tên sản phẩm"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="sku">Mã SKU</Label>
              <Input
                id="sku"
                value={formData.sku || ''}
                onChange={(e) => handleChange('sku', e.target.value)}
                placeholder="Nhập mã SKU"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Giá bán (VNĐ) *</Label>
              <Input
                id="price"
                type="number"
                value={formData.price || ''}
                onChange={(e) => handleChange('price', parseFloat(e.target.value) || 0)}
                placeholder="0"
                min="0"
                className={errors.price ? 'border-red-500' : ''}
              />
              {errors.price && (
                <p className="text-sm text-red-500">{errors.price}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cost">Giá nhập (VNĐ)</Label>
              <Input
                id="cost"
                type="number"
                value={formData.cost || ''}
                onChange={(e) => handleChange('cost', parseFloat(e.target.value) || 0)}
                placeholder="0"
                min="0"
                className={errors.cost ? 'border-red-500' : ''}
              />
              {errors.cost && (
                <p className="text-sm text-red-500">{errors.cost}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock">Tồn kho</Label>
              <Input
                id="stock"
                type="number"
                value={formData.stock || ''}
                onChange={(e) => handleChange('stock', parseInt(e.target.value) || 0)}
                placeholder="0"
                min="0"
                className={errors.stock ? 'border-red-500' : ''}
              />
              {errors.stock && (
                <p className="text-sm text-red-500">{errors.stock}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Trạng thái</Label>
              <Select
                value={formData.status as string}
                onValueChange={(value) => handleChange('status', value as 'active' | 'inactive' | 'discontinued')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Hoạt động</SelectItem>
                  <SelectItem value="inactive">Tạm dừng</SelectItem>
                  <SelectItem value="discontinued">Ngừng bán</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Loại sản phẩm</Label>
              <Select
                value={formData.type as string}
                onValueChange={(value) => handleChange('type', value as 'PHYSICAL' | 'DIGITAL' | 'SERVICE')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn loại sản phẩm" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PHYSICAL">Hàng hóa</SelectItem>
                  <SelectItem value="DIGITAL">Sản phẩm số</SelectItem>
                  <SelectItem value="SERVICE">Dịch vụ</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Mô tả</Label>
            <Textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Nhập mô tả sản phẩm..."
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? 'Đang xử lý...' : (initialData ? 'Cập nhật' : 'Tạo sản phẩm')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export const ProductCard = () => null;

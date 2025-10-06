'use client';

import React from 'react';
import { GenericForm } from '@/components/forms/generic-form';
import { validationRules } from '@/lib/validation';
import type { Product, ProductInsert } from '../api/productApi';

interface ProductFormProps {
  onSubmit: (data: ProductInsert) => Promise<void>;
  initialData?: Product;
  isLoading?: boolean;
}

export function ProductForm({ onSubmit, initialData, isLoading = false }: ProductFormProps) {
  const fields = [
    {
      name: 'name',
      label: 'Tên sản phẩm',
      type: 'text' as const,
      required: true,
      placeholder: 'Nhập tên sản phẩm'
    },
    {
      name: 'description',
      label: 'Mô tả',
      type: 'textarea' as const,
      placeholder: 'Nhập mô tả sản phẩm'
    },
    {
      name: 'sku',
      label: 'Mã SKU',
      type: 'text' as const,
      placeholder: 'Nhập mã SKU'
    },
    {
      name: 'price',
      label: 'Giá bán (VNĐ)',
      type: 'number' as const,
      required: true,
      min: 0,
      step: 0.01
    },
    {
      name: 'cost',
      label: 'Giá nhập (VNĐ)',
      type: 'number' as const,
      min: 0,
      step: 0.01
    },
    {
      name: 'stock_quantity',
      label: 'Tồn kho',
      type: 'number' as const,
      min: 0
    },
    {
      name: 'status',
      label: 'Trạng thái',
      type: 'select' as const,
      required: true,
      options: [
        { value: 'active', label: 'Hoạt động' },
        { value: 'inactive', label: 'Tạm dừng' },
        { value: 'discontinued', label: 'Ngừng bán' }
      ]
    },
    {
      name: 'category',
      label: 'Loại sản phẩm',
      type: 'select' as const,
      required: true,
      options: [
        { value: 'PHYSICAL', label: 'Hàng hóa' },
        { value: 'DIGITAL', label: 'Sản phẩm số' },
        { value: 'SERVICE', label: 'Dịch vụ' }
      ]
    }
  ];

  return (
    <GenericForm
      fields={fields}
      initialData={initialData}
      validationRules={{
        name: [
          validationRules.required,
          (value: unknown) => {
            if (typeof value === 'string' && value.length < 2) {
              return 'Tên sản phẩm phải có ít nhất 2 ký tự';
            }
            return null;
          }
        ],
        price: [
          validationRules.required,
          (value: unknown) => {
            if (typeof value === 'number' && value < 0) {
              return 'Giá không thể âm';
            }
            return null;
          }
        ],
        cost: [
          validationRules.required,
          (value: unknown) => {
            if (typeof value === 'number' && value < 0) {
              return 'Chi phí không thể âm';
            }
            return null;
          }
        ],
        stock: [
          validationRules.required,
          (value: unknown) => {
            if (typeof value === 'number' && value < 0) {
              return 'Số lượng tồn kho không thể âm';
            }
            return null;
          }
        ],
        sku: [
          validationRules.required,
          (value: unknown) => {
            if (typeof value === 'string' && value.length < 3) {
              return 'SKU phải có ít nhất 3 ký tự';
            }
            return null;
          }
        ]
      }}
      onSubmit={onSubmit}
      isLoading={isLoading}
      title={initialData ? 'Chỉnh sửa sản phẩm' : 'Tạo sản phẩm mới'}
      submitLabel={initialData ? 'Cập nhật' : 'Tạo sản phẩm'}
    />
  );
}

export const ProductCard = () => null;

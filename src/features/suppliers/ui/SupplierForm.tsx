"use client";

import React from "react";
import { GenericForm, FormField } from "@/components/forms/generic-form";
import type { Supplier } from "@/lib/supabase-types";

interface SupplierFormProps {
  onSubmit: (data: unknown) => Promise<void>;
  initialData?: Partial<Supplier>;
  isLoading?: boolean;
  onCancel?: () => void;
}

export function SupplierForm({ onSubmit, initialData, isLoading = false, onCancel }: SupplierFormProps) {
  const fields: FormField[] = [
    { name: 'name', label: 'Tên nhà cung cấp', type: 'text', required: true, placeholder: 'Nhập tên nhà cung cấp' },
    { name: 'company', label: 'Tên công ty', type: 'text', placeholder: 'Nhập tên công ty' },
    { name: 'contact_person', label: 'Người liên hệ', type: 'text', placeholder: 'Nhập tên người liên hệ' },
    { name: 'email', label: 'Email', type: 'email', placeholder: 'Nhập email' },
    { name: 'phone', label: 'Số điện thoại', type: 'text', placeholder: 'Nhập số điện thoại' },
    { name: 'website', label: 'Website', type: 'text', placeholder: 'https://example.com' },
    { name: 'address', label: 'Địa chỉ', type: 'textarea', placeholder: 'Nhập địa chỉ...' },
    { name: 'city', label: 'Thành phố', type: 'text', placeholder: 'Nhập thành phố' },
    { name: 'state', label: 'Tỉnh/Thành', type: 'text', placeholder: 'Nhập tỉnh/thành' },
    { name: 'postal_code', label: 'Mã bưu điện', type: 'text', placeholder: 'Nhập mã bưu điện' },
    { name: 'country', label: 'Quốc gia', type: 'text', placeholder: 'Nhập quốc gia' },
    { name: 'payment_terms', label: 'Điều khoản thanh toán', type: 'text', placeholder: 'Ví dụ: Net 30' },
    {
      name: 'status',
      label: 'Trạng thái',
      type: 'select',
      options: [
        { value: 'active', label: 'Hoạt động' },
        { value: 'inactive', label: 'Tạm dừng' },
      ],
    },
    { name: 'notes', label: 'Ghi chú', type: 'textarea', placeholder: 'Nhập ghi chú...' },
  ];

  return (
    <GenericForm
      fields={fields}
      onSubmit={onSubmit}
      initialData={initialData}
      isLoading={isLoading}
      onCancel={onCancel}
    />
  );
}

export const SupplierCard = () => null;

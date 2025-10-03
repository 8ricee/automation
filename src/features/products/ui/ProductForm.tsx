// Sample UI component for products feature
"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

interface ProductFormProps {
  onSubmit: (data: any) => void;
  initialData?: any;
}

export function ProductForm({ onSubmit, initialData }: ProductFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({});
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Tên sản phẩm</Label>
        <Input id="name" placeholder="Nhập tên sản phẩm" />
      </div>
      <div>
        <Label htmlFor="price">Giá</Label>
        <Input id="price" type="number" placeholder="Nhập giá" />
      </div>
      <div>
        <Label htmlFor="type">Loại</Label>
        <Select>
          <option value="PHYSICAL">Hàng hóa</option>
          <option value="SERVICE">Dịch vụ</option>
        </Select>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="submit">Lưu</Button>
      </div>
    </form>
  );
}

export const ProductCard = () => null;

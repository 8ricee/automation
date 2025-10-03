// Sample UI component for customers feature
"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CustomerFormData {
  name?: string;
  email?: string;
  company?: string;
}

interface CustomerFormProps {
  onSubmit: (data: CustomerFormData) => void;
  initialData?: CustomerFormData;
}

export function CustomerForm({ onSubmit }: CustomerFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    onSubmit({});
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Tên khách hàng</Label>
        <Input id="name" placeholder="Nhập tên khách hàng" />
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" placeholder="Nhập email" />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="submit">Lưu</Button>
      </div>
    </form>
  );
}

// Placeholder for future components
export const CustomerCard = () => null;

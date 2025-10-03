"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Customer, CustomersAPI } from "@/lib/customers-api";
import { Plus, Edit2, Trash2 } from "lucide-react";

const customerSchema = z.object({
  name: z.string().min(2, "Tên phải có ít nhất 2 ký tự"),
  email: z.string().email("Email không hợp lệ"),
  company: z.string().optional(),
  status: z.enum(["active", "inactive", "pending"]).default("active"),
  billing_address: z.string().optional(),
  shipping_address: z.string().optional(),
  tax_code: z.string().optional(),
});

type CustomerFormData = z.infer<typeof customerSchema>;

interface CustomerFormAdvancedProps {
  customer?: Customer;
  mode: "create" | "edit";
  onSuccess?: () => void;
  trigger?: React.ReactNode;
}

export function CustomerFormAdvanced({ 
  customer, 
  mode, 
  onSuccess, 
  trigger 
}: CustomerFormAdvancedProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const form = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: customer || {
      name: "",
      email: "",
      company: "",
      status: "active",
      billing_address: "",
      shipping_address: "",
      tax_code: "",
    },
  });

  async function onSubmit(data: CustomerFormData) {
    setLoading(true);
    try {
      if (mode === "create") {
        await CustomersAPI.create(data);
        toast.success("✅ Đã tạo khách hàng thành công!");
      } else if (customer) {
        await CustomersAPI.update({
          id: customer.id,
          ...data,
        });
        toast.success("✅ Đã cập nhật khách hàng thành công!");
      }
      
      setOpen(false);
      form.reset();
      onSuccess?.();
    } catch (error) {
      toast.error(`❌ Lỗi: ${(error as Error).message}`);
    } finally {
      setLoading(false);
    }
  }

  const defaultTrigger = (
    <Button variant={mode === "create" ? "default" : "ghost"} size="sm">
      {mode === "create" ? (
        <>
          <Plus className="w-4 h-4 mr-2" />
          Thêm khách hàng
        </>
      ) : (
        <Edit2 className="w-4 h-4" />
      )}
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Thêm khách hàng mới" : `Chỉnh sửa khách hàng`}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Tên khách hàng *</Label>
              <Input
                id="name"
                {...form.register("name")}
                placeholder="Nhập tên khách hàng"
              />
              {form.formState.errors.name && (
                <p className="text-sm text-red-600">{form.formState.errors.name.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                {...form.register("email")}
                placeholder="email@example.com"
              />
              {form.formState.errors.email && (
                <p className="text-sm text-red-600">{form.formState.errors.email.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company">Công ty</Label>
              <Input
                id="company"
                {...form.register("company")}
                placeholder="Tên công ty"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">Trạng thái</Label>
              <Select 
                value={form.getValues("status")} 
                onValueChange={(value) => form.setValue("status", value as "active" | "inactive" | "pending")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Hoạt động</SelectItem>
                  <SelectItem value="inactive">Không hoạt động</SelectItem>
                  <SelectItem value="pending">Chờ duyệt</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tax_code">Mã số thuế</Label>
            <Input
              id="tax_code"
              {...form.register("tax_code")}
              placeholder="Mã số thuế"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="billing_address">Địa chỉ thanh toán</Label>
            <Textarea
              id="billing_address"
              {...form.register("billing_address")}
              placeholder="Địa chỉ xuất hóa đơn"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="shipping_address">Địa chỉ giao hàng</Label>
            <Textarea
              id="shipping_address"
              {...form.register("shipping_address")}
              placeholder="Địa chỉ nhận hàng"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Đang xử lý..." : (mode === "create" ? "Tạo khách hàng" : "Cập nhật")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface CustomerRowActionsProps {
  customer: Customer;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function CustomerRowActions({ customer, onEdit, onDelete }: CustomerRowActionsProps) {
  async function handleDelete() {
    if (!confirm(`Bạn có chắc chắn muốn xóa khách hàng "${customer.name}"?`)) {
      return;
    }
    
    try {
      await CustomersAPI.delete(customer.id);
      toast.success("✅ Đã xóa khách hàng thành công!");
      onDelete?.();
    } catch (error) {
      toast.error(`❌ Lỗi: ${(error as Error).message}`);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <CustomerFormAdvanced 
        customer={customer} 
        mode="edit" 
        onSuccess={onEdit}
        trigger={
          <Button variant="ghost" size="sm">
            <Edit2 className="w-4 h-4" />
          </Button>
        }
      />
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={handleDelete}
        className="text-red-600 hover:text-red-700"
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
}

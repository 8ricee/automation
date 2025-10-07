"use client";

import * as React from "react";
import { PlusCircle } from "lucide-react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";
import { RequirePermission } from "@/components/ui/permission-guard";

type Field = { 
  name: string; 
  label: string; 
  type?: string;
  options?: { value: string; label: string }[];
  min?: number;
  max?: number;
};

interface CreateRecordButtonProps<T> {
  title: string;
  fields: Field[];
  schema?: z.ZodType<T>;
  onCreate?: (values: Partial<T>) => void;
  resource: string; // Resource name để kiểm tra permission (e.g., 'customers', 'products')
}

export function CreateRecordButton<T>({ title, fields, schema, onCreate, resource }: CreateRecordButtonProps<T>) {
  const [open, setOpen] = React.useState(false);
  const [values, setValues] = React.useState<Record<string, string>>({});

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const data = values as unknown as Partial<T>;
    if (schema) {
      const res = schema.safeParse(data);
      if (!res.success) {
        toast.error("Dữ liệu không hợp lệ");
        return;
      }
    }
    onCreate?.(data);
    // Don't show toast here, let the parent component handle it
    setOpen(false);
    setValues({});
  }

  return (
    <RequirePermission permission={`${resource}:create`}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="h-8 w-8 sm:w-auto sm:gap-2">
                <PlusCircle className="h-4 w-4" />
                <span className="hidden sm:inline">Thêm mới</span>
              </Button>
            </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            {fields.map((f) => (
              <div key={f.name} className="space-y-2">
                <Label htmlFor={f.name}>{f.label}</Label>
                {f.type === 'select' && f.options ? (
                  <Select
                    value={values[f.name] ?? ""}
                    onValueChange={(value) => setValues((s) => ({ ...s, [f.name]: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={`Chọn ${f.label.toLowerCase()}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {f.options.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id={f.name}
                    type={f.type ?? "text"}
                    value={values[f.name] ?? ""}
                    onChange={(e) => setValues((s) => ({ ...s, [f.name]: e.target.value }))}
                    min={f.min}
                    max={f.max}
                  />
                )}
              </div>
            ))}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Hủy</Button>
              <Button type="submit">Lưu</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
        </TooltipTrigger>
        <TooltipContent>
          <p>Thêm mới</p>
        </TooltipContent>
      </Tooltip>
    </RequirePermission>
  );
}



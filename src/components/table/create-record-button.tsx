"use client";

import * as React from "react";
import { PlusCircle } from "lucide-react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";

type Field = { name: string; label: string; type?: string };

interface CreateRecordButtonProps<T> {
  title: string;
  fields: Field[];
  schema?: z.ZodType<T>;
  onCreate?: (values: Partial<T>) => void;
}

export function CreateRecordButton<T>({ title, fields, schema, onCreate }: CreateRecordButtonProps<T>) {
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
    toast.success("Đã tạo bản ghi (mock)");
    setOpen(false);
    setValues({});
  }

  return (
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
              <Input
                id={f.name}
                type={f.type ?? "text"}
                value={values[f.name] ?? ""}
                onChange={(e) => setValues((s) => ({ ...s, [f.name]: e.target.value }))}
              />
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
  );
}



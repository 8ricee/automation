'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { validateForm, ValidationRules } from '@/lib/validation';

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'textarea' | 'select' | 'date';
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  min?: number;
  max?: number;
  step?: number;
}

export interface GenericFormProps<T> {
  fields: FormField[];
  initialData?: Partial<T>;
  validationRules?: ValidationRules;
  onSubmit: (data: T) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  submitLabel?: string;
  cancelLabel?: string;
  title?: string;
  className?: string;
}

export function GenericForm<T extends Record<string, any>>({
  fields,
  initialData = {},
  validationRules = {},
  onSubmit,
  onCancel,
  isLoading = false,
  submitLabel = 'Lưu',
  cancelLabel = 'Hủy',
  title,
  className
}: GenericFormProps<T>) {
  const [formData, setFormData] = useState<T>(initialData as T);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setFormData(initialData as T);
  }, [initialData]);

  const validateFormData = (): boolean => {
    const validationErrors = validateForm(formData, validationRules);
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  const handleChange = (fieldName: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
    
    // Clear error when user starts typing
    if (errors[fieldName]) {
      setErrors(prev => ({ ...prev, [fieldName]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateFormData()) {
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const renderField = (field: FormField) => {
    const hasError = !!errors[field.name];
    const errorMessage = errors[field.name];

    switch (field.type) {
      case 'textarea':
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name}>
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Textarea
              id={field.name}
              value={formData[field.name] || ''}
              onChange={(e) => handleChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              className={hasError ? 'border-red-500' : ''}
              rows={4}
            />
            {errorMessage && <p className="text-sm text-red-500">{errorMessage}</p>}
          </div>
        );

      case 'select':
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name}>
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Select
              value={formData[field.name] || ''}
              onValueChange={(value) => handleChange(field.name, value)}
            >
              <SelectTrigger className={hasError ? 'border-red-500' : ''}>
                <SelectValue placeholder={field.placeholder} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errorMessage && <p className="text-sm text-red-500">{errorMessage}</p>}
          </div>
        );

      case 'number':
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name}>
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Input
              id={field.name}
              type="number"
              value={formData[field.name] || ''}
              onChange={(e) => handleChange(field.name, parseFloat(e.target.value) || 0)}
              placeholder={field.placeholder}
              className={hasError ? 'border-red-500' : ''}
              min={field.min}
              max={field.max}
              step={field.step}
            />
            {errorMessage && <p className="text-sm text-red-500">{errorMessage}</p>}
          </div>
        );

      case 'date':
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name}>
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Input
              id={field.name}
              type="date"
              value={formData[field.name] || ''}
              onChange={(e) => handleChange(field.name, e.target.value)}
              className={hasError ? 'border-red-500' : ''}
            />
            {errorMessage && <p className="text-sm text-red-500">{errorMessage}</p>}
          </div>
        );

      default:
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name}>
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Input
              id={field.name}
              type={field.type}
              value={formData[field.name] || ''}
              onChange={(e) => handleChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              className={hasError ? 'border-red-500' : ''}
            />
            {errorMessage && <p className="text-sm text-red-500">{errorMessage}</p>}
          </div>
        );
    }
  };

  return (
    <Card className={`w-full max-w-2xl ${className || ''}`}>
      {title && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fields.map(renderField)}
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
              >
                {cancelLabel}
              </Button>
            )}
            <Button
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? 'Đang xử lý...' : submitLabel}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

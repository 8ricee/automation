export interface ValidationRule {
  (value: unknown): string | null;
}

export interface ValidationRules {
  [key: string]: ValidationRule[];
}

// Common validation rules
export const validationRules = {
  required: (value: unknown): string | null => {
    if (value === null || value === undefined || value === '') {
      return 'Trường này là bắt buộc';
    }
    if (typeof value === 'string' && !value.trim()) {
      return 'Trường này là bắt buộc';
    }
    return null;
  },

  email: (value: string): string | null => {
    if (!value) return null;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value) ? null : 'Email không hợp lệ';
  },

  minLength: (min: number) => (value: string): string | null => {
    if (!value) return null;
    return value.length >= min ? null : `Tối thiểu ${min} ký tự`;
  },

  maxLength: (max: number) => (value: string): string | null => {
    if (!value) return null;
    return value.length <= max ? null : `Tối đa ${max} ký tự`;
  },

  min: (min: number) => (value: number): string | null => {
    if (value === null || value === undefined) return null;
    return value >= min ? null : `Giá trị phải lớn hơn hoặc bằng ${min}`;
  },

  max: (max: number) => (value: number): string | null => {
    if (value === null || value === undefined) return null;
    return value <= max ? null : `Giá trị phải nhỏ hơn hoặc bằng ${max}`;
  },

  positive: (value: number): string | null => {
    if (value === null || value === undefined) return null;
    return value >= 0 ? null : 'Giá trị không thể âm';
  },

  phone: (value: string): string | null => {
    if (!value) return null;
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
    return phoneRegex.test(value) ? null : 'Số điện thoại không hợp lệ';
  },

  url: (value: string): string | null => {
    if (!value) return null;
    try {
      new URL(value);
      return null;
    } catch {
      return 'URL không hợp lệ';
    }
  },

  date: (value: string): string | null => {
    if (!value) return null;
    const date = new Date(value);
    return isNaN(date.getTime()) ? 'Ngày không hợp lệ' : null;
  },

  futureDate: (value: string): string | null => {
    if (!value) return null;
    const date = new Date(value);
    const now = new Date();
    return date > now ? null : 'Ngày phải trong tương lai';
  },

  pastDate: (value: string): string | null => {
    if (!value) return null;
    const date = new Date(value);
    const now = new Date();
    return date < now ? null : 'Ngày phải trong quá khứ';
  },

  oneOf: (options: unknown[]) => (value: unknown): string | null => {
    if (!value) return null;
    return options.includes(value) ? null : `Giá trị phải là một trong: ${options.join(', ')}`;
  },

  pattern: (regex: RegExp, message: string) => (value: string): string | null => {
    if (!value) return null;
    return regex.test(value) ? null : message;
  }
};

// Generic validation function
export function validateField(value: unknown, rules: ValidationRule[]): string | null {
  for (const rule of rules) {
    const error = rule(value);
    if (error) return error;
  }
  return null;
}

// Validate entire form
export function validateForm<T extends Record<string, unknown>>(
  data: T, 
  rules: ValidationRules
): Record<keyof T, string> {
  const errors: Record<keyof T, string> = {} as Record<keyof T, string>;

  for (const [field, fieldRules] of Object.entries(rules)) {
    const error = validateField(data[field], fieldRules);
    if (error) {
      errors[field as keyof T] = error;
    }
  }

  return errors;
}

// Common validation schemas
export const commonSchemas = {
  customer: {
    name: [validationRules.required, validationRules.minLength(2)],
    email: [validationRules.required, validationRules.email],
    phone: [validationRules.phone],
    company: [validationRules.minLength(2)]
  },

  product: {
    name: [validationRules.required, validationRules.minLength(2)],
    price: [validationRules.required, validationRules.positive],
    cost: [validationRules.positive],
    stock: [validationRules.positive],
    sku: [validationRules.minLength(3)]
  },

  employee: {
    name: [validationRules.required, validationRules.minLength(2)],
    email: [validationRules.required, validationRules.email],
    phone: [validationRules.phone],
    department: [validationRules.required],
    role: [validationRules.required]
  },

  project: {
    title: [validationRules.required, validationRules.minLength(2)],
    description: [validationRules.minLength(10)],
    progress: [validationRules.min(0), validationRules.max(100)],
    budget: [validationRules.positive]
  },

  order: {
    order_number: [validationRules.required, validationRules.minLength(5)],
    customer_id: [validationRules.required],
    total_amount: [validationRules.positive],
    status: [validationRules.oneOf(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'])]
  },

  quote: {
    quote_number: [validationRules.required, validationRules.pattern(/^Q-\d{4}-\d{3}$/, 'Số báo giá phải có định dạng Q-YYYY-XXX')],
    customer_id: [validationRules.required],
    issue_date: [validationRules.required, validationRules.date],
    valid_for_days: [validationRules.min(1), validationRules.max(365)]
  }
};

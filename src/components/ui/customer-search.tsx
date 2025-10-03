'use client';

import * as React from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { CustomersAPI } from '@/lib/customers-api';
import { Customer } from '@/lib/supabase-types';

interface CustomerSearchProps {
  value?: string;
  onValueChange: (customerId: string, customerName: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  maxDisplayLength?: number;
}

export function CustomerSearch({
  value,
  onValueChange,
  placeholder = "Tìm kiếm khách hàng...",
  className,
  disabled = false,
  maxDisplayLength = 30,
}: CustomerSearchProps) {
  const [open, setOpen] = React.useState(false);
  const [customers, setCustomers] = React.useState<Customer[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedCustomer, setSelectedCustomer] = React.useState<Customer | null>(null);

  // Load customers on component mount
  React.useEffect(() => {
    loadCustomers();
  }, []);

  // Load customers based on search query
  React.useEffect(() => {
    if (searchQuery.length > 0) {
      const timeoutId = setTimeout(() => {
        searchCustomers(searchQuery);
      }, 300);
      return () => clearTimeout(timeoutId);
    } else {
      loadCustomers();
    }
  }, [searchQuery]);

  // Set selected customer when value changes
  React.useEffect(() => {
    if (value && customers.length > 0) {
      const customer = customers.find(c => c.id === value);
      setSelectedCustomer(customer || null);
    } else {
      setSelectedCustomer(null);
    }
  }, [value, customers]);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const data = await CustomersAPI.getAll();
      setCustomers(data);
    } catch (error) {
      console.error('Error loading customers:', error);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  const searchCustomers = async (query: string) => {
    try {
      setLoading(true);
      const data = await CustomersAPI.search(query);
      setCustomers(data);
    } catch (error) {
      console.error('Error searching customers:', error);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (customer: Customer) => {
    setSelectedCustomer(customer);
    onValueChange(customer.id, customer.name);
    setOpen(false);
  };

  // Function to truncate text with ellipsis
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between h-8",
            !selectedCustomer && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          {selectedCustomer ? (
            <div className="flex items-center min-w-0 flex-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="font-medium text-sm leading-tight cursor-help truncate">
                    {truncateText(selectedCustomer.name, maxDisplayLength)}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{selectedCustomer.name}</p>
                </TooltipContent>
              </Tooltip>
            </div>
          ) : (
            <span className="text-left flex-1">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-0 flex-shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command>
          <CommandInput
            placeholder="Tìm kiếm theo tên hoặc công ty..."
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandList>
            {loading ? (
              <CommandEmpty>Đang tải...</CommandEmpty>
            ) : customers.length === 0 ? (
              <CommandEmpty>Không tìm thấy khách hàng nào.</CommandEmpty>
            ) : (
              <CommandGroup>
                {customers.map((customer) => (
                  <CommandItem
                    key={customer.id}
                    value={`${customer.name} ${customer.company || ''}`}
                    onSelect={() => handleSelect(customer)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedCustomer?.id === customer.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex flex-col">
                      <span className="font-medium">{customer.name}</span>
                      {customer.company && (
                        <span className="text-xs text-muted-foreground">
                          {customer.company}
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {customer.email}
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

'use client';

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export interface SearchableItem {
  id: string;
  [key: string]: unknown;
}

export interface GenericSearchProps<T extends SearchableItem> {
  value?: string;
  onValueChange: (item: T | null) => void;
  searchFunction: (query: string) => Promise<T[]>;
  displayField: keyof T;
  searchFields: (keyof T)[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  maxDisplayLength?: number;
  emptyMessage?: string;
  loadingMessage?: string;
}

export function GenericSearch<T extends SearchableItem>({
  value,
  onValueChange,
  searchFunction,
  displayField,
  placeholder = "Tìm kiếm...",
  className,
  disabled = false,
  maxDisplayLength = 30,
  emptyMessage = "Không tìm thấy kết quả",
  loadingMessage = "Đang tải..."
}: GenericSearchProps<T>) {
  const [open, setOpen] = React.useState(false);
  const [items, setItems] = React.useState<T[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");

  const selectedItem = React.useMemo(() => {
    return items.find(item => item.id === value) || null;
  }, [items, value]);

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Debounced search
  React.useEffect(() => {
    const timeoutId = setTimeout(async () => {
      setLoading(true);
      try {
        const results = await searchFunction(searchQuery);
        setItems(results);
      } catch (error) {
        console.error('Error searching:', error);
        setItems([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, searchFunction]);

  // Load initial data
  React.useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        const results = await searchFunction('');
        setItems(results);
      } catch (error) {
        console.error('Error loading initial data:', error);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [searchFunction]);

  const handleSelect = (item: T) => {
    onValueChange(item);
    setOpen(false);
  };

  const displayValue = selectedItem ? 
    String(selectedItem[displayField]) : 
    '';

  return (
    <TooltipProvider>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full justify-between",
              !selectedItem && "text-muted-foreground",
              className
            )}
            disabled={disabled}
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="truncate">
                  {selectedItem ? truncateText(displayValue, maxDisplayLength) : placeholder}
                </span>
              </TooltipTrigger>
              {selectedItem && displayValue.length > maxDisplayLength && (
                <TooltipContent>
                  <p>{displayValue}</p>
                </TooltipContent>
              )}
            </Tooltip>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput
              placeholder={`Tìm kiếm ${placeholder.toLowerCase()}...`}
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
            <CommandList>
              {loading ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  {loadingMessage}
                </div>
              ) : items.length === 0 ? (
                <CommandEmpty>{emptyMessage}</CommandEmpty>
              ) : (
                <CommandGroup>
                  {items.map((item) => (
                    <CommandItem
                      key={item.id}
                      value={String(item[displayField])}
                      onSelect={() => handleSelect(item)}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedItem?.id === item.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="truncate">
                            {truncateText(String(item[displayField]), maxDisplayLength)}
                          </span>
                        </TooltipTrigger>
                        {String(item[displayField]).length > maxDisplayLength && (
                          <TooltipContent>
                            <p>{String(item[displayField])}</p>
                          </TooltipContent>
                        )}
                      </Tooltip>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </TooltipProvider>
  );
}

// Helper function to create search function for API
export function createSearchFunction<T extends SearchableItem>(
  api: { search: (query: string, fields: string[]) => Promise<T[]> },
  searchFields: (keyof T)[]
) {
  return async (query: string): Promise<T[]> => {
    if (!query.trim()) {
      return api.search('', searchFields as string[]);
    }
    return api.search(query, searchFields as string[]);
  };
}

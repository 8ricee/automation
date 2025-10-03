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
import { ProductsAPI } from "@/lib/products-api";
import { Product } from "@/lib/supabase-types";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ProductSearchProps {
  value?: string;
  onValueChange: (product: Product | null) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  maxDisplayLength?: number;
}

export function ProductSearch({
  value,
  onValueChange,
  placeholder = "Tìm kiếm sản phẩm...",
  className,
  disabled = false,
  maxDisplayLength = 30
}: ProductSearchProps) {
  const [open, setOpen] = React.useState(false);
  const [products, setProducts] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");

  const selectedProduct = React.useMemo(() => {
    return products.find(product => product.id === value) || null;
  }, [products, value]);

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Load all products initially and debounced search
  React.useEffect(() => {
    const timeoutId = setTimeout(async () => {
      setLoading(true);
      try {
        if (searchQuery.trim()) {
          const results = await ProductsAPI.searchProducts(searchQuery);
          setProducts(results);
        } else {
          // Load all products when no search query
          const results = await ProductsAPI.getAll();
          setProducts(results);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Load products on component mount
  React.useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        const results = await ProductsAPI.getAll();
        setProducts(results);
      } catch (error) {
        console.error('Error loading products:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  const handleSelect = (product: Product) => {
    onValueChange(product);
    setOpen(false);
    setSearchQuery("");
  };

  const handleClear = () => {
    onValueChange(null);
    setSearchQuery("");
  };

  return (
    <TooltipProvider>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full justify-between h-8",
              !selectedProduct && "text-muted-foreground",
              className
            )}
            disabled={disabled}
          >
            {selectedProduct ? (
              <div className="flex items-center min-w-0 flex-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="font-medium text-sm leading-tight cursor-help truncate">
                      {truncateText(selectedProduct.name, maxDisplayLength)}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{selectedProduct.name}</p>
                    {selectedProduct.sku && <p className="text-xs text-muted-foreground">SKU: {selectedProduct.sku}</p>}
                    {selectedProduct.price && (
                      <p className="text-xs text-muted-foreground">
                        Giá: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedProduct.price)}
                      </p>
                    )}
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
              placeholder="Tìm kiếm theo tên, SKU hoặc mô tả..."
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
            <CommandList>
              {loading ? (
                <CommandEmpty>Đang tải...</CommandEmpty>
              ) : products.length === 0 ? (
                <CommandEmpty>Không tìm thấy sản phẩm nào.</CommandEmpty>
              ) : (
                <CommandGroup>
                  {products.map((product) => (
                    <CommandItem
                      key={product.id}
                      value={`${product.name} ${product.sku || ''} ${product.description || ''}`}
                      onSelect={() => handleSelect(product)}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedProduct?.id === product.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <div className="flex flex-col">
                        <span className="font-medium">{product.name}</span>
                        {product.sku && (
                          <span className="text-xs text-muted-foreground">
                            SKU: {product.sku}
                          </span>
                        )}
                        {product.price && (
                          <span className="text-xs text-muted-foreground">
                            Giá: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
                          </span>
                        )}
                        {product.stock !== undefined && (
                          <span className="text-xs text-muted-foreground">
                            Tồn kho: {product.stock}
                          </span>
                        )}
                      </div>
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

'use client';

import React, { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ProductSearch } from '@/components/ui/product-search';
import { Product } from '@/lib/supabase-types';
import { Minus } from 'lucide-react';

export interface QuoteItem {
  id?: string;
  product_id?: string;
  custom_description?: string;
  quantity: number;
  price_perunit: number;
  discount_percentage: number;
  total_price: number;
}

interface QuoteItemRowProps {
  item: QuoteItem;
  index: number;
  onUpdate: (index: number, field: keyof QuoteItem, value: unknown) => void;
  onRemove: (index: number) => void;
  errors?: Record<string, string>;
}

export const QuoteItemRow: React.FC<QuoteItemRowProps> = ({
  item,
  index,
  onUpdate,
  onRemove,
  errors = {}
}) => {
  const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(null);

  // Load product info when editing existing item
  React.useEffect(() => {
    if (item.product_id && !selectedProduct) {
      // Create a mock product object for display
      const mockProduct = {
        id: item.product_id,
        name: item.custom_description || 'Sản phẩm đã chọn',
        sku: '',
        description: item.custom_description || '',
        price: item.price_perunit || 0,
        status: 'active'
      } as Product;
      setSelectedProduct(mockProduct);
    }
  }, [item.product_id, item.custom_description, item.price_perunit, selectedProduct]);

  const handleProductSelect = (product: Product | null) => {
    setSelectedProduct(product);
    if (product) {
      onUpdate(index, 'product_id', product.id);
      onUpdate(index, 'price_perunit', product.price || 0);
      onUpdate(index, 'custom_description', '');
    } else {
      onUpdate(index, 'product_id', '');
      onUpdate(index, 'price_perunit', 0);
    }
    calculateTotal();
  };

  const calculateTotal = useCallback(() => {
    const quantity = item.quantity || 0;
    const pricePerUnit = item.price_perunit || 0;
    const discount = item.discount_percentage || 0;
    
    const subtotal = quantity * pricePerUnit;
    const discountAmount = subtotal * (discount / 100);
    const total = subtotal - discountAmount;
    
    // Only update if the total has actually changed to avoid infinite loops
    if (Math.round(total) !== item.total_price) {
      onUpdate(index, 'total_price', Math.round(total));
    }
  }, [item.quantity, item.price_perunit, item.discount_percentage, item.total_price, onUpdate, index]);

  const handleQuantityChange = (value: string) => {
    const quantity = parseInt(value) || 0;
    onUpdate(index, 'quantity', quantity);
    calculateTotal();
  };

  const [priceInputValue, setPriceInputValue] = React.useState<string>('');
  const [isPriceFocused, setIsPriceFocused] = React.useState<boolean>(false);

  React.useEffect(() => {
    // Only update display value if not currently focused
    if (!isPriceFocused) {
      setPriceInputValue(item.price_perunit ? new Intl.NumberFormat('vi-VN').format(item.price_perunit) : '');
    }
  }, [item.price_perunit, isPriceFocused]);

  const handlePriceChange = (value: string) => {
    setPriceInputValue(value);
    // Remove commas and parse as number
    const cleanValue = value.replace(/,/g, '');
    const price = parseFloat(cleanValue) || 0;
    onUpdate(index, 'price_perunit', price);
    calculateTotal();
  };

  const handlePriceFocus = () => {
    setIsPriceFocused(true);
    // Show raw number when focused for easier editing
    setPriceInputValue(item.price_perunit ? item.price_perunit.toString() : '');
  };

  const handlePriceBlur = () => {
    setIsPriceFocused(false);
    // Format the number when user finishes typing
    const cleanValue = priceInputValue.replace(/,/g, '');
    const price = parseFloat(cleanValue) || 0;
    if (price > 0) {
      setPriceInputValue(new Intl.NumberFormat('vi-VN').format(price));
    } else {
      setPriceInputValue('');
    }
  };

  const handleDiscountChange = (value: string) => {
    const discount = parseFloat(value) || 0;
    onUpdate(index, 'discount_percentage', discount);
    calculateTotal();
  };

  const handleCustomDescriptionChange = (value: string) => {
    onUpdate(index, 'custom_description', value);
    if (value.trim()) {
      onUpdate(index, 'product_id', '');
      setSelectedProduct(null);
    }
  };

  React.useEffect(() => {
    calculateTotal();
  }, [item.quantity, item.price_perunit, item.discount_percentage, calculateTotal]);

  return (
    <div className="relative p-4 border rounded-lg bg-gray-50/50">
      {/* Nút xóa ở góc trên cùng bên phải */}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => onRemove(index)}
        className="absolute top-2 right-2 h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
      >
        <Minus className="h-3 w-3" />
      </Button>

      {/* Hàng 1: Sản phẩm và Mô tả */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Sản phẩm */}
        <div className="space-y-1">
          <Label className="text-xs font-medium">Sản phẩm</Label>
          <ProductSearch
            value={item.product_id || ''}
            onValueChange={handleProductSelect}
            className={`h-8 text-sm ${errors[`items.${index}.product_id`] ? 'border-red-500' : ''}`}
            maxDisplayLength={30}
          />
          {errors[`items.${index}.product_id`] && (
            <p className="text-xs text-red-500">{errors[`items.${index}.product_id`]}</p>
          )}
        </div>

        {/* Mô tả tùy chỉnh */}
        <div className="space-y-1">
          <Label className="text-xs font-medium">Mô tả</Label>
          <Input
            value={item.custom_description || ''}
            onChange={(e) => handleCustomDescriptionChange(e.target.value)}
            placeholder="Mô tả tùy chỉnh..."
            className={`h-8 text-sm ${errors[`items.${index}.custom_description`] ? 'border-red-500' : ''}`}
          />
          {errors[`items.${index}.custom_description`] && (
            <p className="text-xs text-red-500">{errors[`items.${index}.custom_description`]}</p>
          )}
        </div>
      </div>

      {/* Hàng 2: SL, Giá, Giảm %, Tổng */}
      <div className="grid grid-cols-4 gap-4">
        {/* Số lượng */}
        <div className="space-y-1">
          <Label className="text-xs font-medium">Số lượng</Label>
          <Input
            type="number"
            value={item.quantity || ''}
            onChange={(e) => handleQuantityChange(e.target.value)}
            placeholder="1"
            min="1"
            className={`h-8 text-sm text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${errors[`items.${index}.quantity`] ? 'border-red-500' : ''}`}
          />
          {errors[`items.${index}.quantity`] && (
            <p className="text-xs text-red-500">{errors[`items.${index}.quantity`]}</p>
          )}
        </div>

        {/* Giá đơn vị */}
        <div className="space-y-1">
          <Label className="text-xs font-medium">Giá đơn vị</Label>
          <Input
            type="text"
            value={priceInputValue}
            onChange={(e) => handlePriceChange(e.target.value)}
            onFocus={handlePriceFocus}
            onBlur={handlePriceBlur}
            placeholder="0"
            data-price-index={index}
            className={`h-8 text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${errors[`items.${index}.price_perunit`] ? 'border-red-500' : ''}`}
          />
          {errors[`items.${index}.price_perunit`] && (
            <p className="text-xs text-red-500">{errors[`items.${index}.price_perunit`]}</p>
          )}
        </div>

        {/* Giảm giá % */}
        <div className="space-y-1">
          <Label className="text-xs font-medium">Giảm giá %</Label>
          <Input
            type="number"
            value={item.discount_percentage || ''}
            onChange={(e) => handleDiscountChange(e.target.value)}
            placeholder="0"
            min="0"
            max="100"
            step="0.1"
            className={`h-8 text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${errors[`items.${index}.discount_percentage`] ? 'border-red-500' : ''}`}
          />
          {errors[`items.${index}.discount_percentage`] && (
            <p className="text-xs text-red-500">{errors[`items.${index}.discount_percentage`]}</p>
          )}
        </div>

        {/* Tổng tiền */}
        <div className="space-y-1">
          <Label className="text-xs font-medium">Tổng tiền</Label>
          <div className="h-8 flex items-center justify-center text-sm font-medium text-gray-700 bg-gray-100 rounded border">
            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.total_price || 0)}
          </div>
        </div>
      </div>
    </div>
  );
};

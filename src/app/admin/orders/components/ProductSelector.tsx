// src/app/admin/orders/components/ProductSelector.tsx

'use client';

import { useState } from 'react';

interface Product {
  id: number;
  code: string;
  name: string;
}

interface ProductSelectorProps {
  products: Product[];
  onSelect: (product: Product) => void;
  onClose: () => void;
}

export default function ProductSelector({ products, onSelect, onClose }: ProductSelectorProps) {
  const [search, setSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.code.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = () => {
    console.log('🔘 Выбрана кнопка "Выбрать", selectedProduct:', selectedProduct);
    if (selectedProduct) {
      console.log('✅ Передаём товар:', selectedProduct);
      onSelect(selectedProduct);
      onClose();
    } else {
      console.log('❌ Товар не выбран');
    }
  };

  const handleProductClick = (product: Product) => {
    console.log('🖱️ Выбран товар:', product);
    setSelectedProduct(product);
  };

  const handleDoubleClick = (product: Product) => {
    console.log('⚡ Двойной клик по товару:', product);
    onSelect(product);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-4">
        <h2 className="text-lg font-semibold mb-3">Выберите товар</h2>
        
        <input
          type="text"
          placeholder="Поиск по названию или артикулу..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border rounded px-3 py-2 mb-3"
          autoFocus
        />
        
        <div className="max-h-64 overflow-y-auto border rounded mb-3">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              onClick={() => handleProductClick(product)}
              onDoubleClick={() => handleDoubleClick(product)}
              className={`p-2 cursor-pointer hover:bg-gray-100 ${
                selectedProduct?.id === product.id 
                  ? 'bg-blue-50 border-l-4 border-blue-500' 
                  : ''
              }`}
            >
              <div className="font-medium">{product.name}</div>
              <div className="text-sm text-gray-500">Артикул: {product.code}</div>
              <div className="text-xs text-gray-400">ID: {product.id}</div>
            </div>
          ))}
          {filteredProducts.length === 0 && (
            <div className="p-4 text-center text-gray-500">Товары не найдены</div>
          )}
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={handleSelect}
            disabled={!selectedProduct}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            Выбрать
          </button>
          <button
            onClick={() => {
              console.log('❌ Отмена, закрываем окно');
              onClose();
            }}
            className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
          >
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
}
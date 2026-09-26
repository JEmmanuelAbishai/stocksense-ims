import React, { useState } from 'react';
import { X, Sparkles, AlertCircle } from 'lucide-react';
import { Product, UnitOfMeasure } from '../../types/inventory';
import { useInventory } from '../../context/InventoryContext';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit?: Product | null;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  productToEdit
}) => {
  const { categories, warehouses, addProduct, updateProduct, generateSku } = useInventory();

  const isEditing = !!productToEdit;

  const [name, setName] = useState(productToEdit?.name || '');
  const [sku, setSku] = useState(productToEdit?.sku || '');
  const [category, setCategory] = useState(productToEdit?.category || categories[0]?.name || 'Raw Materials');
  const [unit, setUnit] = useState<UnitOfMeasure>(productToEdit?.unit || 'Units');
  const [costPrice, setCostPrice] = useState(productToEdit?.costPrice?.toString() || '0');
  const [salesPrice, setSalesPrice] = useState(productToEdit?.salesPrice?.toString() || '0');
  const [minReorderLevel, setMinReorderLevel] = useState(productToEdit?.minReorderLevel?.toString() || '20');
  const [maxTargetLevel, setMaxTargetLevel] = useState(productToEdit?.maxTargetLevel?.toString() || '100');
  const [description, setDescription] = useState(productToEdit?.description || '');
  const [barcode, setBarcode] = useState(productToEdit?.barcode || '');

  // For initial creation only
  const [initialQuantity, setInitialQuantity] = useState('0');
  const [initialWarehouseId, setInitialWarehouseId] = useState('wh-main');
  const [initialLocationId, setInitialLocationId] = useState('loc-bulk-bay');

  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleAutoGenerateSku = () => {
    if (!name) {
      setError('Please enter a product name first to generate SKU');
      return;
    }
    const generated = generateSku(name, category);
    setSku(generated);
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Product name is required.');
      return;
    }
    if (!sku.trim()) {
      setError('SKU / Code is required.');
      return;
    }

    const cost = parseFloat(costPrice) || 0;
    const sales = parseFloat(salesPrice) || 0;
    const minReorder = parseInt(minReorderLevel, 10) || 0;
    const maxTarget = parseInt(maxTargetLevel, 10) || 0;

    if (isEditing && productToEdit) {
      updateProduct(productToEdit.id, {
        name,
        sku,
        category,
        unit,
        costPrice: cost,
        salesPrice: sales,
        minReorderLevel: minReorder,
        maxTargetLevel: maxTarget,
        description,
        barcode
      });
    } else {
      const initQty = parseInt(initialQuantity, 10) || 0;
      addProduct(
        {
          sku,
          name,
          category,
          unit,
          costPrice: cost,
          salesPrice: sales,
          minReorderLevel: minReorder,
          maxTargetLevel: maxTarget,
          description,
          barcode,
          locations: []
        },
        initQty,
        initialWarehouseId,
        initialLocationId
      );
    }

    onClose();
  };

  const selectedWarehouse = warehouses.find(w => w.id === initialWarehouseId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
      <div className="bg-white border border-stone-200 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-stone-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-stone-900">
              {isEditing ? 'Edit Product Item' : 'Create New Product'}
            </h2>
            <p className="text-xs text-stone-500">
              {isEditing ? `Modifying SKU: ${productToEdit?.sku}` : 'Register a new SKU and reordering policy'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Product Name */}
            <div className="md:col-span-2">
              <label className="block text-stone-700 font-semibold mb-1">Product Name *</label>
              <input
                type="text"
                placeholder="e.g. Steel Rods 25mm"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-stone-900 placeholder-stone-400 focus:outline-none focus:border-[#1e3a34]"
                required
              />
            </div>

            {/* SKU & Generator */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-stone-700 font-semibold">SKU / Code *</label>
                <button
                  type="button"
                  onClick={handleAutoGenerateSku}
                  className="text-[#1e3a34] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Auto-generate</span>
                </button>
              </div>
              <input
                type="text"
                placeholder="e.g. STL-ROD-01"
                value={sku}
                onChange={(e) => setSku(e.target.value.toUpperCase())}
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 font-mono text-stone-900 focus:outline-none focus:border-[#1e3a34] uppercase"
                required
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-stone-700 font-semibold mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-stone-900 focus:outline-none focus:border-[#1e3a34] cursor-pointer"
              >
                {categories.map(c => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Unit */}
            <div>
              <label className="block text-stone-700 font-semibold mb-1">Unit of Measure (UoM)</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value as UnitOfMeasure)}
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-stone-900 focus:outline-none focus:border-[#1e3a34] cursor-pointer"
              >
                <option value="Units">Units (pcs)</option>
                <option value="kg">Kilograms (kg)</option>
                <option value="Meters">Meters (m)</option>
                <option value="Boxes">Boxes (bx)</option>
                <option value="Liters">Liters (L)</option>
                <option value="Pallets">Pallets (plt)</option>
              </select>
            </div>

            {/* Barcode */}
            <div>
              <label className="block text-stone-700 font-semibold mb-1">Barcode / EAN-13 (Optional)</label>
              <input
                type="text"
                placeholder="890123456789"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 font-mono text-stone-900 placeholder-stone-400 focus:outline-none focus:border-[#1e3a34]"
              />
            </div>

            {/* Cost & Sales Price */}
            <div>
              <label className="block text-stone-700 font-semibold mb-1">Cost Price ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={costPrice}
                onChange={(e) => setCostPrice(e.target.value)}
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 font-mono text-stone-900 focus:outline-none focus:border-[#1e3a34]"
              />
            </div>

            <div>
              <label className="block text-stone-700 font-semibold mb-1">Sales Price ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={salesPrice}
                onChange={(e) => setSalesPrice(e.target.value)}
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 font-mono text-stone-900 focus:outline-none focus:border-[#1e3a34]"
              />
            </div>

            {/* Reorder thresholds */}
            <div>
              <label className="block text-stone-700 font-semibold mb-1">Min Reorder Level</label>
              <input
                type="number"
                min="0"
                value={minReorderLevel}
                onChange={(e) => setMinReorderLevel(e.target.value)}
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 font-mono text-stone-900 focus:outline-none focus:border-[#1e3a34]"
              />
            </div>

            <div>
              <label className="block text-stone-700 font-semibold mb-1">Max Target Level</label>
              <input
                type="number"
                min="0"
                value={maxTargetLevel}
                onChange={(e) => setMaxTargetLevel(e.target.value)}
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 font-mono text-stone-900 focus:outline-none focus:border-[#1e3a34]"
              />
            </div>
          </div>

          {/* Initial Stock section for new products only */}
          {!isEditing && (
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-3 mt-2">
              <div className="text-xs font-bold text-stone-900">Initial Stock Consignment (Optional)</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-stone-600 mb-1">Initial Qty</label>
                  <input
                    type="number"
                    min="0"
                    value={initialQuantity}
                    onChange={(e) => setInitialQuantity(e.target.value)}
                    className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 font-mono text-stone-900"
                  />
                </div>
                <div>
                  <label className="block text-stone-600 mb-1">Warehouse</label>
                  <select
                    value={initialWarehouseId}
                    onChange={(e) => setInitialWarehouseId(e.target.value)}
                    className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-stone-900"
                  >
                    {warehouses.map(w => (
                      <option key={w.id} value={w.id}>{w.code} - {w.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-stone-600 mb-1">Storage Location</label>
                  <select
                    value={initialLocationId}
                    onChange={(e) => setInitialLocationId(e.target.value)}
                    className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-stone-900"
                  >
                    {selectedWarehouse?.locations.map(loc => (
                      <option key={loc.id} value={loc.id}>{loc.code} - {loc.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-stone-700 font-semibold mb-1">Product Description</label>
            <textarea
              rows={2}
              placeholder="Material specs, handling guidelines, packaging notes..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-stone-900 placeholder-stone-400 focus:outline-none focus:border-[#1e3a34]"
            />
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#1e3a34] hover:bg-[#162c27] text-white font-bold transition-all shadow-sm"
            >
              {isEditing ? 'Save Changes' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

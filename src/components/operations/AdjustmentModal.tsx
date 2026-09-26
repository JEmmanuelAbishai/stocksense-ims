import React, { useState, useEffect } from 'react';
import { X, SlidersHorizontal, AlertCircle } from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';

interface AdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedProductId?: string;
}

export const AdjustmentModal: React.FC<AdjustmentModalProps> = ({
  isOpen,
  onClose,
  preselectedProductId
}) => {
  const { products, warehouses, performStockAdjustment } = useInventory();

  const [productId, setProductId] = useState('');
  const [warehouseId, setWarehouseId] = useState('wh-main');
  const [locationId, setLocationId] = useState('loc-bulk-bay');
  const [countedQty, setCountedQty] = useState('0');
  const [reason, setReason] = useState('Physical Cycle Count Audit');
  const [customReason, setCustomReason] = useState('');
  const [error, setError] = useState('');

  const REASONS = [
    'Physical Cycle Count Audit',
    'Damaged Materials Write-off',
    'Found Stock / Unrecorded Inflow',
    'Shrinkage / Discrepancy',
    'Packaging / Batch Split Variance',
    'Quality Inspection Discard',
    'Other (Specify below)'
  ];

  useEffect(() => {
    if (isOpen) {
      if (preselectedProductId) {
        setProductId(preselectedProductId);
        const prod = products.find(p => p.id === preselectedProductId);
        if (prod && prod.locations[0]) {
          setWarehouseId(prod.locations[0].warehouseId);
          setLocationId(prod.locations[0].locationId);
          setCountedQty(prod.locations[0].quantity.toString());
        }
      } else if (products.length > 0) {
        setProductId(products[0].id);
        if (products[0].locations[0]) {
          setWarehouseId(products[0].locations[0].warehouseId);
          setLocationId(products[0].locations[0].locationId);
          setCountedQty(products[0].locations[0].quantity.toString());
        }
      }
    }
  }, [isOpen, preselectedProductId, products]);

  if (!isOpen) return null;

  const currentProduct = products.find(p => p.id === productId);
  const currentWarehouse = warehouses.find(w => w.id === warehouseId);
  const existingLocation = currentProduct?.locations.find(
    l => l.warehouseId === warehouseId && l.locationId === locationId
  );
  const recordedQty = existingLocation ? existingLocation.quantity : 0;
  const countedNum = parseInt(countedQty, 10) || 0;
  const difference = countedNum - recordedQty;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProduct) {
      setError('Please select a valid product.');
      return;
    }
    if (countedNum < 0) {
      setError('Counted quantity cannot be negative.');
      return;
    }

    const finalReason = reason === 'Other (Specify below)' ? (customReason || 'Manual adjustment') : reason;

    performStockAdjustment(
      currentProduct.id,
      warehouseId,
      locationId,
      countedNum,
      finalReason
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
      <div className="bg-white border border-stone-200 rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-stone-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-stone-100 text-stone-700 flex items-center justify-center">
              <SlidersHorizontal className="w-5 h-5 text-[#1e3a34]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-stone-900">Physical Stock Count Adjustment</h2>
              <p className="text-xs text-stone-500">Reconcile counted stock with system inventory</p>
            </div>
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

          <div>
            <label className="block text-stone-700 font-semibold mb-1">Product Item *</label>
            <select
              value={productId}
              onChange={(e) => {
                const newId = e.target.value;
                setProductId(newId);
                const p = products.find(prod => prod.id === newId);
                if (p && p.locations[0]) {
                  setWarehouseId(p.locations[0].warehouseId);
                  setLocationId(p.locations[0].locationId);
                  setCountedQty(p.locations[0].quantity.toString());
                }
              }}
              className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-stone-900 focus:outline-none focus:border-[#1e3a34] cursor-pointer"
            >
              {products.map(p => (
                <option key={p.id} value={p.id}>
                  [{p.sku}] {p.name} (Total: {p.totalStock} {p.unit})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-stone-700 font-semibold mb-1">Warehouse</label>
              <select
                value={warehouseId}
                onChange={(e) => {
                  setWarehouseId(e.target.value);
                  const wh = warehouses.find(w => w.id === e.target.value);
                  if (wh && wh.locations[0]) {
                    setLocationId(wh.locations[0].id);
                  }
                }}
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-stone-900 focus:outline-none focus:border-[#1e3a34] cursor-pointer"
              >
                {warehouses.map(w => (
                  <option key={w.id} value={w.id}>{w.code} - {w.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-stone-700 font-semibold mb-1">Location / Bay</label>
              <select
                value={locationId}
                onChange={(e) => setLocationId(e.target.value)}
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-stone-900 focus:outline-none focus:border-[#1e3a34] cursor-pointer"
              >
                {currentWarehouse?.locations.map(loc => (
                  <option key={loc.id} value={loc.id}>{loc.code} - {loc.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Variance Box */}
          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-3">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-3 rounded-xl bg-white border border-stone-200">
                <span className="text-[10px] text-stone-400 uppercase tracking-wider block font-semibold">Recorded</span>
                <span className="font-mono text-base font-bold text-stone-800 tabular-nums">
                  {recordedQty}
                </span>
                <span className="text-[10px] text-stone-400 block">{currentProduct?.unit}</span>
              </div>

              <div className="p-3 rounded-xl bg-white border-2 border-[#1e3a34]">
                <label className="text-[10px] text-[#1e3a34] font-bold uppercase tracking-wider block">
                  Counted *
                </label>
                <input
                  type="number"
                  min="0"
                  value={countedQty}
                  onChange={(e) => setCountedQty(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded py-0.5 px-1 text-center font-mono text-base font-bold text-stone-900 focus:outline-none focus:border-[#1e3a34]"
                  required
                />
                <span className="text-[10px] text-stone-500 block">{currentProduct?.unit}</span>
              </div>

              <div className="p-3 rounded-xl bg-white border border-stone-200">
                <span className="text-[10px] text-stone-400 uppercase tracking-wider block font-semibold">Variance</span>
                <span className={`font-mono text-base font-bold tabular-nums ${
                  difference === 0 ? 'text-stone-400' : difference > 0 ? 'text-[#1c644d]' : 'text-[#9e3a24]'
                }`}>
                  {difference > 0 ? `+${difference}` : difference}
                </span>
                <span className="text-[10px] text-stone-400 block">{currentProduct?.unit}</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-stone-700 font-semibold mb-1">Adjustment Reason *</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-stone-900 focus:outline-none focus:border-[#1e3a34] cursor-pointer"
            >
              {REASONS.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          {reason === 'Other (Specify below)' && (
            <div>
              <label className="block text-stone-700 font-semibold mb-1">Explanation</label>
              <input
                type="text"
                placeholder="Reason for discrepancy..."
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-stone-900 placeholder-stone-400 focus:outline-none focus:border-[#1e3a34]"
              />
            </div>
          )}

          <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#1e3a34] hover:bg-[#162c27] text-white font-bold transition-all shadow-sm cursor-pointer"
            >
              Apply Adjustment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

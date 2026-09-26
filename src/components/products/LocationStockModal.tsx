import React from 'react';
import { X, Building2, MapPin, ArrowLeftRight } from 'lucide-react';
import { Product } from '../../types/inventory';
import { useInventory } from '../../context/InventoryContext';

interface LocationStockModalProps {
  product: Product | null;
  onClose: () => void;
  onTransferClick: (product: Product, sourceWhId: string, sourceLocId: string) => void;
}

export const LocationStockModal: React.FC<LocationStockModalProps> = ({
  product,
  onClose,
  onTransferClick
}) => {
  const { warehouses } = useInventory();

  if (!product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
      <div className="bg-white border border-stone-200 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-stone-100 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-[#1e3a34] font-bold">{product.sku}</span>
              <span className="text-stone-300">·</span>
              <span className="text-xs text-stone-500">{product.category}</span>
            </div>
            <h2 className="text-lg font-bold text-stone-900 mt-0.5">{product.name}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-between text-xs">
            <span className="text-stone-600 font-medium">Total System Stock:</span>
            <div className="font-mono text-lg font-bold text-stone-900">
              {product.totalStock.toLocaleString()} {product.unit}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold text-stone-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#1e3a34]" />
              <span>Location Breakdown</span>
            </h3>

            {product.locations.length === 0 ? (
              <div className="p-6 text-center text-xs text-stone-400 bg-stone-50 rounded-xl border border-stone-100">
                No active warehouse allocations found for this item.
              </div>
            ) : (
              <div className="space-y-2">
                {product.locations.map((loc, idx) => {
                  const wh = warehouses.find(w => w.id === loc.warehouseId);
                  const locationObj = wh?.locations.find(l => l.id === loc.locationId);

                  return (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="min-w-0">
                        <div className="font-semibold text-stone-900 flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                          <span className="truncate">{wh?.name || loc.warehouseId}</span>
                        </div>
                        <div className="text-[11px] text-stone-500 font-mono mt-0.5">
                          {locationObj ? `${locationObj.code} (${locationObj.name})` : loc.locationId}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="font-mono font-bold text-stone-900">
                          {loc.quantity.toLocaleString()} {product.unit}
                        </div>

                        {loc.quantity > 0 && (
                          <button
                            onClick={() => {
                              onClose();
                              onTransferClick(product, loc.warehouseId, loc.locationId);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-white border border-stone-200 text-[#1e3a34] font-semibold hover:bg-stone-100 transition-colors flex items-center gap-1 text-[11px]"
                          >
                            <ArrowLeftRight className="w-3 h-3" />
                            <span>Transfer</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Reordering Rules Info */}
          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 text-xs space-y-1">
            <div className="font-bold text-stone-800">Reorder Thresholds:</div>
            <div className="flex items-center justify-between text-[11px] text-stone-600 font-mono">
              <span>Safety Minimum: {product.minReorderLevel} {product.unit}</span>
              <span>Target Ceiling: {product.maxTargetLevel} {product.unit}</span>
            </div>
            {product.totalStock <= product.minReorderLevel && (
              <div className="text-[11px] text-[#9e3a24] font-semibold pt-1">
                ⚠️ Current stock ({product.totalStock}) is below minimum reorder level ({product.minReorderLevel}).
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-100 bg-stone-50/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white border border-stone-300 text-stone-700 text-xs font-semibold hover:bg-stone-50 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  Printer,
  Check,
  ArrowLeft,
  SlidersHorizontal
} from 'lucide-react';
import { Operation } from '../../types/inventory';
import { useInventory } from '../../context/InventoryContext';

interface AdjustmentDetailViewProps {
  adjustment: Operation;
  onBack: () => void;
}

export const AdjustmentDetailView: React.FC<AdjustmentDetailViewProps> = ({
  adjustment,
  onBack
}) => {
  const { validateOperation, updateOperationStatus, getLocationName } = useInventory();
  const [isValidated, setIsValidated] = useState(adjustment.status === 'done');

  const handleValidate = () => {
    const res = validateOperation(adjustment.id);
    if (res.success) {
      setIsValidated(true);
    } else {
      alert(res.error || 'Validation error');
    }
  };

  const isDone = isValidated || adjustment.status === 'done';

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      <div className="flex items-center gap-2 text-xs text-stone-500 pt-1">
        <button
          onClick={onBack}
          className="hover:text-[#1e3a34] font-medium flex items-center gap-1 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Inventory Adjustments</span>
        </button>
        <span>/</span>
        <span className="font-mono text-stone-800 font-semibold">{adjustment.code}</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold text-[#1c2a27] font-mono tracking-tight">
              {adjustment.code}
            </h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e5f3ed] text-[#1c644d] text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1c644d]"></span>
              {isDone ? 'Applied to Ledger' : 'Draft Count'}
            </span>
          </div>
          <p className="text-xs text-stone-600 mt-1">
            Physical stock count reconciliation.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => window.print()}
            className="px-4 py-2 rounded-xl bg-white border border-stone-300 hover:bg-stone-50 text-xs font-semibold text-stone-700 flex items-center gap-2 cursor-pointer"
          >
            <Printer className="w-4 h-4 text-stone-500" />
            <span>Print Count Sheet</span>
          </button>
          {!isDone && (
            <button
              onClick={handleValidate}
              className="px-5 py-2 rounded-xl bg-[#1e3a34] hover:bg-[#162c27] text-white text-xs font-bold tracking-wide shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Validate & Apply</span>
            </button>
          )}
        </div>
      </div>

      {/* Audit Location Details */}
      <div className="bg-white rounded-2xl p-6 border border-stone-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
        <h3 className="text-sm font-bold text-[#1c2a27] border-b border-stone-100 pb-3">
          Audit Parameters
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
          <div>
            <div className="text-[10px] uppercase font-bold text-stone-400 tracking-wider mb-1">
              LOCATION
            </div>
            <div className="font-bold text-[#1c2a27] text-sm">
              {getLocationName(adjustment.sourceWarehouseId, adjustment.sourceLocationId)}
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-stone-400 tracking-wider mb-1">
              COUNT DATE
            </div>
            <div className="font-semibold text-[#1c2a27]">
              {adjustment.date}
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-stone-400 tracking-wider mb-1">
              AUDITED BY
            </div>
            <div className="font-semibold text-[#1c2a27]">
              {adjustment.creatorName}
            </div>
          </div>
        </div>
      </div>

      {/* Adjustments Table */}
      <div className="bg-white rounded-2xl border border-stone-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-stone-100 bg-stone-50/60 text-stone-500 uppercase text-[10px]">
              <th className="py-3 px-5">PRODUCT</th>
              <th className="py-3 px-5">SKU</th>
              <th className="py-3 px-5 text-right">PHYSICAL COUNT</th>
              <th className="py-3 px-5">UNIT</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {adjustment.items.map((item, idx) => (
              <tr key={idx}>
                <td className="py-4 px-5 font-bold text-stone-900">{item.productName}</td>
                <td className="py-4 px-5 font-mono text-stone-500">{item.sku}</td>
                <td className="py-4 px-5 text-right font-mono font-bold text-stone-900">{item.quantity}</td>
                <td className="py-4 px-5 text-stone-500">{item.unit}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  Printer,
  Check,
  ArrowLeft,
  ArrowRight,
  ArrowLeftRight,
  Edit2
} from 'lucide-react';
import { Operation } from '../../types/inventory';
import { useInventory } from '../../context/InventoryContext';

interface TransferDetailViewProps {
  transfer: Operation;
  onBack: () => void;
}

export const TransferDetailView: React.FC<TransferDetailViewProps> = ({
  transfer,
  onBack
}) => {
  const { validateOperation, updateOperationStatus, getLocationName } = useInventory();
  const [isValidated, setIsValidated] = useState(transfer.status === 'done');

  const handleValidate = () => {
    const res = validateOperation(transfer.id);
    if (res.success) {
      setIsValidated(true);
    } else {
      alert(res.error || 'Validation error');
    }
  };

  const handleCancel = () => {
    if (confirm('Cancel this transfer?')) {
      updateOperationStatus(transfer.id, 'canceled');
      onBack();
    }
  };

  const isDone = isValidated || transfer.status === 'done';
  const totalUnits = transfer.items.reduce((s, i) => s + i.quantity, 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      <div className="flex items-center gap-2 text-xs text-stone-500 pt-1">
        <button
          onClick={onBack}
          className="hover:text-[#1e3a34] font-medium flex items-center gap-1 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Internal Transfers</span>
        </button>
        <span>/</span>
        <span className="font-mono text-stone-800 font-semibold">{transfer.code}</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold text-[#1c2a27] font-mono tracking-tight">
              {transfer.code}
            </h1>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
              isDone ? 'bg-[#e5f3ed] text-[#1c644d]' : 'bg-[#e5f3ed] text-[#1c644d]'
            }`}>
              <span className="w-1.5 h-1.5 rounded-full bg-[#1c644d]"></span>
              {isDone ? 'Completed' : 'Ready to Transfer'}
            </span>
          </div>
          <p className="text-xs text-stone-600 mt-1">
            Internal relocation between warehouse locations.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleCancel}
            className="px-4 py-2 rounded-xl bg-white border border-stone-300 hover:bg-stone-50 text-xs font-semibold text-stone-700 cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={() => window.print()}
            className="px-4 py-2 rounded-xl bg-white border border-stone-300 hover:bg-stone-50 text-xs font-semibold text-stone-700 flex items-center gap-2 cursor-pointer"
          >
            <Printer className="w-4 h-4 text-stone-500" />
            <span>Print Transfer Order</span>
          </button>
          {!isDone && (
            <button
              onClick={handleValidate}
              className="px-5 py-2 rounded-xl bg-[#1e3a34] hover:bg-[#162c27] text-white text-xs font-bold tracking-wide shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Validate Transfer</span>
            </button>
          )}
        </div>
      </div>

      {/* Stepper */}
      <div className="bg-white rounded-2xl p-4 border border-stone-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex items-center justify-between">
        <div className="flex items-center w-full px-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-[#1e3a34] text-white flex items-center justify-center text-xs">
              <Check className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-semibold text-[#1c2a27]">Draft</span>
          </div>
          <div className="flex-1 h-[2px] bg-[#1e3a34] mx-4" />
          <div className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
              isDone ? 'bg-[#1e3a34] text-white' : 'border-2 border-[#1e3a34] text-[#1e3a34]'
            }`}>
              {isDone ? <Check className="w-3.5 h-3.5" /> : '2'}
            </div>
            <span className="text-xs font-semibold text-[#1c2a27]">Ready</span>
          </div>
          <div className={`flex-1 h-[2px] mx-4 ${isDone ? 'bg-[#1e3a34]' : 'bg-stone-200'}`} />
          <div className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
              isDone ? 'bg-[#1e3a34] text-white' : 'border-2 border-stone-300 text-stone-400'
            }`}>
              {isDone ? <Check className="w-3.5 h-3.5" /> : '3'}
            </div>
            <span className={`text-xs font-semibold ${isDone ? 'text-[#1c2a27]' : 'text-stone-400'}`}>
              Completed
            </span>
          </div>
        </div>
      </div>

      {/* Transfer Information */}
      <div className="bg-white rounded-2xl p-6 border border-stone-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-5">
        <h3 className="text-sm font-bold text-[#1c2a27] border-b border-stone-100 pb-3">
          Transfer Locations
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
          <div>
            <div className="text-[10px] uppercase font-bold text-stone-400 tracking-wider mb-1">
              SOURCE LOCATION
            </div>
            <div className="font-bold text-[#1c2a27] text-sm">
              {getLocationName(transfer.sourceWarehouseId, transfer.sourceLocationId)}
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-stone-400 tracking-wider mb-1">
              DESTINATION LOCATION
            </div>
            <div className="font-bold text-[#1c2a27] text-sm text-[#1e3a34]">
              {getLocationName(transfer.destinationWarehouseId, transfer.destinationLocationId)}
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-stone-400 tracking-wider mb-1">
              TRANSFER DATE
            </div>
            <div className="font-semibold text-[#1c2a27]">
              {transfer.date}
            </div>
          </div>
        </div>
      </div>

      {/* Product Lines */}
      <div className="bg-white rounded-2xl border border-stone-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden">
        <div className="py-3 px-5 border-b border-stone-100 bg-stone-50/60 font-semibold text-xs text-stone-600">
          Items to Relocate ({totalUnits} units)
        </div>
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-stone-100 text-stone-400 uppercase text-[10px]">
              <th className="py-3 px-5">PRODUCT</th>
              <th className="py-3 px-5">SKU</th>
              <th className="py-3 px-5 text-right">QUANTITY</th>
              <th className="py-3 px-5">UNIT</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {transfer.items.map((item, idx) => (
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

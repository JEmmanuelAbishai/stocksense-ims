import React, { useState } from 'react';
import {
  Printer,
  Check,
  CheckCircle2,
  Edit2,
  Plus,
  ArrowLeft,
  Truck
} from 'lucide-react';
import { Operation } from '../../types/inventory';
import { useInventory } from '../../context/InventoryContext';
import { useAuth } from '../../context/AuthContext';

interface ReceiptDetailViewProps {
  receipt: Operation;
  onBack: () => void;
}

export const ReceiptDetailView: React.FC<ReceiptDetailViewProps> = ({
  receipt,
  onBack
}) => {
  const { validateOperation, updateOperationStatus } = useInventory();
  const { currencySymbol } = useAuth();
  const [isValidated, setIsValidated] = useState(receipt.status === 'done');

  const handleValidate = () => {
    const res = validateOperation(receipt.id);
    if (res.success) {
      setIsValidated(true);
    } else {
      alert(res.error || 'Validation error');
    }
  };

  const handleCancel = () => {
    if (confirm('Are you sure you want to cancel this inbound receipt?')) {
      updateOperationStatus(receipt.id, 'canceled');
      onBack();
    }
  };

  const totalValue = receipt.items.reduce(
    (sum, item) => sum + item.quantity * (item.unitPrice || 0),
    0
  );
  const totalUnits = receipt.items.reduce((sum, item) => sum + item.quantity, 0);

  // Stepper state
  const isDraft = receipt.status === 'draft';
  const isReady = receipt.status === 'ready' && !isValidated;
  const isDone = isValidated || receipt.status === 'done';

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Breadcrumb back */}
      <div className="flex items-center gap-2 text-xs text-stone-500 pt-1">
        <button
          onClick={onBack}
          className="hover:text-[#1e3a34] font-medium flex items-center gap-1 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Receipts</span>
        </button>
        <span>/</span>
        <span className="font-mono text-stone-800 font-semibold">{receipt.code}</span>
      </div>

      {/* Title & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold text-[#1c2a27] font-mono tracking-tight">
              {receipt.code}
            </h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e5f3ed] text-[#1c644d] text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1c644d]"></span>
              {isDone ? 'Done' : 'Ready'}
            </span>
          </div>
          <p className="text-xs text-stone-600 mt-1">
            Inbound shipment from {receipt.partnerName}.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleCancel}
            className="px-4 py-2 rounded-xl bg-white border border-stone-300 hover:bg-stone-50 text-xs font-semibold text-stone-700 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={() => window.print()}
            className="px-4 py-2 rounded-xl bg-white border border-stone-300 hover:bg-stone-50 text-xs font-semibold text-stone-700 transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Printer className="w-4 h-4 text-stone-500" />
            <span>Print</span>
          </button>
          {!isDone && (
            <button
              onClick={handleValidate}
              className="px-5 py-2 rounded-xl bg-[#1e3a34] hover:bg-[#162c27] text-white text-xs font-bold tracking-wide transition-all shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Validate</span>
            </button>
          )}
        </div>
      </div>

      {/* Progress Stepper Bar */}
      <div className="bg-white rounded-2xl p-4 border border-stone-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex items-center justify-between">
        <div className="flex items-center w-full px-4">
          {/* Step 1: Draft */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-[#1e3a34] text-white flex items-center justify-center text-xs">
              <Check className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-semibold text-[#1c2a27]">Draft</span>
          </div>

          {/* Line 1 */}
          <div className="flex-1 h-[2px] bg-[#1e3a34] mx-4" />

          {/* Step 2: Ready */}
          <div className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
              isDone ? 'bg-[#1e3a34] text-white' : 'border-2 border-[#1e3a34] text-[#1e3a34]'
            }`}>
              {isDone ? <Check className="w-3.5 h-3.5" /> : '2'}
            </div>
            <span className="text-xs font-semibold text-[#1c2a27]">Ready</span>
          </div>

          {/* Line 2 */}
          <div className={`flex-1 h-[2px] mx-4 ${isDone ? 'bg-[#1e3a34]' : 'bg-stone-200'}`} />

          {/* Step 3: Done */}
          <div className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
              isDone ? 'bg-[#1e3a34] text-white' : 'border-2 border-stone-300 text-stone-400'
            }`}>
              {isDone ? <Check className="w-3.5 h-3.5" /> : '3'}
            </div>
            <span className={`text-xs font-semibold ${isDone ? 'text-[#1c2a27]' : 'text-stone-400'}`}>
              Done
            </span>
          </div>
        </div>
      </div>

      {/* Shipment Information + Arrival Note Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left 2 Cols: Shipment Info */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-stone-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-5">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <h3 className="text-sm font-bold text-[#1c2a27]">Shipment information</h3>
            <button className="text-stone-400 hover:text-stone-700">
              <Edit2 className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-4 gap-x-6 text-xs">
            <div>
              <div className="text-[10px] uppercase font-bold text-stone-400 tracking-wider mb-1">
                RECEIVE FROM
              </div>
              <div className="font-bold text-[#1c2a27] text-sm">
                {receipt.partnerName}
              </div>
            </div>

            <div>
              <div className="text-[10px] uppercase font-bold text-stone-400 tracking-wider mb-1">
                SCHEDULE DATE
              </div>
              <div className="font-semibold text-[#1c2a27]">
                {receipt.date}
              </div>
            </div>

            <div>
              <div className="text-[10px] uppercase font-bold text-stone-400 tracking-wider mb-1">
                RESPONSIBLE
              </div>
              <div className="font-semibold text-[#1c2a27]">
                {receipt.creatorName}
              </div>
            </div>

            <div>
              <div className="text-[10px] uppercase font-bold text-stone-400 tracking-wider mb-1">
                DESTINATION
              </div>
              <div className="font-semibold text-[#1c2a27]">
                North Dock / Receiving
              </div>
            </div>

            <div>
              <div className="text-[10px] uppercase font-bold text-stone-400 tracking-wider mb-1">
                VENDOR REFERENCE
              </div>
              <div className="font-mono font-bold text-[#1c2a27]">
                CP-PO-11842
              </div>
            </div>

            <div>
              <div className="text-[10px] uppercase font-bold text-stone-400 tracking-wider mb-1">
                OPERATION TYPE
              </div>
              <div className="font-semibold text-[#1c2a27]">
                Receipts
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Arrival note */}
        <div className="bg-[#eaf3ef] rounded-2xl p-6 border border-[#cbe4d7] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#1c644d] mb-2">
              <Truck className="w-4 h-4" />
              <span>Arrival note</span>
            </div>
            <p className="text-xs text-stone-700 leading-relaxed">
              Carrier confirmed Bay 03. Driver will call receiving 15 minutes before arrival.
            </p>
          </div>

          <div className="text-[11px] font-mono text-stone-500 pt-4 border-t border-[#d8ece1]">
            FRT-8821 · Cedar Freight
          </div>
        </div>
      </div>

      {/* Product Lines Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-[#1c2a27]">Product lines</h3>
            <span className="text-xs text-stone-500">
              {receipt.items.length} items · {totalUnits} units
            </span>
          </div>

          <button className="px-3 py-1.5 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-xs font-semibold text-stone-700 flex items-center gap-1.5 transition-colors cursor-pointer">
            <Plus className="w-3.5 h-3.5" />
            <span>Add product</span>
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-stone-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-stone-200/80 bg-stone-50/60 text-stone-500 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-5">PRODUCT</th>
                  <th className="py-3 px-5">SKU</th>
                  <th className="py-3 px-5 text-right">ORDERED</th>
                  <th className="py-3 px-5 text-right">RECEIVED</th>
                  <th className="py-3 px-5">PUTAWAY</th>
                  <th className="py-3 px-5 text-right">UNIT COST</th>
                  <th className="py-3 px-5 text-right">LINE TOTAL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-[#1c2a27]">
                {receipt.items.map((item, idx) => {
                  const lineTotal = item.quantity * (item.unitPrice || 0);
                  const putawayLocation = idx === 0 ? 'A-01-02' : idx === 1 ? 'B-04-01' : 'B-02-03';

                  return (
                    <tr key={idx} className="hover:bg-stone-50/50">
                      <td className="py-4 px-5 font-bold text-stone-900">
                        {item.productName}
                      </td>
                      <td className="py-4 px-5 font-mono text-stone-500">
                        {item.sku}
                      </td>
                      <td className="py-4 px-5 text-right font-mono text-stone-700">
                        {item.quantity}
                      </td>
                      <td className="py-4 px-5 text-right font-mono font-bold text-stone-900">
                        {item.receivedQuantity ?? item.quantity}
                      </td>
                      <td className="py-4 px-5 font-mono text-stone-600">
                        {putawayLocation}
                      </td>
                      <td className="py-4 px-5 text-right font-mono text-stone-700">
                        {currencySymbol}{(item.unitPrice || 0).toFixed(2)}
                      </td>
                      <td className="py-4 px-5 text-right font-mono font-bold text-stone-900">
                        {currencySymbol}{lineTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Footer Bar */}
          <div className="py-4 px-5 border-t border-stone-100 flex items-center justify-between text-xs">
            <span className="text-stone-500">All quantities checked against purchase order</span>
            <div className="flex items-center gap-2">
              <span className="text-stone-500">Total value</span>
              <span className="font-mono text-lg font-bold text-[#1c2a27]">
                {currencySymbol}{totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

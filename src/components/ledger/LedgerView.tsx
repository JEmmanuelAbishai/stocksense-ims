import React, { useState, useMemo } from 'react';
import {
  History,
  Search,
  Filter,
  FileSpreadsheet,
  ArrowDownToLine,
  Truck,
  ArrowLeftRight,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  User
} from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';
import { OperationType } from '../../types/inventory';

export const LedgerView: React.FC = () => {
  const { ledger, exportLedgerCsv } = useInventory();

  const [typeFilter, setTypeFilter] = useState<OperationType | 'all'>('all');
  const [search, setSearch] = useState('');

  const filteredLedger = useMemo(() => {
    return ledger.filter(entry => {
      if (typeFilter !== 'all' && entry.operationType !== typeFilter) {
        return false;
      }
      if (search.trim()) {
        const q = search.toLowerCase();
        const refMatch = entry.documentRef.toLowerCase().includes(q);
        const skuMatch = entry.sku.toLowerCase().includes(q);
        const prodMatch = entry.productName.toLowerCase().includes(q);
        const opMatch = entry.operatorName.toLowerCase().includes(q);
        const locMatch = entry.fromLocation.toLowerCase().includes(q) || entry.toLocation.toLowerCase().includes(q);
        if (!refMatch && !skuMatch && !prodMatch && !opMatch && !locMatch) return false;
      }
      return true;
    });
  }, [ledger, typeFilter, search]);

  const getTypeIcon = (type: OperationType) => {
    switch (type) {
      case 'receipt':
        return <ArrowDownToLine className="w-3.5 h-3.5 text-[#1c644d]" />;
      case 'delivery':
        return <Truck className="w-3.5 h-3.5 text-stone-600" />;
      case 'internal':
        return <ArrowLeftRight className="w-3.5 h-3.5 text-stone-600" />;
      case 'adjustment':
        return <SlidersHorizontal className="w-3.5 h-3.5 text-[#9e3a24]" />;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pt-2">
        <div>
          <div className="text-[11px] font-bold tracking-widest text-[#1e3a34] dark:text-[#d89ec5] uppercase mb-1">
            AUDIT JOURNAL
          </div>
          <h1 className="text-3xl font-extrabold text-[#1c2a27] dark:text-[#f8ecf5] tracking-tight">
            Move History & Ledger
          </h1>
          <p className="text-sm text-stone-600 dark:text-slate-400 mt-1">
            Immutable transaction records of all receipts, deliveries, internal transfers, and physical counts.
          </p>
        </div>

        <button
          onClick={exportLedgerCsv}
          className="px-4 py-2.5 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-xs font-semibold text-stone-700 transition-colors flex items-center gap-2 cursor-pointer shadow-sm self-start sm:self-auto"
        >
          <FileSpreadsheet className="w-4 h-4 text-[#1e3a34]" />
          <span>Export Audit Ledger (.csv)</span>
        </button>
      </div>

      {/* Filter toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-1">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search reference, SKU, operator, location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 bg-white border border-stone-300 rounded-xl text-xs text-[#1c2a27] placeholder:text-stone-400 focus:outline-none focus:border-[#1e3a34]"
          />
        </div>

        <div className="flex items-center gap-1 p-1 bg-stone-200/70 dark:bg-[#172033] dark:border dark:border-slate-800 rounded-xl text-xs">
          {(['all', 'receipt', 'delivery', 'internal', 'adjustment'] as const).map(ot => (
            <button
              key={ot}
              onClick={() => setTypeFilter(ot)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer capitalize ${
                typeFilter === ot
                  ? 'bg-white text-[#1c2a27] dark:bg-[#714B67] dark:text-white font-semibold shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 dark:text-slate-300 dark:hover:text-white dark:hover:bg-white/5'
              }`}
            >
              {ot === 'all' ? 'All Ledger' : ot === 'internal' ? 'Transfers' : ot === 'adjustment' ? 'Adjustments' : ot === 'receipt' ? 'Receipts' : 'Deliveries'}
            </button>
          ))}
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-2xl border border-stone-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-stone-200/80 bg-stone-50/60 text-stone-500 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-5">TIMESTAMP & REF</th>
                <th className="py-3 px-5">OPERATION</th>
                <th className="py-3 px-5">ITEM & SKU</th>
                <th className="py-3 px-5">FROM LOCATION</th>
                <th className="py-3 px-5">TO LOCATION</th>
                <th className="py-3 px-5 text-right">CHANGE</th>
                <th className="py-3 px-5 text-right">BALANCE AFTER</th>
                <th className="py-3 px-5">OPERATOR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-[#1c2a27]">
              {filteredLedger.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-stone-400">
                    No ledger transactions matching the selected criteria.
                  </td>
                </tr>
              ) : (
                filteredLedger.map(entry => (
                  <tr
                    key={entry.id}
                    className="hover:bg-stone-50/60 transition-colors"
                  >
                    <td className="py-4 px-5">
                      <div className="font-mono font-bold text-stone-900">
                        {entry.documentRef}
                      </div>
                      <div className="text-[11px] text-stone-500 mt-0.5">
                        {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {new Date(entry.timestamp).toLocaleDateString()}
                      </div>
                    </td>

                    <td className="py-4 px-5">
                      <div className="flex items-center gap-1.5 font-medium capitalize text-stone-800">
                        {getTypeIcon(entry.operationType)}
                        <span>{entry.operationType}</span>
                      </div>
                      {entry.reason && (
                        <div className="text-[10px] text-stone-400 truncate max-w-[130px] mt-0.5">
                          {entry.reason}
                        </div>
                      )}
                    </td>

                    <td className="py-4 px-5">
                      <div className="font-bold text-stone-900">{entry.productName}</div>
                      <div className="text-[11px] font-mono text-stone-400">{entry.sku}</div>
                    </td>

                    <td className="py-4 px-5 text-stone-600 font-mono text-[11px]">
                      {entry.fromLocation}
                    </td>

                    <td className="py-4 px-5 text-stone-600 font-mono text-[11px]">
                      {entry.toLocation}
                    </td>

                    <td className="py-4 px-5 text-right">
                      <span className={`font-mono font-bold text-xs ${
                        entry.quantityDelta > 0
                          ? 'text-[#1c644d]'
                          : entry.quantityDelta < 0
                          ? 'text-[#9e3a24]'
                          : 'text-stone-500'
                      }`}>
                        {entry.quantityDelta > 0 ? `+${entry.quantityDelta}` : entry.quantityDelta} {entry.unit}
                      </span>
                    </td>

                    <td className="py-4 px-5 text-right font-mono font-bold text-stone-900">
                      {entry.balanceAfter.toLocaleString()} {entry.unit}
                    </td>

                    <td className="py-4 px-5 text-stone-600">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-stone-400" />
                        <span>{entry.operatorName}</span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="py-3.5 px-5 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
          <div>
            Showing {filteredLedger.length} of {ledger.length} ledger movements
          </div>
          <div className="flex items-center gap-2">
            <button className="p-1 rounded text-stone-400 hover:text-stone-700 disabled:opacity-40">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="w-6 h-6 rounded bg-[#1e3a34] text-white font-semibold text-xs flex items-center justify-center">
              1
            </span>
            <button className="p-1 rounded text-stone-400 hover:text-stone-700 disabled:opacity-40">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

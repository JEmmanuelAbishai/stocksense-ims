import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Plus,
  ChevronLeft,
  ChevronRight,
  Truck,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';
import { Operation, OperationStatus } from '../../types/inventory';
import { useAuth } from '../../context/AuthContext';

interface DeliveriesViewProps {
  onOpenNewDelivery: () => void;
  onInspectDelivery: (op: Operation) => void;
}

export const DeliveriesView: React.FC<DeliveriesViewProps> = ({
  onOpenNewDelivery,
  onInspectDelivery
}) => {
  const { operations } = useInventory();
  const { currentUser } = useAuth();
  const isManager = currentUser?.role === 'inventory_manager';
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const deliveries = useMemo(() => {
    return operations.filter(o => o.type === 'delivery');
  }, [operations]);

  const filteredDeliveries = useMemo(() => {
    return deliveries.filter(d => {
      if (statusFilter !== 'all' && d.status !== statusFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const codeMatch = d.code.toLowerCase().includes(q);
        const toMatch = d.partnerName?.toLowerCase().includes(q) || false;
        const itemMatch = d.items.some(i => i.productName.toLowerCase().includes(q));
        if (!codeMatch && !toMatch && !itemMatch) return false;
      }
      return true;
    });
  }, [deliveries, statusFilter, search]);

  const readyCount = deliveries.filter(d => d.status === 'ready').length;
  const waitingCount = deliveries.filter(d => d.status === 'waiting').length;

  const getStatusBadge = (status: OperationStatus) => {
    if (status === 'done') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e5f3ed] text-[#1c644d] text-xs font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-[#1c644d]"></span>
          Delivered
        </span>
      );
    }
    if (status === 'ready') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e5f3ed] text-[#1c644d] text-xs font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-[#1c644d]"></span>
          Ready to Ship
        </span>
      );
    }
    if (status === 'waiting') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
          Waiting Availability
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 text-stone-600 text-xs font-medium">
        <span className="w-1.5 h-1.5 rounded-full bg-stone-400"></span>
        Draft
      </span>
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pt-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold tracking-widest text-[#1e3a34] dark:text-[#d89ec5] uppercase">
              OUTBOUND OPERATIONS
            </span>
            <span className={`text-[10px] font-mono px-2 py-0.2 rounded-full font-semibold ${
              isManager ? 'bg-[#e5f3ed] text-[#1c644d] dark:bg-[#714B67]/30 dark:text-[#f0bfe5]' : 'bg-amber-100 text-amber-800'
            }`}>
              {isManager ? 'Manager Priority: Outgoing Stock' : 'Staff Action: Pick & Pack'}
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-[#1c2a27] dark:text-[#f8ecf5] tracking-tight">
            Delivery Orders
          </h1>
          <p className="text-sm text-stone-600 dark:text-slate-400 mt-1">
            {isManager
              ? 'Validate customer sales orders, track dispatch status, and decrement inventory upon shipment.'
              : 'Pick inventory items from storage bays, pack shipment parcels, and stage orders at outbound dock.'}
          </p>
        </div>

        <button
          onClick={onOpenNewDelivery}
          className="px-4 py-2.5 bg-[#1e3a34] hover:bg-[#162c27] text-white rounded-xl text-xs font-semibold tracking-wide transition-all shadow-sm flex items-center gap-2 cursor-pointer self-start sm:self-auto shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New Delivery</span>
        </button>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-2 max-w-md w-full">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by reference, customer, or SKU"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 bg-white border border-stone-300 rounded-xl text-xs text-[#1c2a27] placeholder:text-stone-400 focus:outline-none focus:border-[#1e3a34]"
            />
          </div>

          <button
            onClick={() => setStatusFilter(statusFilter === 'all' ? 'ready' : 'all')}
            className={`px-3.5 py-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer shrink-0 ${
              statusFilter !== 'all'
                ? 'bg-[#1e3a34] text-white border-[#1e3a34]'
                : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-50'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filters</span>
          </button>
        </div>

        {/* Counter indicators */}
        <div className="flex items-center gap-4 text-xs font-medium">
          <div className="flex items-center gap-1.5 text-stone-600">
            <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
            <span>{readyCount} ready to dispatch</span>
          </div>
          <div className="flex items-center gap-1.5 text-stone-600">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <span>{waitingCount} waiting stock</span>
          </div>
        </div>
      </div>

      {/* Deliveries Table */}
      <div className="bg-white rounded-2xl border border-stone-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-stone-200/80 bg-stone-50/60 text-stone-500 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-5">REFERENCE</th>
                <th className="py-3 px-5">TO (CUSTOMER)</th>
                <th className="py-3 px-5">FROM LOCATION</th>
                <th className="py-3 px-5">ITEMS ORDERED</th>
                <th className="py-3 px-5">SCHEDULE DATE</th>
                <th className="py-3 px-5">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-[#1c2a27]">
              {filteredDeliveries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-stone-400">
                    No delivery orders found.
                  </td>
                </tr>
              ) : (
                filteredDeliveries.map(d => (
                  <tr
                    key={d.id}
                    onClick={() => onInspectDelivery(d)}
                    className="hover:bg-stone-50/80 transition-colors cursor-pointer group"
                  >
                    <td className="py-4 px-5 font-mono font-bold text-stone-900 group-hover:text-[#1e3a34]">
                      {d.code}
                    </td>
                    <td className="py-4 px-5 font-bold text-stone-900">
                      {d.partnerName || 'Direct Customer'}
                    </td>
                    <td className="py-4 px-5 text-stone-500">
                      North Dock / Stock
                    </td>
                    <td className="py-4 px-5 text-stone-700">
                      <div className="font-medium">
                        {d.items.map(i => `${i.productName} (${i.quantity})`).join(', ')}
                      </div>
                      <div className="text-[10px] font-mono text-stone-400">
                        {d.items.map(i => i.sku).join(' · ')}
                      </div>
                    </td>
                    <td className="py-4 px-5 text-stone-600">
                      {d.date}
                    </td>
                    <td className="py-4 px-5">
                      {getStatusBadge(d.status)}
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
            Showing {filteredDeliveries.length} of {deliveries.length} delivery orders
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

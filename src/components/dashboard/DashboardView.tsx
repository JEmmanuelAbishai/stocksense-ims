import React, { useState, useEffect } from 'react';
import {
  Package,
  Truck,
  ArrowUpRight,
  Clock,
  AlertCircle,
  Plus,
  ArrowRight,
  ArrowRightLeft,
  SlidersHorizontal,
  CheckCircle2,
  Boxes,
  MapPin,
  ClipboardList,
  Layers,
  ArrowDownToLine,
  Check
} from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';
import { useAuth } from '../../context/AuthContext';
import { NavTab } from '../layout/Navbar';
import { Operation } from '../../types/inventory';

interface DashboardViewProps {
  onSelectTab: (tab: NavTab) => void;
  onOpenQuickAction: () => void;
  onInspectOperation: (op: Operation) => void;
  onInitiateReorder?: (productId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onSelectTab,
  onOpenQuickAction,
  onInspectOperation,
  onInitiateReorder
}) => {
  const { operations, products, warehouses, validateOperation } = useInventory();
  const { currentUser } = useAuth();

  const isManager = currentUser?.role === 'inventory_manager';
  const currentWh = warehouses[0];
  const firstName = currentUser?.name?.split(' ')[0] || 'Dexter';

  // Dynamic date based on user's PC time that updates each day
  const getDynamicDateString = () => {
    const now = new Date();
    const weekday = now.toLocaleDateString(undefined, { weekday: 'long' });
    const day = now.getDate();
    const month = now.toLocaleDateString(undefined, { month: 'long' });
    return `${weekday}, ${day} ${month}`.toUpperCase();
  };

  const [formattedDate, setFormattedDate] = useState<string>(getDynamicDateString);

  useEffect(() => {
    // Update immediately on mount
    setFormattedDate(getDynamicDateString());

    // Check periodically (every 10 seconds) so when midnight arrives, it seamlessly rolls over
    const timer = setInterval(() => {
      setFormattedDate(getDynamicDateString());
    }, 10000);

    return () => clearInterval(timer);
  }, []);

  // State for floor picking tasks simulation for warehouse staff
  const [completedFloorTasks, setCompletedFloorTasks] = useState<string[]>([]);

  // Receipts summary numbers (Inbound stock)
  const receiptOps = operations.filter(o => o.type === 'receipt');
  const receiptsToReceive = receiptOps.filter(o => o.status === 'ready' || o.status === 'waiting').length;
  const receiptsLate = 1; // from Figma mockup
  const receiptsTotal = receiptOps.length;

  // Deliveries summary numbers (Outbound stock)
  const deliveryOps = operations.filter(o => o.type === 'delivery');
  const deliveriesToDeliver = deliveryOps.filter(o => o.status === 'ready' || o.status === 'waiting').length;
  const deliveriesLate = 1;
  const deliveriesWaiting = 2;
  const deliveriesTotal = deliveryOps.length;

  // Internal transfers numbers (Floor movements)
  const transferOps = operations.filter(o => o.type === 'internal');
  const pendingTransfers = transferOps.filter(o => o.status === 'ready' || o.status === 'waiting').length;
  const completedTransfers = transferOps.filter(o => o.status === 'done').length;

  // Adjustments numbers (Physical counts)
  const adjustmentOps = operations.filter(o => o.type === 'adjustment');
  const lowStockProducts = products.filter(p => p.totalStock <= p.minReorderLevel);

  const handleQuickPick = (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCompletedFloorTasks(prev => [...prev, taskId]);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pt-1">
        <div>
          <div className="text-[11px] font-bold tracking-widest text-[#1e3a34] dark:text-[#d89ec5] uppercase mb-1">
            {formattedDate}
          </div>
          <h1 className="text-3xl font-extrabold text-[#1c2a27] dark:text-[#f8ecf5] tracking-tight">
            Welcome, {firstName}
          </h1>
          <p className="text-sm text-stone-600 dark:text-slate-400 mt-1">
            {currentWh?.name || 'North Dock'} is operating normally. Here’s what needs attention today.
          </p>
        </div>

        <button
          onClick={onOpenQuickAction}
          className="px-4 py-2.5 bg-[#1e3a34] dark:bg-[#714B67] hover:bg-[#162c27] dark:hover:bg-[#5d3d54] text-white rounded-xl text-xs font-semibold tracking-wide transition-all shadow-sm flex items-center gap-2 cursor-pointer self-start sm:self-auto shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>{isManager ? 'New shipment / order' : 'New floor task'}</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* PERSPECTIVE 1: INVENTORY MANAGERS (Incoming & Outgoing Stock)              */}
      {/* ========================================================================= */}
      {isManager && (
        <>
          {/* 2 Big Top Cards: Receipts & Deliveries */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Card 1: Receipts (Inbound stock) */}
            <div
              onClick={() => onSelectTab('receipts')}
              className="bg-white dark:bg-[#141b2a] rounded-2xl p-6 border border-stone-200/90 dark:border-slate-800/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:border-stone-300 dark:hover:border-slate-700 transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#e5f0ec] dark:bg-[#714B67]/30 text-[#1e3a34] dark:text-[#f0bfe5] flex items-center justify-center">
                      <Package className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-[#1c2a27] dark:text-[#f8ecf5] group-hover:text-[#1e3a34] dark:group-hover:text-[#f0bfe5] transition-colors">
                        Receipts
                      </h3>
                      <div className="text-xs text-stone-500 dark:text-slate-400">Inbound vendor shipments</div>
                    </div>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-stone-400 dark:text-slate-500 group-hover:text-[#1e3a34] dark:group-hover:text-[#f0bfe5] transition-colors" />
                </div>

                {/* Metrics Row */}
                <div className="grid grid-cols-3 gap-4 my-2">
                  <div>
                    <div className="text-3xl font-bold text-[#1e3a34] dark:text-[#f0bfe5] font-mono">
                      {receiptsToReceive || 4}
                    </div>
                    <div className="text-xs text-stone-500 dark:text-slate-400 mt-0.5">to receive</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-[#9e3a24] dark:text-[#fb7185] font-mono">
                      {receiptsLate}
                    </div>
                    <div className="text-xs text-stone-500 dark:text-slate-400 mt-0.5">late</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-[#1c2a27] dark:text-[#f8ecf5] font-mono">
                      {receiptsTotal || 6}
                    </div>
                    <div className="text-xs text-stone-500 dark:text-slate-400 mt-0.5">operations</div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-stone-100 dark:border-slate-800/70 text-xs text-stone-500 dark:text-slate-400 mt-4 flex items-center justify-between">
                <span>Next arrival: <strong className="text-stone-800 dark:text-slate-200">Copper & Pine Co. at 10:30</strong></span>
                <span className="text-[#1e3a34] dark:text-[#e4a8d4] font-semibold text-[11px]">Manage Inbound →</span>
              </div>
            </div>

            {/* Card 2: Deliveries (Outbound stock) */}
            <div
              onClick={() => onSelectTab('deliveries')}
              className="bg-white dark:bg-[#141b2a] rounded-2xl p-6 border border-stone-200/90 dark:border-slate-800/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:border-stone-300 dark:hover:border-slate-700 transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#e5f0ec] dark:bg-[#714B67]/30 text-[#1e3a34] dark:text-[#f0bfe5] flex items-center justify-center">
                      <Truck className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-[#1c2a27] dark:text-[#f8ecf5] group-hover:text-[#1e3a34] dark:group-hover:text-[#f0bfe5] transition-colors">
                        Deliveries
                      </h3>
                      <div className="text-xs text-stone-500 dark:text-slate-400">Outbound customer dispatches</div>
                    </div>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-stone-400 dark:text-slate-500 group-hover:text-[#1e3a34] dark:group-hover:text-[#f0bfe5] transition-colors" />
                </div>

                {/* Metrics Row */}
                <div className="grid grid-cols-4 gap-3 my-2">
                  <div>
                    <div className="text-3xl font-bold text-[#9e3a24] dark:text-[#e4a8d4] font-mono">
                      {deliveriesToDeliver || 4}
                    </div>
                    <div className="text-xs text-stone-500 dark:text-slate-400 mt-0.5">to deliver</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-[#9e3a24] dark:text-[#fb7185] font-mono">
                      {deliveriesLate}
                    </div>
                    <div className="text-xs text-stone-500 dark:text-slate-400 mt-0.5">late</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-[#a06214] dark:text-[#c084fc] font-mono">
                      {deliveriesWaiting}
                    </div>
                    <div className="text-xs text-stone-500 dark:text-slate-400 mt-0.5">waiting</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-[#1c2a27] dark:text-[#f8ecf5] font-mono">
                      {deliveriesTotal || 6}
                    </div>
                    <div className="text-xs text-stone-500 dark:text-slate-400 mt-0.5">operations</div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-stone-100 dark:border-slate-800/70 text-xs text-stone-500 dark:text-slate-400 mt-4 flex items-center justify-between">
                <span><strong className="text-stone-800 dark:text-slate-200">2 orders</strong> waiting for stock allocation</span>
                <span className="text-[#1e3a34] dark:text-[#e4a8d4] font-semibold text-[11px]">Manage Outbound →</span>
              </div>
            </div>
          </div>

          {/* Bottom 2 Cards: Recent Movement & Priority Queue */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Recent Movement */}
            <div className="bg-white dark:bg-[#141b2a] rounded-2xl border border-stone-200/90 dark:border-slate-800/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-stone-100 dark:border-slate-800/70 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-[#1c2a27] dark:text-[#f8ecf5]">Incoming & Outgoing Stream</h3>
                  <p className="text-[11px] text-stone-500 dark:text-slate-400">Live logistics queue</p>
                </div>
                <button
                  onClick={() => onSelectTab('move_history')}
                  className="text-xs font-semibold text-[#1e3a34] dark:text-[#e4a8d4] hover:underline cursor-pointer"
                >
                  View ledger
                </button>
              </div>

              <div className="divide-y divide-stone-100 dark:divide-slate-800/60 text-xs">
                <div
                  onClick={() => onSelectTab('receipts')}
                  className="py-3 flex items-center justify-between hover:bg-stone-50/70 dark:hover:bg-slate-800/40 transition-colors px-1 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-emerald-600 dark:bg-emerald-400"></span>
                    <span className="font-mono font-bold text-stone-900 dark:text-slate-200">WH/IN/0001</span>
                    <span className="text-stone-700 dark:text-slate-300 font-medium ml-2">Copper & Pine Co.</span>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="text-stone-500 dark:text-slate-400">Receipt ready</span>
                    <span className="font-mono text-stone-400 dark:text-slate-500">09:42</span>
                  </div>
                </div>

                <div
                  onClick={() => onSelectTab('deliveries')}
                  className="py-3 flex items-center justify-between hover:bg-stone-50/70 dark:hover:bg-slate-800/40 transition-colors px-1 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-[#9e3a24] dark:bg-rose-400"></span>
                    <span className="font-mono font-bold text-stone-900 dark:text-slate-200">WH/OUT/0001</span>
                    <span className="text-stone-700 dark:text-slate-300 font-medium ml-2">Harbor Stores — East</span>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="text-stone-500 dark:text-slate-400">Waiting to pack</span>
                    <span className="font-mono text-stone-400 dark:text-slate-500">09:18</span>
                  </div>
                </div>

                <div
                  onClick={() => onSelectTab('receipts')}
                  className="py-3 flex items-center justify-between hover:bg-stone-50/70 dark:hover:bg-slate-800/40 transition-colors px-1 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-emerald-600 dark:bg-emerald-400"></span>
                    <span className="font-mono font-bold text-stone-900 dark:text-slate-200">WH/IN/0004</span>
                    <span className="text-stone-700 dark:text-slate-300 font-medium ml-2">Brightline Supply</span>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="text-stone-500 dark:text-slate-400">Received</span>
                    <span className="font-mono text-stone-400 dark:text-slate-500">Yesterday</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Low Stock Replenishment Alerts for Inventory Managers */}
            <div className="bg-white dark:bg-[#141b2a] rounded-2xl border border-stone-200/90 dark:border-slate-800/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-stone-100 dark:border-slate-800/70 pb-3 mb-3">
                  <div>
                    <h3 className="text-sm font-bold text-[#1c2a27] dark:text-[#f8ecf5]">Safety Stock Replenishment</h3>
                    <p className="text-[11px] text-stone-500 dark:text-slate-400">SKUs below min reorder levels</p>
                  </div>
                  <button
                    onClick={() => onSelectTab('products')}
                    className="text-xs font-semibold text-[#1e3a34] dark:text-[#e4a8d4] hover:underline cursor-pointer"
                  >
                    Catalog ({products.length})
                  </button>
                </div>

                <div className="space-y-3">
                  {lowStockProducts.slice(0, 2).map(prod => (
                    <div
                      key={prod.id}
                      className="p-3 rounded-xl bg-stone-50 dark:bg-slate-800/50 border border-stone-200/70 dark:border-slate-700/60 flex items-center justify-between"
                    >
                      <div>
                        <div className="text-xs font-bold text-[#1c2a27] dark:text-[#f8ecf5]">{prod.name}</div>
                        <div className="text-[11px] text-stone-500 dark:text-slate-400 font-mono mt-0.5">
                          {prod.sku} · On Hand: <strong className="text-rose-700 dark:text-rose-400">{prod.totalStock}</strong> (Min: {prod.minReorderLevel})
                        </div>
                      </div>
                      {onInitiateReorder && (
                        <button
                          onClick={() => onInitiateReorder(prod.id)}
                          className="px-2.5 py-1 rounded-lg bg-[#1e3a34] dark:bg-[#714B67] hover:bg-[#162c27] dark:hover:bg-[#5d3d54] text-white text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                        >
                          <ArrowDownToLine className="w-3 h-3" />
                          <span>Reorder</span>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-stone-100 dark:border-slate-800/70 flex items-center justify-between text-xs mt-4">
                <span className="text-stone-500 dark:text-slate-400">Warehouse Capacity Utilization</span>
                <span className="text-stone-800 dark:text-slate-200 font-bold font-mono text-xs">
                  {Math.round((currentWh?.currentOccupancy || 7200) / (currentWh?.maxCapacity || 10000) * 100)}% occupied
                </span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ========================================================================= */}
      {/* PERSPECTIVE 2: WAREHOUSE STAFF (Transfers, Picking, Shelving & Counting)   */}
      {/* ========================================================================= */}
      {!isManager && (
        <>
          {/* 2 Big Top Cards for Warehouse Staff */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Card 1: Internal Transfers & Relocations */}
            <div
              onClick={() => onSelectTab('transfers')}
              className="bg-white dark:bg-[#141b2a] rounded-2xl p-6 border border-stone-200/90 dark:border-slate-800/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:border-stone-300 dark:hover:border-slate-700 transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-[#714B67]/30 text-[#b45309] dark:text-[#f0bfe5] flex items-center justify-center">
                      <ArrowRightLeft className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-[#1c2a27] dark:text-[#f8ecf5] group-hover:text-[#b45309] dark:group-hover:text-[#f0bfe5] transition-colors">
                        Internal Transfers & Relocations
                      </h3>
                      <div className="text-xs text-stone-500 dark:text-slate-400">Rack-to-rack bay movements</div>
                    </div>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-stone-400 dark:text-slate-500 group-hover:text-[#b45309] dark:group-hover:text-[#f0bfe5] transition-colors" />
                </div>

                {/* Metrics Row */}
                <div className="grid grid-cols-3 gap-4 my-2">
                  <div>
                    <div className="text-3xl font-bold text-[#b45309] dark:text-[#e4a8d4] font-mono">
                      {pendingTransfers || 2}
                    </div>
                    <div className="text-xs text-stone-500 dark:text-slate-400 mt-0.5">ready to move</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-[#1c644d] dark:text-[#f0bfe5] font-mono">
                      {completedTransfers || 4}
                    </div>
                    <div className="text-xs text-stone-500 dark:text-slate-400 mt-0.5">completed today</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-[#1c2a27] dark:text-[#f8ecf5] font-mono">
                      {transferOps.length}
                    </div>
                    <div className="text-xs text-stone-500 dark:text-slate-400 mt-0.5">total orders</div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-stone-100 dark:border-slate-800/70 text-xs text-stone-500 dark:text-slate-400 mt-4 flex items-center justify-between">
                <span>Active path: <strong className="text-stone-800 dark:text-slate-200">Bulk Bay 02 → Pallet Rack A1</strong></span>
                <span className="text-[#b45309] dark:text-[#e4a8d4] font-semibold text-[11px]">Execute Transfers →</span>
              </div>
            </div>

            {/* Card 2: Physical Counts & Adjustments */}
            <div
              onClick={() => onSelectTab('adjustments')}
              className="bg-white dark:bg-[#141b2a] rounded-2xl p-6 border border-stone-200/90 dark:border-slate-800/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:border-stone-300 dark:hover:border-slate-700 transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#e5f0ec] dark:bg-[#714B67]/30 text-[#1e3a34] dark:text-[#f0bfe5] flex items-center justify-center">
                      <SlidersHorizontal className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-[#1c2a27] dark:text-[#f8ecf5] group-hover:text-[#1e3a34] dark:group-hover:text-[#f0bfe5] transition-colors">
                        Physical Stock Counting
                      </h3>
                      <div className="text-xs text-stone-500 dark:text-slate-400">Cycle counts & bay audits</div>
                    </div>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-stone-400 dark:text-slate-500 group-hover:text-[#1e3a34] dark:group-hover:text-[#f0bfe5] transition-colors" />
                </div>

                {/* Metrics Row */}
                <div className="grid grid-cols-3 gap-4 my-2">
                  <div>
                    <div className="text-3xl font-bold text-[#1e3a34] dark:text-[#e4a8d4] font-mono">
                      {adjustmentOps.length || 3}
                    </div>
                    <div className="text-xs text-stone-500 dark:text-slate-400 mt-0.5">counts verified</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-[#1c644d] dark:text-[#f0bfe5] font-mono">
                      98.6%
                    </div>
                    <div className="text-xs text-stone-500 dark:text-slate-400 mt-0.5">count accuracy</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-[#1c2a27] dark:text-[#f8ecf5] font-mono">
                      Aisle 04
                    </div>
                    <div className="text-xs text-stone-500 dark:text-slate-400 mt-0.5">audit zone today</div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-stone-100 dark:border-slate-800/70 text-xs text-stone-500 dark:text-slate-400 mt-4 flex items-center justify-between">
                <span>Cycle count scheduled for <strong className="text-stone-800 dark:text-slate-200">High-Bay Rack C3</strong></span>
                <span className="text-[#1e3a34] dark:text-[#e4a8d4] font-semibold text-[11px]">Record Count →</span>
              </div>
            </div>
          </div>

          {/* Floor Execution Panels: 1. Picking Tasks Queue & 2. Shelving/Putaway Queue */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Active Floor Picking Tasks */}
            <div className="bg-white rounded-2xl border border-stone-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div className="flex items-center gap-2">
                  <ClipboardList className="w-4 h-4 text-[#b45309]" />
                  <div>
                    <h3 className="text-sm font-bold text-[#1c2a27] dark:text-[#f8ecf5]">Active Floor Picking Queue</h3>
                    <p className="text-[11px] text-stone-500 dark:text-slate-400">Pick items from racks for dispatch</p>
                  </div>
                </div>
                <button
                  onClick={() => onSelectTab('deliveries')}
                  className="text-xs font-semibold text-[#b45309] dark:text-[#f0bfe5] hover:underline cursor-pointer"
                >
                  Deliveries
                </button>
              </div>

              <div className="space-y-3">
                {[
                  { id: 'task-1', ref: 'WH/OUT/0001', item: 'Steel Rods 25mm', loc: 'Rack A1 (Main Storage)', qty: 15, unit: 'Units' },
                  { id: 'task-2', ref: 'WH/OUT/0002', item: 'Hydraulic Cylinder H2', loc: 'Bulk Pallet Bay 02', qty: 4, unit: 'Units' }
                ].map(task => {
                  const isDone = completedFloorTasks.includes(task.id);
                  return (
                    <div
                      key={task.id}
                      className={`p-3.5 rounded-xl border transition-all flex items-center justify-between ${
                        isDone ? 'bg-emerald-50/70 border-emerald-200' : 'bg-stone-50 border-stone-200/80'
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs text-stone-900">{task.ref}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-semibold">
                            Pick
                          </span>
                        </div>
                        <div className="text-xs font-semibold text-stone-800 mt-1">{task.item}</div>
                        <div className="text-[11px] text-stone-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-stone-400" />
                          <span>{task.loc}</span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="font-mono font-bold text-xs text-stone-900 mb-1">
                          {task.qty} {task.unit}
                        </div>
                        <button
                          onClick={(e) => handleQuickPick(task.id, e)}
                          disabled={isDone}
                          className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
                            isDone
                              ? 'bg-emerald-600 text-white cursor-default'
                              : 'bg-[#1e3a34] hover:bg-[#162c27] text-white shadow-xs'
                          }`}
                        >
                          {isDone ? <Check className="w-3 h-3 stroke-[3]" /> : null}
                          <span>{isDone ? 'Picked' : 'Confirm Pick'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Shelving & Putaway Queue */}
            <div className="bg-white rounded-2xl border border-stone-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#1e3a34] dark:text-[#f0bfe5]" />
                  <div>
                    <h3 className="text-sm font-bold text-[#1c2a27] dark:text-[#f8ecf5]">Shelving & Putaway Queue</h3>
                    <p className="text-[11px] text-stone-500 dark:text-slate-400">Transfer unloaded goods to storage bays</p>
                  </div>
                </div>
                <button
                  onClick={() => onSelectTab('transfers')}
                  className="text-xs font-semibold text-[#1e3a34] dark:text-[#e4a8d4] hover:underline cursor-pointer"
                >
                  New transfer
                </button>
              </div>

              <div className="space-y-3">
                {[
                  { id: 'shelve-1', item: 'Copper Fittings 1/2"', from: 'Inbound Dock 01', to: 'Pallet Rack A1', qty: 100, unit: 'Units' },
                  { id: 'shelve-2', item: 'Industrial Fasteners M8', from: 'Staging Area Bay 01', to: 'High-Bay Rack C3', qty: 250, unit: 'Units' }
                ].map(item => {
                  const isDone = completedFloorTasks.includes(item.id);
                  return (
                    <div
                      key={item.id}
                      className={`p-3.5 rounded-xl border transition-all flex items-center justify-between ${
                        isDone ? 'bg-emerald-50/70 border-emerald-200' : 'bg-stone-50 border-stone-200/80'
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <div className="text-xs font-bold text-stone-900">{item.item}</div>
                        <div className="text-[11px] text-stone-600 mt-0.5 flex items-center gap-1 font-mono">
                          <span className="text-stone-500">{item.from}</span>
                          <ArrowRight className="w-3 h-3 text-[#1e3a34]" />
                          <span className="text-[#1e3a34] font-bold">{item.to}</span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="font-mono font-bold text-xs text-stone-900 mb-1">
                          {item.qty} {item.unit}
                        </div>
                        <button
                          onClick={(e) => handleQuickPick(item.id, e)}
                          disabled={isDone}
                          className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
                            isDone
                              ? 'bg-emerald-600 text-white cursor-default'
                              : 'bg-white border border-stone-300 hover:bg-stone-100 text-stone-800 shadow-xs'
                          }`}
                        >
                          {isDone ? <Check className="w-3 h-3 stroke-[3]" /> : null}
                          <span>{isDone ? 'Shelved' : 'Shelve to Bay'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

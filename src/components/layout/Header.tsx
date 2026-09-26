import React, { useState } from 'react';
import {
  Bell,
  Search,
  Plus,
  Warehouse as WarehouseIcon,
  AlertTriangle,
  FileSpreadsheet,
  CheckCircle2
} from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';
import { useAuth } from '../../context/AuthContext';
import { NavTab } from './Sidebar';

interface HeaderProps {
  activeTab: NavTab;
  onOpenQuickAction: () => void;
  onSelectTab: (tab: NavTab) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onOpenQuickAction,
  onSelectTab
}) => {
  const { warehouses, filter, setFilter, lowStockAlerts, exportLedgerCsv } = useInventory();
  const { currentUser } = useAuth();
  const [showAlertMenu, setShowAlertMenu] = useState(false);

  const tabTitles: Record<NavTab, { title: string; subtitle: string }> = {
    dashboard: { title: 'Inventory Dashboard', subtitle: 'Live operations overview & metrics' },
    products: { title: 'Product Catalog', subtitle: 'Master items, SKUs & reorder limits' },
    receipts: { title: 'Inbound Receipts', subtitle: 'Receive vendor consignments into stock' },
    deliveries: { title: 'Outbound Deliveries', subtitle: 'Pick, pack & dispatch customer orders' },
    transfers: { title: 'Internal Transfers', subtitle: 'Relocate materials between racks & zones' },
    adjustments: { title: 'Stock Adjustments', subtitle: 'Reconcile physical counts with ledger' },
    ledger: { title: 'Stock Movement Ledger', subtitle: 'Immutable transaction audit log' },
    settings: { title: 'Warehouse Settings', subtitle: 'Locations, zones & facility parameters' }
  };

  const currentMeta = tabTitles[activeTab] || { title: 'Operations', subtitle: 'Stock management' };

  return (
    <header className="h-16 px-6 bg-slate-900/90 backdrop-blur-sm border-b border-slate-800 flex items-center justify-between shrink-0 sticky top-0 z-30">
      {/* Left: Contextual Breadcrumb Trail */}
      <div className="flex items-center gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>StockSense</span>
            <span>/</span>
            <span className="text-amber-400 font-medium capitalize">{activeTab}</span>
          </div>
          <h1 className="text-base font-bold text-white tracking-tight">{currentMeta.title}</h1>
        </div>
      </div>

      {/* Middle: Universal Search & Warehouse Filter */}
      <div className="hidden md:flex items-center gap-3 max-w-md w-full mx-6">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search SKU, item name, reference..."
            value={filter.searchQuery}
            onChange={(e) => setFilter(prev => ({ ...prev, searchQuery: e.target.value }))}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/70 transition-colors font-sans"
          />
        </div>

        {/* Warehouse Selector */}
        <div className="relative shrink-0">
          <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300">
            <WarehouseIcon className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filter.warehouseId}
              onChange={(e) => setFilter(prev => ({ ...prev, warehouseId: e.target.value }))}
              aria-label="Filter by warehouse"
              className="bg-transparent text-xs text-slate-200 focus:outline-none cursor-pointer pr-1"
            >
              <option value="all" className="bg-slate-900 text-slate-200">All Warehouses</option>
              {warehouses.map(wh => (
                <option key={wh.id} value={wh.id} className="bg-slate-900 text-slate-200">
                  {wh.code} - {wh.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Right: Actions, Alerts, Quick Action */}
      <div className="flex items-center gap-2.5">
        {/* Quick CSV Export */}
        <button
          onClick={exportLedgerCsv}
          title="Export Stock Movement Ledger (CSV)"
          className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-950 text-xs font-medium text-slate-300 hover:text-white hover:border-slate-700 transition-colors cursor-pointer"
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-amber-400" />
          <span>Audit Export</span>
        </button>

        {/* Low Stock Alerts Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowAlertMenu(!showAlertMenu)}
            className="relative p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-colors cursor-pointer"
            title="Stock alerts"
          >
            <Bell className="w-4 h-4" />
            {lowStockAlerts.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-[10px] font-bold text-white flex items-center justify-center font-mono animate-pulse">
                {lowStockAlerts.length}
              </span>
            )}
          </button>

          {/* Low Stock Dropdown */}
          {showAlertMenu && (
            <div className="absolute right-0 mt-2 w-80 bg-slate-950 border border-slate-800 rounded-xl shadow-xl z-50 p-3 overflow-hidden">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-xs font-semibold text-white">
                <div className="flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span>Inventory Alerts ({lowStockAlerts.length})</span>
                </div>
                <button
                  onClick={() => setShowAlertMenu(false)}
                  className="text-slate-400 hover:text-white text-xs"
                >
                  Close
                </button>
              </div>

              {lowStockAlerts.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto mb-1.5" />
                  All SKUs are above reorder thresholds!
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {lowStockAlerts.map(alert => (
                    <div
                      key={alert.product.id}
                      className="p-2.5 rounded-lg bg-slate-900 border border-slate-800/80 text-xs flex items-center justify-between"
                    >
                      <div>
                        <div className="font-medium text-white truncate max-w-[170px]">{alert.product.name}</div>
                        <div className="text-[11px] font-mono text-slate-400">
                          {alert.product.sku} · Current: <span className="text-rose-400 font-bold">{alert.product.totalStock}</span> / Min: {alert.product.minReorderLevel}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setShowAlertMenu(false);
                          onSelectTab('receipts');
                          onOpenQuickAction();
                        }}
                        className="px-2 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded text-[11px] font-semibold cursor-pointer shrink-0"
                      >
                        Reorder
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Primary Action Button */}
        <button
          onClick={onOpenQuickAction}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer whitespace-nowrap"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>New Operation</span>
        </button>
      </div>
    </header>
  );
};

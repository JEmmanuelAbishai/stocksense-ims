import React from 'react';
import {
  LayoutDashboard,
  Boxes,
  ArrowDownToLine,
  Truck,
  ArrowLeftRight,
  SlidersHorizontal,
  History,
  Building2,
  Users,
  LogOut,
  GitBranch,
  ShieldCheck,
  PackageCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useInventory } from '../../context/InventoryContext';

export type NavTab =
  | 'dashboard'
  | 'products'
  | 'receipts'
  | 'deliveries'
  | 'transfers'
  | 'adjustments'
  | 'ledger'
  | 'settings';

interface SidebarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  onOpenProfile: () => void;
  onOpenTeam: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  onOpenProfile,
  onOpenTeam
}) => {
  const { currentUser, logout, switchRole, isDexterAccount } = useAuth();
  const { lowStockAlerts, kpis } = useInventory();

  const isManager = currentUser?.role === 'inventory_manager';

  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col justify-between shrink-0 select-none">
      {/* Brand Zone */}
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <PackageCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
              StockSense
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-amber-400 border border-slate-700">IMS</span>
            </div>
            <div className="text-xs text-slate-400">Inventory Management System</div>
          </div>
        </div>

        {/* Current Active Role Indicator */}
        <div className="mt-3 p-2 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-300 font-medium capitalize">
              {isManager ? 'Inventory Manager' : 'Warehouse Staff'}
            </span>
          </div>
          <button
            onClick={() => switchRole(isManager ? 'warehouse_staff' : 'inventory_manager')}
            className="text-[11px] text-amber-400 hover:text-amber-300 underline font-medium cursor-pointer"
            title="Toggle between Manager and Staff roles to test role-based UI"
          >
            Switch
          </button>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-4 px-3 space-y-6 overflow-y-auto">
        {/* Core Overview */}
        <div>
          <div className="px-3 mb-1 text-[11px] font-medium tracking-wider text-slate-500 uppercase">
            Overview
          </div>
          <nav className="space-y-0.5">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-300 hover:bg-slate-900 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('products')}
              className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors cursor-pointer ${
                activeTab === 'products'
                  ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-300 hover:bg-slate-900 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Boxes className="w-4 h-4" />
                <span>Products Catalog</span>
              </div>
              {lowStockAlerts.length > 0 && (
                <span className={`text-[11px] font-mono font-medium px-1.5 py-0.2 rounded ${
                  activeTab === 'products' ? 'bg-slate-950 text-amber-300' : 'bg-rose-500/20 text-rose-300'
                }`}>
                  {lowStockAlerts.length}
                </span>
              )}
            </button>
          </nav>
        </div>

        {/* Operations Section */}
        <div>
          <div className="px-3 mb-1 text-[11px] font-medium tracking-wider text-slate-500 uppercase">
            Operations
          </div>
          <nav className="space-y-0.5">
            <button
              onClick={() => setActiveTab('receipts')}
              className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors cursor-pointer ${
                activeTab === 'receipts'
                  ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-300 hover:bg-slate-900 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ArrowDownToLine className="w-4 h-4" />
                <span>Receipts (Inbound)</span>
              </div>
              {kpis.pendingReceiptsCount > 0 && (
                <span className={`text-[11px] font-mono px-1.5 py-0.2 rounded ${
                  activeTab === 'receipts' ? 'bg-slate-950 text-amber-300' : 'bg-slate-800 text-slate-400'
                }`}>
                  {kpis.pendingReceiptsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('deliveries')}
              className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors cursor-pointer ${
                activeTab === 'deliveries'
                  ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-300 hover:bg-slate-900 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Truck className="w-4 h-4" />
                <span>Deliveries (Outbound)</span>
              </div>
              {kpis.pendingDeliveriesCount > 0 && (
                <span className={`text-[11px] font-mono px-1.5 py-0.2 rounded ${
                  activeTab === 'deliveries' ? 'bg-slate-950 text-amber-300' : 'bg-slate-800 text-slate-400'
                }`}>
                  {kpis.pendingDeliveriesCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('transfers')}
              className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors cursor-pointer ${
                activeTab === 'transfers'
                  ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-300 hover:bg-slate-900 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ArrowLeftRight className="w-4 h-4" />
                <span>Internal Transfers</span>
              </div>
              {kpis.scheduledTransfersCount > 0 && (
                <span className={`text-[11px] font-mono px-1.5 py-0.2 rounded ${
                  activeTab === 'transfers' ? 'bg-slate-950 text-amber-300' : 'bg-slate-800 text-slate-400'
                }`}>
                  {kpis.scheduledTransfersCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('adjustments')}
              className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors cursor-pointer ${
                activeTab === 'adjustments'
                  ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-300 hover:bg-slate-900 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <SlidersHorizontal className="w-4 h-4" />
                <span>Stock Adjustments</span>
              </div>
            </button>
          </nav>
        </div>

        {/* Audit & Configuration */}
        <div>
          <div className="px-3 mb-1 text-[11px] font-medium tracking-wider text-slate-500 uppercase">
            Ledger & System
          </div>
          <nav className="space-y-0.5">
            <button
              onClick={() => setActiveTab('ledger')}
              className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors cursor-pointer ${
                activeTab === 'ledger'
                  ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-300 hover:bg-slate-900 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <History className="w-4 h-4" />
                <span>Move History Ledger</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-300 hover:bg-slate-900 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Building2 className="w-4 h-4" />
                <span>Warehouse Settings</span>
              </div>
            </button>
          </nav>
        </div>

        {/* Team 4-Member Work Distribution Context */}
        <div className="pt-2 border-t border-slate-800/80">
          <button
            onClick={onOpenTeam}
            className="w-full text-left px-3 py-2 rounded-lg bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-colors flex items-center justify-between cursor-pointer group"
          >
            <div className="flex items-center gap-2 text-xs text-slate-300 group-hover:text-white">
              <GitBranch className="w-3.5 h-3.5 text-amber-400" />
              <span>Team 4-Branch Matrix</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400 group-hover:text-amber-400">View</span>
          </button>
        </div>
      </div>

      {/* User Profile Footer Zone */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/80">
        <div className="flex items-center justify-between">
          <button
            onClick={onOpenProfile}
            className="flex items-center gap-2.5 text-left p-1.5 rounded-lg hover:bg-slate-900 transition-colors flex-1 min-w-0 cursor-pointer"
          >
            {isDexterAccount ? (
              <img
                src="/avatar.png"
                alt="Dexter Morgan"
                referrerPolicy="no-referrer"
                className="w-8 h-8 rounded-full object-cover border border-slate-700 shrink-0 bg-slate-800"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  if (!target.dataset.fallback) {
                    target.dataset.fallback = 'true';
                    target.src = '/avatar.jpeg';
                  }
                }}
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-slate-800 text-slate-200 font-bold text-xs flex items-center justify-center border border-slate-700 shrink-0">
                {currentUser?.name
                  ? currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
                  : 'OP'}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold text-white truncate">{currentUser?.name || 'Guest User'}</div>
              <div className="text-[11px] text-slate-400 truncate">{currentUser?.email}</div>
            </div>
          </button>
          <button
            onClick={logout}
            title="Log Out"
            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-900 rounded-lg transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};

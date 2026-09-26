import React from 'react';
import {
  X,
  User,
  ShieldCheck,
  Building2,
  Mail,
  LogOut,
  Check,
  ArrowRightLeft,
  Boxes,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useInventory } from '../../context/InventoryContext';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose
}) => {
  const { currentUser, switchRole, logout, isAlexAccount } = useAuth();
  const { warehouses, ledger } = useInventory();

  if (!isOpen || !currentUser) return null;

  const currentWh = warehouses.find(w => w.id === currentUser.warehouseId);
  const userActivities = ledger.filter(l => l.operatorId === currentUser.id).slice(0, 3);
  const isManager = currentUser.role === 'inventory_manager';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white border border-stone-200 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
        {/* Compact Header */}
        <div className="px-5 py-3.5 border-b border-stone-100 flex items-center justify-between bg-stone-50/60">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#e5f0ec] text-[#1e3a34] flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-stone-900 leading-tight">Operator Profile</h2>
              <p className="text-[10px] text-stone-500">Identity & Operational Role</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Compact Body with themed scrollbar */}
        <div className="p-4 overflow-y-auto space-y-3.5 text-xs">
          {/* User Bio Card */}
          <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/80 flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-[#1e3a34] text-white font-bold text-sm flex items-center justify-center border-2 border-white shadow-xs shrink-0">
              {currentUser.name
                ? currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
                : 'AM'}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-stone-900 truncate">{currentUser.name}</h3>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  isManager ? 'bg-[#e5f3ed] text-[#1c644d]' : 'bg-amber-50 text-amber-700'
                }`}>
                  {isManager ? 'Manager' : 'Staff'}
                </span>
              </div>
              <div className="text-stone-500 text-[11px] flex items-center gap-1.5 mt-0.5">
                <Mail className="w-3 h-3 text-stone-400" />
                <span className="truncate">{currentUser.email}</span>
              </div>
              <div className="text-stone-500 text-[11px] flex items-center gap-1.5 mt-0.5">
                <Building2 className="w-3 h-3 text-stone-400" />
                <span>{currentWh?.name || 'North Dock Facility'}</span>
              </div>
            </div>
          </div>

          {/* Role Section: Alex has switching option for demonstration purposes, other accounts have fixed determined roles */}
          {isAlexAccount ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between px-0.5">
                <span className="text-[11px] font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#1e3a34]" />
                  <span>Demonstration Role Switcher</span>
                </span>
                <span className="text-[10px] text-emerald-800 font-semibold bg-emerald-100/70 px-2 py-0.5 rounded-full">
                  Alex Demo Account
                </span>
              </div>

              <div className="grid grid-cols-1 gap-2">
                {/* Option 1: Inventory Manager */}
                <div
                  onClick={() => switchRole('inventory_manager')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative ${
                    isManager
                      ? 'bg-[#f6faf8] border-[#1e3a34] shadow-xs ring-1 ring-[#1e3a34]'
                      : 'bg-white border-stone-200/90 text-stone-600 hover:border-stone-300 hover:bg-stone-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                        isManager ? 'bg-[#1e3a34] text-white' : 'bg-stone-100 text-stone-600'
                      }`}>
                        <Boxes className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="font-bold text-xs text-stone-900 flex items-center gap-1.5">
                          <span>Inventory Manager</span>
                          <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-semibold">
                            In/Out Stock
                          </span>
                        </div>
                        <div className="text-[10px] text-stone-500 mt-0.5 leading-snug">
                          Manage incoming vendor receipts, customer delivery orders, reorder rules & inventory valuation.
                        </div>
                      </div>
                    </div>
                    {isManager && (
                      <span className="w-5 h-5 rounded-full bg-[#1e3a34] text-white flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                    )}
                  </div>
                </div>

                {/* Option 2: Warehouse Staff */}
                <div
                  onClick={() => switchRole('warehouse_staff')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative ${
                    !isManager
                      ? 'bg-[#fffcf7] border-[#b45309] shadow-xs ring-1 ring-[#b45309]'
                      : 'bg-white border-stone-200/90 text-stone-600 hover:border-stone-300 hover:bg-stone-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                        !isManager ? 'bg-[#b45309] text-white' : 'bg-stone-100 text-stone-600'
                      }`}>
                        <ArrowRightLeft className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="font-bold text-xs text-stone-900 flex items-center gap-1.5">
                          <span>Warehouse Staff</span>
                          <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-semibold">
                            Floor & Counts
                          </span>
                        </div>
                        <div className="text-[10px] text-stone-500 mt-0.5 leading-snug">
                          Perform rack-to-rack transfers, floor picking for shipments, shelving/putaway & physical counts.
                        </div>
                      </div>
                    </div>
                    {!isManager && (
                      <span className="w-5 h-5 rounded-full bg-[#b45309] text-white flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Fixed role determined through login for new accounts / other users */
            <div className="space-y-2">
              <div className="flex items-center justify-between px-0.5">
                <span className="text-[11px] font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#1e3a34]" />
                  <span>Account Assigned Role</span>
                </span>
                <span className="text-[10px] text-stone-600 font-semibold bg-stone-100 px-2 py-0.5 rounded-full">
                  Direct Login Role
                </span>
              </div>

              <div className={`p-3.5 rounded-xl border text-left ${
                isManager ? 'bg-[#f6faf8] border-[#1e3a34]' : 'bg-[#fffcf7] border-[#b45309]'
              }`}>
                <div className="flex items-start gap-2.5">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                    isManager ? 'bg-[#1e3a34] text-white' : 'bg-[#b45309] text-white'
                  }`}>
                    {isManager ? <Boxes className="w-4 h-4" /> : <ArrowRightLeft className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="font-bold text-xs text-stone-900 flex items-center gap-1.5">
                      <span>{isManager ? 'Inventory Manager' : 'Warehouse Staff'}</span>
                      <span className={`text-[9px] uppercase px-1.5 py-0.2 rounded font-semibold ${
                        isManager ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {isManager ? 'In/Out Stock' : 'Floor & Counts'}
                      </span>
                    </div>
                    <div className="text-[10px] text-stone-600 mt-1 leading-snug">
                      {isManager
                        ? 'Authorized to manage incoming vendor receipts, customer dispatches, reorder safety thresholds, and inventory valuation.'
                        : 'Authorized to execute rack transfers, pick items for customer shipments, shelve pallets, and perform physical counts.'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/80 text-[10px] text-stone-500 flex items-start gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                <span>
                  Role was directly determined through your account login credentials. Role switching is reserved for the Alex Morgan demonstration account.
                </span>
              </div>
            </div>
          )}

          {/* Recent Activity Mini-Feed */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block px-0.5">
              Recent Activity Log
            </span>
            {userActivities.length === 0 ? (
              <div className="p-2.5 text-center text-[11px] text-stone-400 bg-stone-50 rounded-lg">
                No recent activity logged.
              </div>
            ) : (
              userActivities.map(act => (
                <div
                  key={act.id}
                  className="px-2.5 py-1.5 rounded-lg bg-stone-50 border border-stone-200/70 flex items-center justify-between text-[11px]"
                >
                  <div className="truncate mr-2">
                    <span className="font-mono font-bold text-stone-800">{act.documentRef}</span>
                    <span className="text-stone-500 ml-1.5">· {act.productName}</span>
                  </div>
                  <span className={`font-mono font-bold text-[10px] shrink-0 ${
                    act.quantityDelta > 0 ? 'text-[#1c644d]' : 'text-[#9e3a24]'
                  }`}>
                    {act.quantityDelta > 0 ? `+${act.quantityDelta}` : act.quantityDelta}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Compact Footer */}
        <div className="px-5 py-3 border-t border-stone-100 bg-stone-50/70 flex items-center justify-between">
          <button
            onClick={() => {
              onClose();
              logout();
            }}
            className="flex items-center gap-1.5 text-rose-600 hover:text-rose-700 text-xs font-semibold cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-[#1e3a34] hover:bg-[#162c27] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import {
  X,
  ArrowDownToLine,
  Truck,
  ArrowLeftRight,
  SlidersHorizontal,
  Boxes,
  Layers,
  ClipboardCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface QuickActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenReceipt: () => void;
  onOpenDelivery: () => void;
  onOpenTransfer: () => void;
  onOpenAdjustment: () => void;
  onOpenNewProduct: () => void;
}

export const QuickActionModal: React.FC<QuickActionModalProps> = ({
  isOpen,
  onClose,
  onOpenReceipt,
  onOpenDelivery,
  onOpenTransfer,
  onOpenAdjustment,
  onOpenNewProduct
}) => {
  const { currentUser } = useAuth();
  const isManager = currentUser?.role === 'inventory_manager';

  if (!isOpen) return null;

  const managerActions = [
    {
      title: 'Inbound Goods Receipt',
      tag: 'Incoming Stock',
      description: 'Receive items from vendor, verify carrier bill of lading, and increment stock.',
      icon: ArrowDownToLine,
      color: 'text-[#1e3a34] bg-[#e5f0ec]',
      action: onOpenReceipt
    },
    {
      title: 'Outbound Delivery Order',
      tag: 'Outgoing Stock',
      description: 'Process customer sales dispatch orders, generate packing slips & decrement inventory.',
      icon: Truck,
      color: 'text-[#1e3a34] bg-[#e5f0ec]',
      action: onOpenDelivery
    },
    {
      title: 'Register New Product SKU',
      tag: 'Catalog & Rules',
      description: 'Define SKU, category, UoM, pricing, and automated min/max safety replenishment levels.',
      icon: Boxes,
      color: 'text-[#1e3a34] bg-[#e5f0ec]',
      action: onOpenNewProduct
    },
    {
      title: 'Stock Count Adjustment',
      tag: 'Reconciliation',
      description: 'Reconcile discrepancies between recorded balances and warehouse cycle counts.',
      icon: SlidersHorizontal,
      color: 'text-stone-700 bg-stone-100',
      action: onOpenAdjustment
    },
    {
      title: 'Internal Stock Transfer',
      tag: 'Relocation',
      description: 'Relocate materials between warehouse locations, bays, and storage racks.',
      icon: ArrowLeftRight,
      color: 'text-stone-700 bg-stone-100',
      action: onOpenTransfer
    }
  ];

  const staffActions = [
    {
      title: 'Internal Stock Transfer',
      tag: 'Floor Movement',
      description: 'Relocate materials between warehouse aisles, racks, and assembly bays.',
      icon: ArrowLeftRight,
      color: 'text-[#b45309] bg-amber-50',
      action: onOpenTransfer
    },
    {
      title: 'Physical Stock Count Adjustment',
      tag: 'Cycle Count Audit',
      description: 'Record physical floor counts for an aisle or rack to correct ledger balances.',
      icon: SlidersHorizontal,
      color: 'text-[#1e3a34] bg-[#e5f0ec]',
      action: onOpenAdjustment
    },
    {
      title: 'Outbound Delivery (Pick & Stage)',
      tag: 'Floor Picking',
      description: 'Pick ordered line items from storage racks and bring them to dispatch bay.',
      icon: Truck,
      color: 'text-[#1e3a34] bg-[#e5f0ec]',
      action: onOpenDelivery
    },
    {
      title: 'Inbound Receipt (Unload & Putaway)',
      tag: 'Dock Shelving',
      description: 'Inspect incoming shipment pallets and shelve items into high-bay racks.',
      icon: ArrowDownToLine,
      color: 'text-stone-700 bg-stone-100',
      action: onOpenReceipt
    }
  ];

  const actions = isManager ? managerActions : staffActions;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white border border-stone-200 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-stone-100 flex items-center justify-between bg-stone-50/70">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-stone-900">
                {isManager ? 'Manager Operations Menu' : 'Floor Tasks Menu'}
              </h2>
              <span className={`text-[10px] font-semibold font-mono px-2 py-0.5 rounded-full ${
                isManager ? 'bg-[#e5f3ed] text-[#1c644d]' : 'bg-amber-100 text-amber-800'
              }`}>
                {isManager ? 'In/Out Stock' : 'Floor & Counts'}
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              {isManager
                ? 'Manage incoming vendor shipments and outgoing customer dispatches'
                : 'Execute physical transfers, picking, shelving & cycle counts'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action List */}
        <div className="p-4 space-y-2 max-h-[75vh] overflow-y-auto">
          {actions.map((act, idx) => {
            const Icon = act.icon;
            return (
              <button
                key={idx}
                onClick={() => {
                  onClose();
                  act.action();
                }}
                className="w-full text-left p-3.5 rounded-xl bg-stone-50/70 border border-stone-200 hover:border-[#1e3a34] hover:bg-white transition-all flex items-start gap-3.5 group cursor-pointer"
              >
                <div className={`p-2.5 rounded-xl shrink-0 transition-colors ${act.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-bold text-stone-900 group-hover:text-[#1e3a34] transition-colors">
                      {act.title}
                    </div>
                    <span className="text-[10px] font-mono text-stone-400 uppercase font-semibold">
                      {act.tag}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500 mt-0.5 leading-relaxed">
                    {act.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

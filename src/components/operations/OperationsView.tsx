import React, { useState, useMemo } from 'react';
import {
    ArrowDownToLine,
    Truck,
    ArrowLeftRight,
    SlidersHorizontal,
    Plus,
    Search,
    Filter,
    CheckCircle,
    Clock,
    ExternalLink,
    RotateCcw,
    Calendar
} from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';
import { Operation, OperationStatus, OperationType } from '../../types/inventory';
import { OperationDetailModal } from './OperationDetailModal';

interface OperationsViewProps {
    initialType?: OperationType;
    onOpenReceiptModal: () => void;
    onOpenDeliveryModal: () => void;
    onOpenTransferModal: () => void;
    onOpenAdjustmentModal: () => void;
}

export const OperationsView: React.FC<OperationsViewProps> = ({
    initialType = 'receipt',
    onOpenReceiptModal,
    onOpenDeliveryModal,
    onOpenTransferModal,
    onOpenAdjustmentModal
}) => {
    const { operations, validateOperation, getLocationName } = useInventory();

    const [activeType, setActiveType] = useState<OperationType>(initialType);
    const [statusFilter, setStatusFilter] = useState<OperationStatus | 'all'>('all');
    const [search, setSearch] = useState('');
    const [selectedOperation, setSelectedOperation] = useState<Operation | null>(null);

    // Sync activeType when initialType changes
    React.useEffect(() => {
        setActiveType(initialType);
    }, [initialType]);

    const filteredOps = useMemo(() => {
        return operations.filter(op => {
            if (op.type !== activeType) return false;
            if (statusFilter !== 'all' && op.status !== statusFilter) return false;

            if (search.trim()) {
                const q = search.toLowerCase();
                const codeMatch = op.code.toLowerCase().includes(q);
                const partnerMatch = op.partnerName?.toLowerCase().includes(q) || false;
                const itemMatch = op.items.some(i => i.productName.toLowerCase().includes(q) || i.sku.toLowerCase().includes(q));
                if (!codeMatch && !partnerMatch && !itemMatch) return false;
            }

            return true;
        });
    }, [operations, activeType, statusFilter, search]);

    const handleQuickValidate = (e: React.MouseEvent, opId: string) => {
        e.stopPropagation();
        const res = validateOperation(opId);
        if (!res.success && res.error) {
            alert(res.error);
        }
    };

    const getStatusBadge = (status: OperationStatus) => {
        switch (status) {
            case 'done':
                return (
                    <span className="text-emerald-400 text-xs font-medium flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Done</span>
                    </span>
                );
            case 'ready':
                return (
                    <span className="text-amber-400 text-xs font-medium flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                        <span>Ready</span>
                    </span>
                );
            case 'waiting':
                return (
                    <span className="text-sky-400 text-xs font-medium flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-sky-400" />
                        <span>Waiting</span>
                    </span>
                );
            case 'draft':
                return <span className="text-slate-400 text-xs font-medium">Draft</span>;
            case 'canceled':
                return <span className="text-rose-400 text-xs font-medium">Canceled</span>;
        }
    };

    return (
        <div className="space-y-4 pb-12">
            {/* Top Navigation for 4 Operational Pipelines */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {/* 4 Operations Segmented Control */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 p-1 bg-slate-950 border border-slate-800 rounded-lg">
                        <button
                            onClick={() => setActiveType('receipt')}
                            className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded text-xs font-medium transition-colors cursor-pointer ${activeType === 'receipt'
                                    ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                                    : 'text-slate-400 hover:text-slate-200'
                                }`}
                        >
                            <ArrowDownToLine className="w-3.5 h-3.5" />
                            <span>1. Receipts</span>
                        </button>

                        <button
                            onClick={() => setActiveType('delivery')}
                            className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded text-xs font-medium transition-colors cursor-pointer ${activeType === 'delivery'
                                    ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                                    : 'text-slate-400 hover:text-slate-200'
                                }`}
                        >
                            <Truck className="w-3.5 h-3.5" />
                            <span>2. Deliveries</span>
                        </button>

                        <button
                            onClick={() => setActiveType('internal')}
                            className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded text-xs font-medium transition-colors cursor-pointer ${activeType === 'internal'
                                    ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                                    : 'text-slate-400 hover:text-slate-200'
                                }`}
                        >
                            <ArrowLeftRight className="w-3.5 h-3.5" />
                            <span>3. Transfers</span>
                        </button>

                        <button
                            onClick={() => setActiveType('adjustment')}
                            className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded text-xs font-medium transition-colors cursor-pointer ${activeType === 'adjustment'
                                    ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                                    : 'text-slate-400 hover:text-slate-200'
                                }`}
                        >
                            <SlidersHorizontal className="w-3.5 h-3.5" />
                            <span>4. Adjustments</span>
                        </button>
                    </div>

                    {/* New Operation Action Button */}
                    <div>
                        {activeType === 'receipt' && (
                            <button
                                onClick={onOpenReceiptModal}
                                className="w-full sm:w-auto px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                            >
                                <Plus className="w-4 h-4 stroke-[3]" />
                                <span>New Receipt</span>
                            </button>
                        )}
                        {activeType === 'delivery' && (
                            <button
                                onClick={onOpenDeliveryModal}
                                className="w-full sm:w-auto px-4 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                            >
                                <Plus className="w-4 h-4 stroke-[3]" />
                                <span>New Delivery Order</span>
                            </button>
                        )}
                        {activeType === 'internal' && (
                            <button
                                onClick={onOpenTransferModal}
                                className="w-full sm:w-auto px-4 py-2 bg-purple-500 hover:bg-purple-400 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                            >
                                <Plus className="w-4 h-4 stroke-[3]" />
                                <span>New Internal Transfer</span>
                            </button>
                        )}
                        {activeType === 'adjustment' && (
                            <button
                                onClick={onOpenAdjustmentModal}
                                className="w-full sm:w-auto px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                            >
                                <Plus className="w-4 h-4 stroke-[3]" />
                                <span>New Stock Count Adjustment</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Filter bar */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
                    {/* Search box */}
                    <div className="relative">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Search reference, partner, SKU..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                        />
                    </div>

                    {/* Status selector */}
                    <div className="grid grid-cols-5 gap-1 p-1 bg-slate-950 border border-slate-800 rounded-lg col-span-2">
                        {(['all', 'draft', 'waiting', 'ready', 'done'] as const).map(st => (
                            <button
                                key={st}
                                onClick={() => setStatusFilter(st)}
                                className={`py-1 text-[11px] font-medium rounded capitalize transition-colors cursor-pointer ${statusFilter === st
                                        ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                                        : 'text-slate-400 hover:text-slate-200'
                                    }`}
                            >
                                {st}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Operations Table */}
            <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                        <thead>
                            <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                                <th className="py-3 px-4">Document Ref</th>
                                <th className="py-3 px-4">Date</th>
                                <th className="py-3 px-4">
                                    {activeType === 'receipt'
                                        ? 'Vendor / Supplier'
                                        : activeType === 'delivery'
                                            ? 'Customer / Recipient'
                                            : 'Origin Warehouse'}
                                </th>
                                <th className="py-3 px-4">Target Location / Route</th>
                                <th className="py-3 px-4">Items / SKU</th>
                                <th className="py-3 px-4 text-center">Status</th>
                                <th className="py-3 px-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/80">
                            {filteredOps.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="py-10 text-center text-slate-400">
                                        No {activeType} operations found matching this criteria.
                                    </td>
                                </tr>
                            ) : (
                                filteredOps.map(op => (
                                    <tr
                                        key={op.id}
                                        onClick={() => setSelectedOperation(op)}
                                        className="hover:bg-slate-850/60 transition-colors cursor-pointer group"
                                    >
                                        {/* Document code */}
                                        <td className="py-3 px-4 font-mono font-bold text-white group-hover:text-amber-400 transition-colors">
                                            {op.code}
                                        </td>

                                        {/* Date */}
                                        <td className="py-3 px-4 font-mono text-slate-400">
                                            {op.date}
                                        </td>

                                        {/* Partner / Origin */}
                                        <td className="py-3 px-4 font-medium text-slate-200">
                                            {op.partnerName || getLocationName(op.sourceWarehouseId, op.sourceLocationId)}
                                        </td>

                                        {/* Target Location / Route */}
                                        <td className="py-3 px-4 text-slate-300">
                                            {op.type === 'internal' ? (
                                                <span className="font-mono text-[11px]">
                                                    {getLocationName(op.sourceWarehouseId, op.sourceLocationId)} → {getLocationName(op.destinationWarehouseId, op.destinationLocationId)}
                                                </span>
                                            ) : (
                                                <span>
                                                    {getLocationName(op.destinationWarehouseId, op.destinationLocationId) || getLocationName(op.sourceWarehouseId, op.sourceLocationId)}
                                                </span>
                                            )}
                                        </td>

                                        {/* Items */}
                                        <td className="py-3 px-4">
                                            <div className="font-medium text-slate-200 truncate max-w-xs">
                                                {op.items.map(i => `${i.productName} (${i.quantity} ${i.unit})`).join(', ')}
                                            </div>
                                            <div className="text-[11px] font-mono text-slate-400">
                                                {op.items.map(i => i.sku).join(' · ')}
                                            </div>
                                        </td>

                                        {/* Status */}
                                        <td className="py-3 px-4 text-center">
                                            {getStatusBadge(op.status)}
                                        </td>

                                        {/* Actions */}
                                        <td className="py-3 px-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {(op.status === 'ready' || op.status === 'waiting') && (
                                                    <button
                                                        onClick={(e) => handleQuickValidate(e, op.id)}
                                                        className="px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded text-xs font-semibold cursor-pointer transition-colors"
                                                    >
                                                        Validate
                                                    </button>
                                                )}

                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedOperation(op);
                                                    }}
                                                    className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
                                                    title="View order details"
                                                >
                                                    <ExternalLink className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Operation Detail Modal */}
            <OperationDetailModal
                operation={selectedOperation}
                onClose={() => setSelectedOperation(null)}
            />
        </div>
    );
};

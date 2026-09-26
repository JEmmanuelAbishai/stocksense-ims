import React from 'react';
import {
    X,
    Printer,
    CheckCircle,
    Clock,
    Building2,
    Calendar,
    User,
    FileText,
    AlertTriangle,
    ArrowRight,
    ShieldAlert
} from 'lucide-react';
import { Operation, OperationStatus } from '../../types/inventory';
import { useInventory } from '../../context/InventoryContext';

interface OperationDetailModalProps {
    operation: Operation | null;
    onClose: () => void;
}

export const OperationDetailModal: React.FC<OperationDetailModalProps> = ({
    operation,
    onClose
}) => {
    const { getLocationName, validateOperation, updateOperationStatus, cancelOperation } = useInventory();

    if (!operation) return null;

    const handleValidate = () => {
        const res = validateOperation(operation.id);
        if (!res.success && res.error) {
            alert(res.error);
        } else {
            onClose();
        }
    };

    const handleSetReady = () => {
        updateOperationStatus(operation.id, 'ready');
    };

    const handleCancel = () => {
        if (confirm(`Are you sure you want to cancel operation ${operation.code}?`)) {
            cancelOperation(operation.id);
            onClose();
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const isDone = operation.status === 'done';
    const isCanceled = operation.status === 'canceled';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
            <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-mono font-bold text-amber-400">{operation.code}</span>
                                <span className="text-slate-500">·</span>
                                <span className="text-xs text-slate-300 uppercase font-semibold">{operation.type}</span>
                                <span className="text-slate-500">·</span>
                                <span className="text-xs text-slate-400 font-mono">{operation.date}</span>
                            </div>
                            <h2 className="text-base font-bold text-white mt-0.5">
                                {operation.partnerName || `${operation.type.toUpperCase()} Manifest`}
                            </h2>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={handlePrint}
                            className="p-1.5 rounded-lg border border-slate-800 bg-slate-950 text-slate-400 hover:text-white hover:border-slate-700 transition-colors"
                            title="Print document slip"
                        >
                            <Printer className="w-4 h-4" />
                        </button>
                        <button
                            onClick={onClose}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Modal Body */}
                <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
                    {/* Status Bar */}
                    <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="text-slate-400">Status:</span>
                            <span className="capitalize font-bold text-white">{operation.status}</span>
                        </div>

                        {/* Stepper indication */}
                        <div className="flex items-center gap-2 text-[11px] font-mono">
                            <span className={operation.status === 'draft' ? 'text-amber-400 font-bold' : 'text-slate-500'}>1. Draft</span>
                            <span className="text-slate-700">→</span>
                            <span className={operation.status === 'waiting' ? 'text-amber-400 font-bold' : 'text-slate-500'}>2. Waiting</span>
                            <span className="text-slate-700">→</span>
                            <span className={operation.status === 'ready' ? 'text-amber-400 font-bold' : 'text-slate-500'}>3. Ready</span>
                            <span className="text-slate-700">→</span>
                            <span className={operation.status === 'done' ? 'text-emerald-400 font-bold' : 'text-slate-500'}>4. Validated</span>
                        </div>
                    </div>

                    {/* Locations & Metadata Info */}
                    <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs">
                        {operation.sourceWarehouseId && (
                            <div>
                                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Source (From)</span>
                                <span className="font-semibold text-slate-200">
                                    {getLocationName(operation.sourceWarehouseId, operation.sourceLocationId)}
                                </span>
                            </div>
                        )}

                        {operation.destinationWarehouseId && (
                            <div>
                                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Destination (To)</span>
                                <span className="font-semibold text-slate-200">
                                    {getLocationName(operation.destinationWarehouseId, operation.destinationLocationId)}
                                </span>
                            </div>
                        )}

                        <div>
                            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Created By</span>
                            <span className="text-slate-300">{operation.creatorName}</span>
                        </div>

                        <div>
                            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Completed Date</span>
                            <span className="text-slate-300 font-mono">
                                {operation.completedAt ? new Date(operation.completedAt).toLocaleString() : 'Pending final validation'}
                            </span>
                        </div>
                    </div>

                    {/* Line Items Table */}
                    <div className="space-y-2">
                        <h3 className="text-xs font-semibold text-white uppercase tracking-wider">
                            Document Line Items ({operation.items.length})
                        </h3>

                        <div className="rounded-lg border border-slate-800 overflow-hidden">
                            <table className="w-full text-left text-xs border-collapse">
                                <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 text-[11px]">
                                    <tr>
                                        <th className="py-2.5 px-3">Item SKU & Name</th>
                                        <th className="py-2.5 px-3 text-right">Quantity</th>
                                        <th className="py-2.5 px-3 text-right">Unit</th>
                                        {operation.type === 'receipt' && (
                                            <th className="py-2.5 px-3 text-right">Unit Price</th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/80 bg-slate-900">
                                    {operation.items.map((item, idx) => (
                                        <tr key={idx}>
                                            <td className="py-2.5 px-3">
                                                <div className="font-medium text-white">{item.productName}</div>
                                                <div className="text-[11px] font-mono text-amber-400">{item.sku}</div>
                                            </td>
                                            <td className="py-2.5 px-3 text-right font-mono font-bold text-white tabular-nums">
                                                {item.quantity}
                                            </td>
                                            <td className="py-2.5 px-3 text-right font-mono text-slate-400">
                                                {item.unit}
                                            </td>
                                            {operation.type === 'receipt' && (
                                                <td className="py-2.5 px-3 text-right font-mono text-slate-300">
                                                    ${(item.unitPrice || 0).toFixed(2)}
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Notes or Reason */}
                    {(operation.notes || operation.adjustmentReason) && (
                        <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Notes & Logged Reference</span>
                            <p className="text-slate-300 text-xs">
                                {operation.notes || operation.adjustmentReason}
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
                    <div>
                        {!isDone && !isCanceled && (
                            <button
                                onClick={handleCancel}
                                className="px-3 py-1.5 text-xs text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
                            >
                                Cancel Order
                            </button>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 rounded-lg border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                        >
                            Close
                        </button>

                        {!isDone && !isCanceled && operation.status === 'waiting' && (
                            <button
                                onClick={handleSetReady}
                                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 font-semibold transition-colors cursor-pointer"
                            >
                                Mark as Ready
                            </button>
                        )}

                        {!isDone && !isCanceled && (
                            <button
                                onClick={handleValidate}
                                className="px-5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition-colors shadow-sm cursor-pointer"
                            >
                                Validate & Update Stock
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

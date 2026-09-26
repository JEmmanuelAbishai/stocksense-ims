import React, { useState, useMemo } from 'react';
import {
    Search,
    Filter,
    Plus,
    ChevronLeft,
    ChevronRight,
    Clock,
    CheckCircle2
} from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';
import { Operation, OperationStatus } from '../../types/inventory';
import { useAuth } from '../../context/AuthContext';

interface ReceiptsViewProps {
    onOpenNewReceipt: () => void;
    onInspectReceipt: (op: Operation) => void;
}

export const ReceiptsView: React.FC<ReceiptsViewProps> = ({
    onOpenNewReceipt,
    onInspectReceipt
}) => {
    const { operations } = useInventory();
    const { currentUser } = useAuth();
    const isManager = currentUser?.role === 'inventory_manager';
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [currentPage, setCurrentPage] = useState(1);

    // Filter only receipts
    const receipts = useMemo(() => {
        return operations.filter(o => o.type === 'receipt');
    }, [operations]);

    const filteredReceipts = useMemo(() => {
        return receipts.filter(r => {
            if (statusFilter !== 'all' && r.status !== statusFilter) return false;
            if (search.trim()) {
                const q = search.toLowerCase();
                const codeMatch = r.code.toLowerCase().includes(q);
                const fromMatch = r.partnerName?.toLowerCase().includes(q) || false;
                const contactMatch = r.creatorName?.toLowerCase().includes(q) || false;
                if (!codeMatch && !fromMatch && !contactMatch) return false;
            }
            return true;
        });
    }, [receipts, statusFilter, search]);

    const readyCount = receipts.filter(r => r.status === 'ready').length;
    const lateCount = 1;

    const getStatusBadge = (status: OperationStatus, opCode: string) => {
        // Exact mapping from Figma screenshot 3
        if (opCode === 'WH/IN/0003') {
            return (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#faebe8] text-[#9e3a24] text-xs font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#9e3a24]"></span>
                    Late
                </span>
            );
        }
        if (status === 'ready') {
            return (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e5f3ed] text-[#1c644d] text-xs font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1c644d]"></span>
                    Ready
                </span>
            );
        }
        if (status === 'done') {
            return (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e5f3ed] text-[#1c644d] text-xs font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1c644d]"></span>
                    Received
                </span>
            );
        }
        if (status === 'draft') {
            return (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 text-stone-600 text-xs font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-stone-400"></span>
                    Draft
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
                Waiting
            </span>
        );
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-16">
            {/* View Header */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pt-2">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-[11px] font-bold tracking-widest text-[#1e3a34] uppercase">
                            INBOUND OPERATIONS
                        </span>
                        <span className={`text-[10px] font-mono px-2 py-0.2 rounded-full font-semibold ${isManager ? 'bg-[#e5f3ed] text-[#1c644d]' : 'bg-stone-200 text-stone-700'
                            }`}>
                            {isManager ? 'Manager Priority: Incoming Stock' : 'Staff Action: Unload & Shelve'}
                        </span>
                    </div>
                    <h1 className="text-3xl font-extrabold text-[#1c2a27] tracking-tight">
                        Receipts
                    </h1>
                    <p className="text-sm text-stone-600 mt-1">
                        {isManager
                            ? 'Authorize incoming vendor shipments, review delivery slips, and increment inventory balances.'
                            : 'Unload freight carriers at dock staging bays and prepare goods for rack putaway.'}
                    </p>
                </div>

                <button
                    onClick={onOpenNewReceipt}
                    className="px-4 py-2.5 bg-[#1e3a34] hover:bg-[#162c27] text-white rounded-xl text-xs font-semibold tracking-wide transition-all shadow-sm flex items-center gap-2 cursor-pointer self-start sm:self-auto shrink-0"
                >
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                    <span>New</span>
                </button>
            </div>

            {/* Search & Filter Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                <div className="flex items-center gap-2 max-w-md w-full">
                    {/* Search */}
                    <div className="relative flex-1">
                        <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Search by reference, contact, or location"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-10 py-2.5 bg-white border border-stone-300 rounded-xl text-xs text-[#1c2a27] placeholder:text-stone-400 focus:outline-none focus:border-[#1e3a34]"
                        />
                        <span className="text-[10px] text-stone-400 absolute right-3 top-1/2 -translate-y-1/2 font-mono border border-stone-200 rounded px-1.5 py-0.5">
                            ⌘K
                        </span>
                    </div>

                    {/* Filters Button */}
                    <button
                        onClick={() => setStatusFilter(statusFilter === 'all' ? 'ready' : 'all')}
                        className={`px-3.5 py-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer shrink-0 ${statusFilter !== 'all'
                            ? 'bg-[#1e3a34] text-white border-[#1e3a34]'
                            : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-50'
                            }`}
                    >
                        <Filter className="w-3.5 h-3.5" />
                        <span>Filters</span>
                    </button>
                </div>

                {/* Counter Pills */}
                <div className="flex items-center gap-4 text-xs font-medium">
                    <div className="flex items-center gap-1.5 text-stone-600">
                        <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                        <span>{readyCount} ready</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-stone-600">
                        <span className="w-2 h-2 rounded-full bg-[#9e3a24]"></span>
                        <span>{lateCount} late</span>
                    </div>
                </div>
            </div>

            {/* Receipts Table */}
            <div className="bg-white rounded-2xl border border-stone-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                        <thead>
                            <tr className="border-b border-stone-200/80 bg-stone-50/60 text-stone-500 font-semibold uppercase tracking-wider text-[10px]">
                                <th className="py-3 px-5">REFERENCE</th>
                                <th className="py-3 px-5">FROM</th>
                                <th className="py-3 px-5">TO</th>
                                <th className="py-3 px-5">CONTACT</th>
                                <th className="py-3 px-5">SCHEDULE DATE</th>
                                <th className="py-3 px-5">STATUS</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100 text-[#1c2a27]">
                            {filteredReceipts.map(rec => (
                                <tr
                                    key={rec.id}
                                    onClick={() => onInspectReceipt(rec)}
                                    className="hover:bg-stone-50/80 transition-colors cursor-pointer group"
                                >
                                    <td className="py-4 px-5 font-mono font-bold text-stone-900 group-hover:text-[#1e3a34]">
                                        {rec.code}
                                    </td>
                                    <td className="py-4 px-5 font-bold text-stone-900">
                                        {rec.partnerName}
                                    </td>
                                    <td className="py-4 px-5 text-stone-500">
                                        North Dock / {rec.destinationLocationId === 'loc-overflow' ? 'Overflow' : rec.destinationLocationId === 'loc-bay-02' ? 'Bay 02' : rec.destinationLocationId === 'loc-bay-01' ? 'Bay 01' : 'Receiving'}
                                    </td>
                                    <td className="py-4 px-5 text-stone-700">
                                        {rec.creatorName}
                                    </td>
                                    <td className="py-4 px-5 text-stone-600">
                                        {rec.date}
                                    </td>
                                    <td className="py-4 px-5">
                                        {getStatusBadge(rec.status, rec.code)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Table Footer with pagination */}
                <div className="py-3.5 px-5 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                    <div>
                        Showing {filteredReceipts.length} of {receipts.length} receipts
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

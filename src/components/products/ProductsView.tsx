import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Filter,
  Layers,
  Edit2,
  Trash2,
  AlertTriangle,
  ArrowDownToLine,
  FileSpreadsheet,
  CheckCircle2,
  SlidersHorizontal,
  MapPin,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Product } from '../../types/inventory';
import { useInventory } from '../../context/InventoryContext';
import { useAuth } from '../../context/AuthContext';
import { ProductFormModal } from './ProductFormModal';
import { LocationStockModal } from './LocationStockModal';

interface ProductsViewProps {
  onInitiateReorder: (productId: string) => void;
  onInitiateTransfer: (product: Product, srcWhId: string, srcLocId: string) => void;
  onInitiateAdjustment: (productId: string) => void;
}

export const ProductsView: React.FC<ProductsViewProps> = ({
  onInitiateReorder,
  onInitiateTransfer,
  onInitiateAdjustment
}) => {
  const { products, categories, deleteProduct, exportProductsCsv } = useInventory();
  const { currentUser } = useAuth();
  const isManager = currentUser?.role === 'inventory_manager';

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [stockStatusFilter, setStockStatusFilter] = useState<'all' | 'normal' | 'low' | 'out'>('all');

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [inspectingProduct, setInspectingProduct] = useState<Product | null>(null);

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;

      if (stockStatusFilter === 'out' && p.totalStock !== 0) return false;
      if (stockStatusFilter === 'low' && (p.totalStock > p.minReorderLevel || p.totalStock === 0)) return false;
      if (stockStatusFilter === 'normal' && p.totalStock <= p.minReorderLevel) return false;

      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesSku = p.sku.toLowerCase().includes(q);
        const matchesBarcode = p.barcode?.toLowerCase().includes(q) || false;
        if (!matchesName && !matchesSku && !matchesBarcode) return false;
      }

      return true;
    });
  }, [products, selectedCategory, stockStatusFilter, search]);

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setIsFormModalOpen(true);
  };

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setIsFormModalOpen(true);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to remove "${name}" from the product catalog?`)) {
      deleteProduct(id);
    }
  };

  const lowCount = products.filter(p => p.totalStock <= p.minReorderLevel && p.totalStock > 0).length;
  const outCount = products.filter(p => p.totalStock === 0).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pt-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold tracking-widest text-[#1e3a34] uppercase">
              INVENTORY CATALOG
            </span>
            <span className={`text-[10px] font-mono px-2 py-0.2 rounded-full font-semibold ${
              isManager ? 'bg-[#e5f3ed] text-[#1c644d]' : 'bg-amber-100 text-amber-800'
            }`}>
              {isManager ? 'Manager View: SKUs & Valuation' : 'Staff View: Physical Stock & Racks'}
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-[#1c2a27] tracking-tight">
            Products
          </h1>
          <p className="text-sm text-stone-600 mt-1">
            {isManager
              ? 'Maintain SKU master definitions, safety stock thresholds, unit costs, and replenishment rules.'
              : 'Inspect physical stock quantities on hand, rack allocations, and locate items across warehouse bays.'}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={exportProductsCsv}
            className="px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-xs font-semibold text-stone-700 transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <FileSpreadsheet className="w-4 h-4 text-[#1e3a34]" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleOpenCreate}
            className="px-4 py-2.5 bg-[#1e3a34] hover:bg-[#162c27] text-white rounded-xl text-xs font-semibold tracking-wide transition-all shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>New Product</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-1">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-1">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, SKU, or barcode..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 bg-white border border-stone-300 rounded-xl text-xs text-[#1c2a27] placeholder:text-stone-400 focus:outline-none focus:border-[#1e3a34]"
            />
            <span className="text-[10px] text-stone-400 absolute right-3 top-1/2 -translate-y-1/2 font-mono border border-stone-200 rounded px-1.5 py-0.5">
              ⌘K
            </span>
          </div>

          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            aria-label="Filter products by category"
            className="bg-white border border-stone-300 rounded-xl px-3.5 py-2.5 text-xs text-[#1c2a27] focus:outline-none focus:border-[#1e3a34] cursor-pointer"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.name}>{cat.name}</option>
            ))}
          </select>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 p-1 bg-stone-200/70 rounded-xl text-xs">
          {(['all', 'normal', 'low', 'out'] as const).map(st => (
            <button
              key={st}
              onClick={() => setStockStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer capitalize ${
                stockStatusFilter === st
                  ? 'bg-white text-[#1c2a27] font-semibold shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {st === 'all' ? 'All' : st === 'normal' ? 'Adequate' : st === 'low' ? `Low (${lowCount})` : `Out (${outCount})`}
            </button>
          ))}
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-stone-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-stone-200/80 bg-stone-50/60 text-stone-500 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-5">PRODUCT & SKU</th>
                <th className="py-3 px-5">CATEGORY</th>
                <th className="py-3 px-5">UNIT</th>
                <th className="py-3 px-5 text-right">ON HAND</th>
                <th className="py-3 px-5 text-right">REORDER LEVEL</th>
                <th className="py-3 px-5 text-right">UNIT PRICE</th>
                <th className="py-3 px-5 text-right">VALUATION</th>
                <th className="py-3 px-5 text-center">STATUS</th>
                <th className="py-3 px-5 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-[#1c2a27]">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-stone-400">
                    No products found matching your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredProducts.map(prod => {
                  const isLow = prod.totalStock <= prod.minReorderLevel && prod.totalStock > 0;
                  const isOut = prod.totalStock === 0;
                  const valuation = prod.totalStock * prod.costPrice;

                  return (
                    <tr
                      key={prod.id}
                      className="hover:bg-stone-50/60 transition-colors group"
                    >
                      {/* Product Name & SKU */}
                      <td className="py-4 px-5">
                        <div className="font-bold text-stone-900 text-sm">{prod.name}</div>
                        <div className="flex items-center gap-1.5 text-[11px] font-mono text-stone-400 mt-0.5">
                          <span className="text-stone-700 font-semibold">{prod.sku}</span>
                          {prod.barcode && <span>· {prod.barcode}</span>}
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-4 px-5 text-stone-600 font-medium">
                        {prod.category}
                      </td>

                      {/* Unit */}
                      <td className="py-4 px-5 text-stone-500 font-mono">
                        {prod.unit}
                      </td>

                      {/* Stock on Hand */}
                      <td className="py-4 px-5 text-right">
                        <div className={`font-mono font-bold text-sm ${
                          isOut ? 'text-[#9e3a24]' : isLow ? 'text-amber-600' : 'text-stone-900'
                        }`}>
                          {prod.totalStock.toLocaleString()}
                        </div>
                        <button
                          onClick={() => setInspectingProduct(prod)}
                          className="text-[10px] text-stone-400 hover:text-[#1e3a34] flex items-center gap-1 justify-end ml-auto mt-0.5 cursor-pointer"
                        >
                          <MapPin className="w-3 h-3" />
                          <span>{prod.locations.length} {prod.locations.length === 1 ? 'loc' : 'locs'}</span>
                        </button>
                      </td>

                      {/* Reorder Level */}
                      <td className="py-4 px-5 text-right font-mono text-stone-500">
                        <div>Min: {prod.minReorderLevel}</div>
                        <div className="text-[10px] text-stone-400">Target: {prod.maxTargetLevel}</div>
                      </td>

                      {/* Unit Cost */}
                      <td className="py-4 px-5 text-right font-mono text-stone-700">
                        ${prod.costPrice.toFixed(2)}
                      </td>

                      {/* Total Valuation */}
                      <td className="py-4 px-5 text-right font-mono font-bold text-stone-900">
                        ${valuation.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>

                      {/* Status Badge */}
                      <td className="py-4 px-5 text-center">
                        {isOut ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#faebe8] text-[#9e3a24] text-[11px] font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#9e3a24]"></span>
                            Out of Stock
                          </span>
                        ) : isLow ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#faebe8] text-[#9e3a24] text-[11px] font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#9e3a24]"></span>
                            Low Stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#e5f3ed] text-[#1c644d] text-[11px] font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#1c644d]"></span>
                            In Stock
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {(isLow || isOut) && (
                            <button
                              onClick={() => onInitiateReorder(prod.id)}
                              className="px-2.5 py-1 bg-[#1e3a34] hover:bg-[#162c27] text-white rounded-lg text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                              title="Create inbound receipt for this low stock item"
                            >
                              <ArrowDownToLine className="w-3 h-3" />
                              <span>Reorder</span>
                            </button>
                          )}

                          <button
                            onClick={() => onInitiateAdjustment(prod.id)}
                            className="p-1.5 text-stone-400 hover:text-stone-800 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                            title="Perform Stock Count Adjustment"
                          >
                            <SlidersHorizontal className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleOpenEdit(prod)}
                            className="p-1.5 text-stone-400 hover:text-stone-800 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                            title="Edit product parameters"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleDelete(prod.id, prod.name)}
                            className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete SKU"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="py-3.5 px-5 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
          <div>
            Showing {filteredProducts.length} of {products.length} catalog items
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

      {/* Product Form Modal (Create / Edit) */}
      <ProductFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        productToEdit={editingProduct}
      />

      {/* Location Stock Inspection Modal */}
      <LocationStockModal
        product={inspectingProduct}
        onClose={() => setInspectingProduct(null)}
        onTransferClick={(prod, srcWhId, srcLocId) => {
          onInitiateTransfer(prod, srcWhId, srcLocId);
        }}
      />
    </div>
  );
};

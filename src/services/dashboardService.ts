
import { Product, Operation, DashboardFilter, LowStockAlert } from '../types/inventory';

export interface DashboardKPIs {
  totalStockCount: number;
  totalStockValuation: number;
  lowStockCount: number;
  outOfStockCount: number;
  pendingReceiptsCount: number;
  pendingDeliveriesCount: number;
  scheduledTransfersCount: number;
}

export const computeDashboardKPIs = (
  products: Product[],
  operations: Operation[]
): DashboardKPIs => {
  const totalStockCount = products.reduce((acc, p) => acc + p.totalStock, 0);
  const totalStockValuation = products.reduce((acc, p) => acc + p.totalStock * p.costPrice, 0);

  const lowStockCount = products.filter(p => p.totalStock <= p.minReorderLevel).length;
  const outOfStockCount = products.filter(p => p.totalStock === 0).length;

  const pendingReceiptsCount = operations.filter(
    o => o.type === 'receipt' && (o.status === 'waiting' || o.status === 'ready' || o.status === 'draft')
  ).length;

  const pendingDeliveriesCount = operations.filter(
    o => o.type === 'delivery' && (o.status === 'waiting' || o.status === 'ready' || o.status === 'draft')
  ).length;

  const scheduledTransfersCount = operations.filter(
    o => o.type === 'internal' && (o.status === 'waiting' || o.status === 'ready' || o.status === 'draft')
  ).length;

  return {
    totalStockCount,
    totalStockValuation,
    lowStockCount,
    outOfStockCount,
    pendingReceiptsCount,
    pendingDeliveriesCount,
    scheduledTransfersCount
  };
};

export const computeLowStockAlerts = (products: Product[]): LowStockAlert[] => {
  return products
    .filter(p => p.totalStock <= p.minReorderLevel)
    .map(p => ({
      product: p,
      deficit: Math.max(0, p.minReorderLevel - p.totalStock),
      urgency: (p.totalStock === 0 ? 'critical' : 'warning') as 'critical' | 'warning'
    }))
    .sort((a, b) => (a.product.totalStock === 0 ? -1 : 1));
};

export const filterOperationsList = (
  operations: Operation[],
  products: Product[],
  filter: DashboardFilter
): Operation[] => {
  return operations.filter(op => {
    // Document type filter
    if (filter.documentType !== 'all' && op.type !== filter.documentType) {
      return false;
    }
    // Status filter
    if (filter.status !== 'all' && op.status !== filter.status) {
      return false;
    }
    // Warehouse filter
    if (filter.warehouseId !== 'all') {
      const matchesSource = op.sourceWarehouseId === filter.warehouseId;
      const matchesDest = op.destinationWarehouseId === filter.warehouseId;
      if (!matchesSource && !matchesDest) return false;
    }
    // Product Category filter
    if (filter.category !== 'all') {
      const hasMatchingProduct = op.items.some(item => {
        const prod = products.find(p => p.id === item.productId);
        return prod?.category === filter.category;
      });
      if (!hasMatchingProduct) return false;
    }
    // Search query
    if (filter.searchQuery.trim()) {
      const q = filter.searchQuery.toLowerCase();
      const codeMatch = op.code.toLowerCase().includes(q);
      const partnerMatch = op.partnerName?.toLowerCase().includes(q) || false;
      const itemMatch = op.items.some(
        i => i.productName.toLowerCase().includes(q) || i.sku.toLowerCase().includes(q)
      );
      if (!codeMatch && !partnerMatch && !itemMatch) return false;
    }
    return true;
  });
};

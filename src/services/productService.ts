

import { Product, Warehouse, LocationStock, StockLedgerEntry, User } from '../types/inventory';

export const generateProductSku = (name: string, category: string): string => {
  const prefixCat = category ? category.slice(0, 3).toUpperCase() : 'GEN';
  const cleanName = name.replace(/[^a-zA-Z0-9]/g, '').slice(0, 3).toUpperCase();
  const randomSuffix = Math.floor(10 + Math.random() * 90);
  return `${prefixCat}-${cleanName}-${randomSuffix}`;
};

export const createProductRecord = (
  productData: Omit<Product, 'id' | 'totalStock' | 'updatedAt'>,
  initialQuantity = 0,
  initialWarehouseId = 'wh-northdock',
  initialLocationId = 'loc-dock-01',
  currentUser?: User | null
): { product: Product; ledgerEntry?: StockLedgerEntry } => {
  const id = `prod-${Date.now()}`;
  const initialLocations: LocationStock[] = initialQuantity > 0
    ? [{ warehouseId: initialWarehouseId, locationId: initialLocationId, quantity: initialQuantity }]
    : (productData.locations || []);

  const calculatedTotal = initialLocations.reduce((sum, loc) => sum + loc.quantity, 0);

  const product: Product = {
    ...productData,
    id,
    totalStock: calculatedTotal,
    locations: initialLocations,
    updatedAt: new Date().toISOString()
  };

  let ledgerEntry: StockLedgerEntry | undefined;

  if (initialQuantity > 0 && currentUser) {
    ledgerEntry = {
      id: `ledg-${Date.now()}`,
      timestamp: new Date().toISOString(),
      documentRef: `INIT-${product.sku}`,
      operationType: 'receipt',
      productId: product.id,
      productName: product.name,
      sku: product.sku,
      fromLocation: 'Initial Inventory Setup',
      toLocation: `${initialWarehouseId} / ${initialLocationId}`,
      quantityDelta: initialQuantity,
      unit: product.unit,
      balanceAfter: initialQuantity,
      operatorId: currentUser.id,
      operatorName: currentUser.name,
      reason: 'Initial Product Stock Entry'
    };
  }

  return { product, ledgerEntry };
};

export const applyProductUpdate = (
  products: Product[],
  id: string,
  updates: Partial<Product>
): Product[] => {
  return products.map(p => {
    if (p.id !== id) return p;
    const updated = { ...p, ...updates, updatedAt: new Date().toISOString() };
    if (updates.locations) {
      updated.totalStock = updates.locations.reduce((sum, l) => sum + l.quantity, 0);
    }
    return updated;
  });
};

export const removeProductRecord = (products: Product[], id: string): Product[] => {
  return products.filter(p => p.id !== id);
};

export const resolveLocationLabel = (
  warehouses: Warehouse[],
  warehouseId?: string,
  locationId?: string
): string => {
  if (!warehouseId) return 'N/A';
  const wh = warehouses.find(w => w.id === warehouseId);
  if (!wh) return warehouseId;
  if (!locationId) return wh.name;
  const loc = wh.locations.find(l => l.id === locationId);
  return loc ? `${wh.code} / ${loc.name}` : wh.name;
};

export const resolveWarehouseLabel = (
  warehouses: Warehouse[],
  warehouseId?: string
): string => {
  if (!warehouseId || warehouseId === 'all') return 'All Warehouses';
  const wh = warehouses.find(w => w.id === warehouseId);
  return wh ? wh.name : warehouseId;
};

export const exportProductsToCsv = (products: Product[]) => {
  const headers = [
    'SKU',
    'Product Name',
    'Category',
    'Unit',
    'Total Stock',
    'Min Reorder',
    'Max Target',
    'Cost Price',
    'Sales Price',
    'Inventory Valuation'
  ];
  const rows = products.map(p => [
    `"${p.sku}"`,
    `"${p.name.replace(/"/g, '""')}"`,
    `"${p.category}"`,
    `"${p.unit}"`,
    p.totalStock,
    p.minReorderLevel,
    p.maxTargetLevel,
    p.costPrice.toFixed(2),
    p.salesPrice.toFixed(2),
    (p.totalStock * p.costPrice).toFixed(2)
  ]);

  const csvContent =
    'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `StockSense_Products_Catalog_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
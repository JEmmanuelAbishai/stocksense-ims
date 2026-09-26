import { Operation, Product, StockLedgerEntry, Warehouse, User } from '../types/inventory';
import { resolveLocationLabel } from './productService';

export interface ProcessTransferResult {
  success: boolean;
  error?: string;
  updatedProducts: Product[];
  ledgerEntries: StockLedgerEntry[];
}

export const processInternalTransfer = (
  op: Operation,
  products: Product[],
  warehouses: Warehouse[],
  operatorName: string,
  operatorId: string,
  nowIso: string
): ProcessTransferResult => {
  const newLedgerEntries: StockLedgerEntry[] = [];
  const updatedProducts = [...products];

  for (const item of op.items) {
    const productIndex = updatedProducts.findIndex(p => p.id === item.productId);
    if (productIndex === -1) continue;

    const currentProduct = updatedProducts[productIndex];
    const srcWh = op.sourceWarehouseId!;
    const srcLoc = op.sourceLocationId!;
    const destWh = op.destinationWarehouseId!;
    const destLoc = op.destinationLocationId!;
    const qtyToMove = item.quantity;

    const sourceLocStock = currentProduct.locations.find(
      l => l.warehouseId === srcWh && l.locationId === srcLoc
    );

    if (!sourceLocStock || sourceLocStock.quantity < qtyToMove) {
      return {
        success: false,
        error: `Insufficient stock to transfer at ${resolveLocationLabel(
          warehouses,
          srcWh,
          srcLoc
        )}. Available: ${sourceLocStock?.quantity || 0}`,
        updatedProducts: products,
        ledgerEntries: []
      };
    }

    // Deduct from source and add to destination
    let updatedLocations = currentProduct.locations.map(loc => {
      if (loc.warehouseId === srcWh && loc.locationId === srcLoc) {
        return { ...loc, quantity: loc.quantity - qtyToMove };
      }
      return loc;
    });

    const destIndex = updatedLocations.findIndex(
      l => l.warehouseId === destWh && l.locationId === destLoc
    );

    if (destIndex >= 0) {
      updatedLocations[destIndex] = {
        ...updatedLocations[destIndex],
        quantity: updatedLocations[destIndex].quantity + qtyToMove
      };
    } else {
      updatedLocations.push({
        warehouseId: destWh,
        locationId: destLoc,
        quantity: qtyToMove
      });
    }

    const newTotalStock = updatedLocations.reduce((sum, l) => sum + l.quantity, 0);

    updatedProducts[productIndex] = {
      ...currentProduct,
      locations: updatedLocations,
      totalStock: newTotalStock,
      updatedAt: nowIso
    };

    newLedgerEntries.push({
      id: `ledg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: nowIso,
      documentRef: op.code,
      operationType: 'internal',
      productId: currentProduct.id,
      productName: currentProduct.name,
      sku: currentProduct.sku,
      fromLocation: resolveLocationLabel(warehouses, srcWh, srcLoc),
      toLocation: resolveLocationLabel(warehouses, destWh, destLoc),
      quantityDelta: qtyToMove,
      unit: item.unit,
      balanceAfter: newTotalStock,
      operatorId,
      operatorName,
      reason: op.notes || 'Internal warehouse redistribution'
    });
  }

  return {
    success: true,
    updatedProducts,
    ledgerEntries: newLedgerEntries
  };
};

export interface ProcessAdjustmentResult {
  updatedProducts: Product[];
  newOperation: Operation;
  ledgerEntry: StockLedgerEntry;
}

export const executePhysicalStockAdjustment = (
  products: Product[],
  warehouses: Warehouse[],
  operationsCount: number,
  productId: string,
  warehouseId: string,
  locationId: string,
  countedQty: number,
  reason: string,
  currentUser?: User | null
): ProcessAdjustmentResult | null => {
  const product = products.find(p => p.id === productId);
  if (!product) return null;

  const existingLoc = product.locations.find(
    l => l.warehouseId === warehouseId && l.locationId === locationId
  );
  const recordedQty = existingLoc ? existingLoc.quantity : 0;
  const difference = countedQty - recordedQty;

  let updatedLocations = [...product.locations];
  const locIndex = updatedLocations.findIndex(
    l => l.warehouseId === warehouseId && l.locationId === locationId
  );

  if (locIndex >= 0) {
    updatedLocations[locIndex] = { ...updatedLocations[locIndex], quantity: countedQty };
  } else {
    updatedLocations.push({ warehouseId, locationId, quantity: countedQty });
  }

  const newTotalStock = updatedLocations.reduce((sum, l) => sum + l.quantity, 0);
  const nowIso = new Date().toISOString();

  const sequentialNumber = String(operationsCount + 1).padStart(3, '0');
  const opCode = `ADJ-2026-${sequentialNumber}`;

  const newAdjustmentOp: Operation = {
    id: `op-${Date.now()}`,
    code: opCode,
    type: 'adjustment',
    status: 'done',
    date: nowIso.split('T')[0],
    sourceWarehouseId: warehouseId,
    sourceLocationId: locationId,
    items: [
      {
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        unit: product.unit,
        quantity: difference
      }
    ],
    adjustmentReason: reason,
    createdBy: currentUser?.id || 'usr-1',
    creatorName: currentUser?.name || 'Inventory Auditor',
    notes: `Counted: ${countedQty} ${product.unit} (System was: ${recordedQty} ${product.unit}). Delta: ${
      difference > 0 ? '+' : ''
    }${difference} ${product.unit}. Reason: ${reason}`,
    completedAt: nowIso
  };

  const newLedgerEntry: StockLedgerEntry = {
    id: `ledg-${Date.now()}`,
    timestamp: nowIso,
    documentRef: opCode,
    operationType: 'adjustment',
    productId: product.id,
    productName: product.name,
    sku: product.sku,
    fromLocation: resolveLocationLabel(warehouses, warehouseId, locationId),
    toLocation:
      difference >= 0
        ? resolveLocationLabel(warehouses, warehouseId, locationId)
        : 'Audit Variance / Loss',
    quantityDelta: difference,
    unit: product.unit,
    balanceAfter: newTotalStock,
    operatorId: currentUser?.id || 'usr-1',
    operatorName: currentUser?.name || 'Inventory Auditor',
    reason
  };

  const updatedProducts = products.map(p =>
    p.id === productId
      ? { ...p, locations: updatedLocations, totalStock: newTotalStock, updatedAt: nowIso }
      : p
  );

  return {
    updatedProducts,
    newOperation: newAdjustmentOp,
    ledgerEntry: newLedgerEntry
  };
};

export const exportStockLedgerToCsv = (ledger: StockLedgerEntry[]) => {
  const headers = [
    'Timestamp',
    'Document Ref',
    'Operation',
    'SKU',
    'Product Name',
    'From Location',
    'To Location',
    'Delta',
    'Unit',
    'Balance After',
    'Operator',
    'Reason'
  ];
  const rows = ledger.map(l => [
    `"${l.timestamp}"`,
    `"${l.documentRef}"`,
    `"${l.operationType.toUpperCase()}"`,
    `"${l.sku}"`,
    `"${l.productName.replace(/"/g, '""')}"`,
    `"${l.fromLocation.replace(/"/g, '""')}"`,
    `"${l.toLocation.replace(/"/g, '""')}"`,
    l.quantityDelta,
    `"${l.unit}"`,
    l.balanceAfter,
    `"${l.operatorName.replace(/"/g, '""')}"`,
    `"${(l.reason || '').replace(/"/g, '""')}"`
  ]);

  const csvContent =
    'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute(
    'download',
    `StockSense_Ledger_Export_${new Date().toISOString().split('T')[0]}.csv`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

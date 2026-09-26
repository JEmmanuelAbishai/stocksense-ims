

import { Router, Request, Response } from 'express';
import { db } from '../db/dataStore';
import { Operation, StockLedgerEntry } from '../../src/types/inventory';

export const operationsRouter = Router();

operationsRouter.get('/', (req: Request, res: Response) => {
  const { type, status, warehouseId } = req.query;
  let results = [...db.operations];

  if (type && type !== 'all') {
    results = results.filter(o => o.type === type);
  }
  if (status && status !== 'all') {
    results = results.filter(o => o.status === status);
  }
  if (warehouseId && warehouseId !== 'all') {
    results = results.filter(
      o => o.sourceWarehouseId === warehouseId || o.destinationWarehouseId === warehouseId
    );
  }

  res.json(results);
});

operationsRouter.post('/receipts', (req: Request, res: Response) => {
  const opData = req.body;
  const sequentialNumber = String(db.operations.length + 1).padStart(3, '0');
  const code = `REC-2026-${sequentialNumber}`;

  const newOp: Operation = {
    ...opData,
    id: `op-${Date.now()}`,
    code,
    type: 'receipt',
    status: 'waiting',
    createdBy: opData.createdBy || 'usr-ops',
    creatorName: opData.creatorName || 'Operations Specialist'
  };

  db.operations.unshift(newOp);
  res.status(201).json(newOp);
});

operationsRouter.put('/receipts/:id/receive', (req: Request, res: Response): void => {
  const op = db.operations.find(o => o.id === req.params.id);
  if (!op) {
    res.status(404).json({ error: 'Receipt not found' });
    return;
  }
  if (op.status === 'done') {
    res.status(400).json({ error: 'Receipt already completed' });
    return;
  }

  const nowIso = new Date().toISOString();
  const destWh = op.destinationWarehouseId || 'wh-northdock';
  const destLoc = op.destinationLocationId || 'loc-dock-01';

  for (const item of op.items) {
    const prod = db.products.find(p => p.id === item.productId);
    if (!prod) continue;

    const qtyToAdd = item.receivedQuantity ?? item.quantity;
    const existingLoc = prod.locations.find(l => l.warehouseId === destWh && l.locationId === destLoc);

    if (existingLoc) {
      existingLoc.quantity += qtyToAdd;
    } else {
      prod.locations.push({ warehouseId: destWh, locationId: destLoc, quantity: qtyToAdd });
    }

    prod.totalStock = prod.locations.reduce((sum, l) => sum + l.quantity, 0);
    prod.updatedAt = nowIso;

    // Log double-entry ledger entry
    const ledgerEntry: StockLedgerEntry = {
      id: `ledg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: nowIso,
      documentRef: op.code,
      operationType: 'receipt',
      productId: prod.id,
      productName: prod.name,
      sku: prod.sku,
      fromLocation: op.partnerName ? `${op.partnerName} (Vendor)` : 'Inbound Vendor Dock',
      toLocation: `${destWh} / ${destLoc}`,
      quantityDelta: qtyToAdd,
      unit: item.unit,
      balanceAfter: prod.totalStock,
      operatorId: req.body.operatorId || op.createdBy,
      operatorName: req.body.operatorName || op.creatorName,
      reason: op.notes || `Received from vendor ${op.partnerName || ''}`
    };
    db.ledger.unshift(ledgerEntry);
  }

  op.status = 'done';
  op.completedAt = nowIso;

  res.json({ success: true, operation: op });
});

operationsRouter.post('/deliveries', (req: Request, res: Response) => {
  const opData = req.body;
  const sequentialNumber = String(db.operations.length + 1).padStart(3, '0');
  const code = `DEL-2026-${sequentialNumber}`;

  const newOp: Operation = {
    ...opData,
    id: `op-${Date.now()}`,
    code,
    type: 'delivery',
    status: 'waiting',
    createdBy: opData.createdBy || 'usr-ops',
    creatorName: opData.creatorName || 'Operations Specialist'
  };

  db.operations.unshift(newOp);
  res.status(201).json(newOp);
});

operationsRouter.put('/deliveries/:id/dispatch', (req: Request, res: Response): void => {
  const op = db.operations.find(o => o.id === req.params.id);
  if (!op) {
    res.status(404).json({ error: 'Delivery order not found' });
    return;
  }
  if (op.status === 'done') {
    res.status(400).json({ error: 'Delivery already dispatched' });
    return;
  }

  const nowIso = new Date().toISOString();
  const srcWh = op.sourceWarehouseId || 'wh-northdock';
  const srcLoc = op.sourceLocationId;

  // Validate stock availability
  for (const item of op.items) {
    const prod = db.products.find(p => p.id === item.productId);
    if (!prod) continue;
    const qtyToDeduct = item.pickedQuantity ?? item.quantity;
    const locItem = prod.locations.find(
      l => l.warehouseId === srcWh && (!srcLoc || l.locationId === srcLoc)
    );

    if (!locItem || locItem.quantity < qtyToDeduct) {
      res.status(400).json({
        error: `Insufficient stock for product "${prod.name}". Available: ${locItem?.quantity || 0} ${item.unit}`
      });
      return;
    }
  }

  for (const item of op.items) {
    const prod = db.products.find(p => p.id === item.productId)!;
    const qtyToDeduct = item.pickedQuantity ?? item.quantity;
    const locItem = prod.locations.find(
      l => l.warehouseId === srcWh && (!srcLoc || l.locationId === srcLoc)
    )!;

    locItem.quantity -= qtyToDeduct;
    prod.totalStock = prod.locations.reduce((sum, l) => sum + l.quantity, 0);
    prod.updatedAt = nowIso;

    const ledgerEntry: StockLedgerEntry = {
      id: `ledg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: nowIso,
      documentRef: op.code,
      operationType: 'delivery',
      productId: prod.id,
      productName: prod.name,
      sku: prod.sku,
      fromLocation: `${srcWh} / ${srcLoc || 'Main Storage'}`,
      toLocation: op.partnerName ? `${op.partnerName} (Customer)` : 'Outbound Dispatch',
      quantityDelta: -qtyToDeduct,
      unit: item.unit,
      balanceAfter: prod.totalStock,
      operatorId: req.body.operatorId || op.createdBy,
      operatorName: req.body.operatorName || op.creatorName,
      reason: op.notes || `Dispatched to customer ${op.partnerName || ''}`
    };
    db.ledger.unshift(ledgerEntry);
  }

  op.status = 'done';
  op.completedAt = nowIso;

  res.json({ success: true, operation: op });
});

operationsRouter.put('/:id/cancel', (req: Request, res: Response): void => {
  const op = db.operations.find(o => o.id === req.params.id);
  if (!op) {
    res.status(404).json({ error: 'Operation not found' });
    return;
  }
  op.status = 'canceled';
  res.json({ success: true, operation: op });
});
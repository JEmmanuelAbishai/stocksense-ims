
import { Router, Request, Response } from 'express';
import { db } from '../db/dataStore';
import { Product, Warehouse, StockLedgerEntry } from '../../src/types/inventory';

export const productsRouter = Router();

productsRouter.get('/', (_req: Request, res: Response) => {
  res.json(db.products);
});

productsRouter.get('/:id', (req: Request, res: Response): void => {
  const product = db.products.find(p => p.id === req.params.id);
  if (!product) {
    res.status(404).json({ error: 'Product not found' });
    return;
  }
  res.json(product);
});

productsRouter.post('/', (req: Request, res: Response) => {
  const { productData, initialQuantity = 0, initialWarehouseId = 'wh-northdock', initialLocationId = 'loc-dock-01' } = req.body;

  const id = `prod-${Date.now()}`;
  const initialLocations = initialQuantity > 0
    ? [{ warehouseId: initialWarehouseId, locationId: initialLocationId, quantity: initialQuantity }]
    : (productData.locations || []);

  const totalStock = initialLocations.reduce((sum: number, l: any) => sum + l.quantity, 0);

  const newProduct: Product = {
    ...productData,
    id,
    totalStock,
    locations: initialLocations,
    updatedAt: new Date().toISOString()
  };

  db.products.unshift(newProduct);

  if (initialQuantity > 0) {
    const ledgerEntry: StockLedgerEntry = {
      id: `ledg-${Date.now()}`,
      timestamp: new Date().toISOString(),
      documentRef: `INIT-${newProduct.sku}`,
      operationType: 'receipt',
      productId: newProduct.id,
      productName: newProduct.name,
      sku: newProduct.sku,
      fromLocation: 'Initial Inventory Setup',
      toLocation: `${initialWarehouseId} / ${initialLocationId}`,
      quantityDelta: initialQuantity,
      unit: newProduct.unit,
      balanceAfter: initialQuantity,
      operatorId: 'usr-admin',
      operatorName: 'System Administrator',
      reason: 'Initial Product Stock Entry'
    };
    db.ledger.unshift(ledgerEntry);
  }

  res.status(201).json(newProduct);
});

productsRouter.put('/:id', (req: Request, res: Response): void => {
  const index = db.products.findIndex(p => p.id === req.params.id);
  if (index === -1) {
    res.status(404).json({ error: 'Product not found' });
    return;
  }

  const existing = db.products[index];
  const updates = req.body;
  const updated = { ...existing, ...updates, updatedAt: new Date().toISOString() };

  if (updates.locations) {
    updated.totalStock = updates.locations.reduce((sum: number, l: any) => sum + l.quantity, 0);
  }

  db.products[index] = updated;
  res.json(updated);
});

productsRouter.delete('/:id', (req: Request, res: Response): void => {
  const index = db.products.findIndex(p => p.id === req.params.id);
  if (index === -1) {
    res.status(404).json({ error: 'Product not found' });
    return;
  }
  db.products.splice(index, 1);
  res.json({ success: true, message: 'Product deleted' });
});

productsRouter.get('/meta/warehouses', (_req: Request, res: Response) => {
  res.json(db.warehouses);
});

// POST /api/products/meta/warehouses
productsRouter.post('/meta/warehouses', (req: Request, res: Response) => {
  const newWh: Warehouse = {
    ...req.body,
    id: `wh-${Date.now()}`
  };
  db.warehouses.push(newWh);
  res.status(201).json(newWh);
});
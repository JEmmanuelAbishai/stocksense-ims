import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Product,
  Warehouse,
  Operation,
  StockLedgerEntry,
  ProductCategory,
  DashboardFilter,
  LowStockAlert,
  OperationStatus
} from '../types/inventory';
import {
  INITIAL_PRODUCTS,
  INITIAL_WAREHOUSES,
  INITIAL_OPERATIONS,
  INITIAL_LEDGER,
  INITIAL_CATEGORIES
} from '../data/initialData';
import { useAuth } from './AuthContext';

// Modular Services (Split cleanly across the 4 roles)
import {
  computeDashboardKPIs,
  computeLowStockAlerts,
  filterOperationsList
} from '../services/dashboardService'; // Member 1
import {
  generateProductSku,
  createProductRecord,
  applyProductUpdate,
  removeProductRecord,
  resolveLocationLabel,
  resolveWarehouseLabel,
  exportProductsToCsv
} from '../services/productService'; // Member 2
import {
  buildNewOperation,
  processInboundReceipt,
  processOutboundDelivery
} from '../services/operationsService'; // Member 3
import {
  processInternalTransfer,
  executePhysicalStockAdjustment,
  exportStockLedgerToCsv
} from '../services/stockService'; // Member 4

interface InventoryContextType {
  products: Product[];
  warehouses: Warehouse[];
  operations: Operation[];
  ledger: StockLedgerEntry[];
  categories: ProductCategory[];
  filter: DashboardFilter;
  setFilter: React.Dispatch<React.SetStateAction<DashboardFilter>>;
  resetFilter: () => void;
  // Product actions (Member 2)
  addProduct: (
    productData: Omit<Product, 'id' | 'totalStock' | 'updatedAt'>,
    initialQuantity?: number,
    initialWarehouseId?: string,
    initialLocationId?: string
  ) => Product;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  generateSku: (name: string, category: string) => string;
  // Operation actions (Member 3)
  createOperation: (
    operationData: Omit<Operation, 'id' | 'code' | 'status' | 'createdBy' | 'creatorName'>
  ) => Operation;
  updateOperationStatus: (id: string, newStatus: OperationStatus) => void;
  validateOperation: (id: string) => { success: boolean; error?: string };
  cancelOperation: (id: string) => void;
  // Adjustment specific (Member 4)
  performStockAdjustment: (
    productId: string,
    warehouseId: string,
    locationId: string,
    countedQty: number,
    reason: string
  ) => void;
  // Warehouse & Category actions (Member 2)
  addWarehouse: (warehouse: Omit<Warehouse, 'id'>) => void;
  updateWarehouse: (id: string, updates: Partial<Warehouse>) => void;
  addCategory: (category: Omit<ProductCategory, 'id'>) => void;
  // Computed metrics (Member 1)
  kpis: {
    totalStockCount: number;
    totalStockValuation: number;
    lowStockCount: number;
    outOfStockCount: number;
    pendingReceiptsCount: number;
    pendingDeliveriesCount: number;
    scheduledTransfersCount: number;
  };
  lowStockAlerts: LowStockAlert[];
  getFilteredOperations: () => Operation[];
  getLocationName: (warehouseId?: string, locationId?: string) => string;
  getWarehouseName: (warehouseId?: string) => string;
  exportLedgerCsv: () => void;
  exportProductsCsv: () => void;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

const PRODUCTS_KEY = 'stocksense_products_v1';
const OPERATIONS_KEY = 'stocksense_operations_v1';
const LEDGER_KEY = 'stocksense_ledger_v1';
const WAREHOUSES_KEY = 'stocksense_warehouses_v1';
const CATEGORIES_KEY = 'stocksense_categories_v1';

export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem(PRODUCTS_KEY);
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [warehouses, setWarehouses] = useState<Warehouse[]>(() => {
    const saved = localStorage.getItem(WAREHOUSES_KEY);
    return saved ? JSON.parse(saved) : INITIAL_WAREHOUSES;
  });

  const [operations, setOperations] = useState<Operation[]>(() => {
    const saved = localStorage.getItem(OPERATIONS_KEY);
    return saved ? JSON.parse(saved) : INITIAL_OPERATIONS;
  });

  const [ledger, setLedger] = useState<StockLedgerEntry[]>(() => {
    const saved = localStorage.getItem(LEDGER_KEY);
    return saved ? JSON.parse(saved) : INITIAL_LEDGER;
  });

  const [categories, setCategories] = useState<ProductCategory[]>(() => {
    const saved = localStorage.getItem(CATEGORIES_KEY);
    return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
  });

  const [filter, setFilter] = useState<DashboardFilter>({
    documentType: 'all',
    status: 'all',
    warehouseId: 'all',
    category: 'all',
    searchQuery: ''
  });

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(OPERATIONS_KEY, JSON.stringify(operations));
  }, [operations]);

  useEffect(() => {
    localStorage.setItem(LEDGER_KEY, JSON.stringify(ledger));
  }, [ledger]);

  useEffect(() => {
    localStorage.setItem(WAREHOUSES_KEY, JSON.stringify(warehouses));
  }, [warehouses]);

  useEffect(() => {
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
  }, [categories]);

  // Member 1: Filter Reset
  const resetFilter = () => {
    setFilter({
      documentType: 'all',
      status: 'all',
      warehouseId: 'all',
      category: 'all',
      searchQuery: ''
    });
  };

  // Member 2: Product & Warehouse Delegations
  const generateSku = (name: string, category: string): string => {
    return generateProductSku(name, category);
  };

  const getLocationName = (warehouseId?: string, locationId?: string): string => {
    return resolveLocationLabel(warehouses, warehouseId, locationId);
  };

  const getWarehouseName = (warehouseId?: string): string => {
    return resolveWarehouseLabel(warehouses, warehouseId);
  };

  const addProduct = (
    productData: Omit<Product, 'id' | 'totalStock' | 'updatedAt'>,
    initialQuantity = 0,
    initialWarehouseId = 'wh-northdock',
    initialLocationId = 'loc-dock-01'
  ): Product => {
    const { product, ledgerEntry } = createProductRecord(
      productData,
      initialQuantity,
      initialWarehouseId,
      initialLocationId,
      currentUser
    );

    setProducts(prev => [product, ...prev]);
    if (ledgerEntry) {
      setLedger(prev => [ledgerEntry, ...prev]);
    }
    return product;
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts(prev => applyProductUpdate(prev, id, updates));
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => removeProductRecord(prev, id));
  };

  const addWarehouse = (whData: Omit<Warehouse, 'id'>) => {
    const newWh: Warehouse = {
      ...whData,
      id: `wh-${Date.now()}`
    };
    setWarehouses(prev => [...prev, newWh]);
  };

  const updateWarehouse = (id: string, updates: Partial<Warehouse>) => {
    setWarehouses(prev => prev.map(w => (w.id === id ? { ...w, ...updates } : w)));
  };

  const addCategory = (catData: Omit<ProductCategory, 'id'>) => {
    const newCat: ProductCategory = {
      ...catData,
      id: `cat-${Date.now()}`
    };
    setCategories(prev => [...prev, newCat]);
  };

  const exportProductsCsv = () => {
    exportProductsToCsv(products);
  };

  // Member 3: Operations Delegations
  const createOperation = (
    opData: Omit<Operation, 'id' | 'code' | 'status' | 'createdBy' | 'creatorName'>
  ): Operation => {
    const newOp = buildNewOperation(opData, operations.length, currentUser);
    setOperations(prev => [newOp, ...prev]);
    return newOp;
  };

  const updateOperationStatus = (id: string, newStatus: OperationStatus) => {
    setOperations(prev => prev.map(op => (op.id === id ? { ...op, status: newStatus } : op)));
  };

  const cancelOperation = (id: string) => {
    updateOperationStatus(id, 'canceled');
  };

  // Dispatcher & Validation Engine (Delegates to Member 3 for Receipts/Deliveries & Member 4 for Transfers)
  const validateOperation = (id: string): { success: boolean; error?: string } => {
    const op = operations.find(o => o.id === id);
    if (!op) return { success: false, error: 'Operation not found' };
    if (op.status === 'done') return { success: false, error: 'Operation already completed' };
    if (op.status === 'canceled') return { success: false, error: 'Cannot validate canceled operation' };

    const operatorName = currentUser?.name || op.creatorName;
    const operatorId = currentUser?.id || op.createdBy;
    const nowIso = new Date().toISOString();

    if (op.type === 'receipt') {
      // Member 3: Inbound Receipt Processing
      const res = processInboundReceipt(op, products, warehouses, operatorName, operatorId, nowIso);
      if (!res.success) return { success: false, error: res.error };

      setProducts(res.updatedProducts);
      setLedger(prev => [...res.ledgerEntries, ...prev]);
      setOperations(prev =>
        prev.map(o => (o.id === id ? { ...o, status: 'done', completedAt: nowIso } : o))
      );
      return { success: true };
    }

    if (op.type === 'delivery') {
      // Member 3: Outbound Delivery Processing
      const res = processOutboundDelivery(op, products, warehouses, operatorName, operatorId, nowIso);
      if (!res.success) return { success: false, error: res.error };

      setProducts(res.updatedProducts);
      setLedger(prev => [...res.ledgerEntries, ...prev]);
      setOperations(prev =>
        prev.map(o => (o.id === id ? { ...o, status: 'done', completedAt: nowIso } : o))
      );
      return { success: true };
    }

    if (op.type === 'internal') {
      // Member 4: Internal Transfer Processing
      const res = processInternalTransfer(op, products, warehouses, operatorName, operatorId, nowIso);
      if (!res.success) return { success: false, error: res.error };

      setProducts(res.updatedProducts);
      setLedger(prev => [...res.ledgerEntries, ...prev]);
      setOperations(prev =>
        prev.map(o => (o.id === id ? { ...o, status: 'done', completedAt: nowIso } : o))
      );
      return { success: true };
    }

    return { success: true };
  };

  // Member 4: Adjustments & Ledger Delegations
  const performStockAdjustment = (
    productId: string,
    warehouseId: string,
    locationId: string,
    countedQty: number,
    reason: string
  ) => {
    const res = executePhysicalStockAdjustment(
      products,
      warehouses,
      operations.length,
      productId,
      warehouseId,
      locationId,
      countedQty,
      reason,
      currentUser
    );

    if (!res) return;

    setProducts(res.updatedProducts);
    setOperations(prev => [res.newOperation, ...prev]);
    setLedger(prev => [res.ledgerEntry, ...prev]);
  };

  const exportLedgerCsv = () => {
    exportStockLedgerToCsv(ledger);
  };

  // Member 1: Computed KPIs & Dynamic Filter Delegation
  const kpis = computeDashboardKPIs(products, operations);
  const lowStockAlerts = computeLowStockAlerts(products);
  const getFilteredOperations = (): Operation[] => {
    return filterOperationsList(operations, products, filter);
  };

  return (
    <InventoryContext.Provider
      value={{
        products,
        warehouses,
        operations,
        ledger,
        categories,
        filter,
        setFilter,
        resetFilter,
        addProduct,
        updateProduct,
        deleteProduct,
        generateSku,
        createOperation,
        updateOperationStatus,
        validateOperation,
        cancelOperation,
        performStockAdjustment,
        addWarehouse,
        updateWarehouse,
        addCategory,
        kpis,
        lowStockAlerts,
        getFilteredOperations,
        getLocationName,
        getWarehouseName,
        exportLedgerCsv,
        exportProductsCsv
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
};

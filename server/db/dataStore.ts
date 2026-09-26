import {
  Product,
  Warehouse,
  Operation,
  StockLedgerEntry,
  ProductCategory
} from '../../src/types/inventory';
import {
  INITIAL_PRODUCTS,
  INITIAL_WAREHOUSES,
  INITIAL_OPERATIONS,
  INITIAL_LEDGER,
  INITIAL_CATEGORIES
} from '../../src/data/initialData';

class DataStore {
  public products: Product[] = [...INITIAL_PRODUCTS];
  public warehouses: Warehouse[] = [...INITIAL_WAREHOUSES];
  public operations: Operation[] = [...INITIAL_OPERATIONS];
  public ledger: StockLedgerEntry[] = [...INITIAL_LEDGER];
  public categories: ProductCategory[] = [...INITIAL_CATEGORIES];

  public resetToDefault() {
    this.products = [...INITIAL_PRODUCTS];
    this.warehouses = [...INITIAL_WAREHOUSES];
    this.operations = [...INITIAL_OPERATIONS];
    this.ledger = [...INITIAL_LEDGER];
    this.categories = [...INITIAL_CATEGORIES];
  }
}

export const db = new DataStore();
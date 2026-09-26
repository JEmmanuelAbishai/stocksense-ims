import { Operation, OperationStatus, Product, StockLedgerEntry, User } from '../types/inventory';
import { resolveLocationLabel } from './productService';
import { Warehouse } from '../types/inventory';

export const buildNewOperation = (
    opData: Omit<Operation, 'id' | 'code' | 'status' | 'createdBy' | 'creatorName'>,
    existingOperationsCount: number,
    currentUser?: User | null
): Operation => {
    const id = `op-${Date.now()}`;
    const typePrefix = {
        receipt: 'REC',
        delivery: 'DEL',
        internal: 'TRF',
        adjustment: 'ADJ'
    }[opData.type];

    const sequentialNumber = String(existingOperationsCount + 1).padStart(3, '0');
    const code = `${typePrefix}-2026-${sequentialNumber}`;

    return {
        ...opData,
        id,
        code,
        status: 'waiting',
        createdBy: currentUser?.id || 'system',
        creatorName: currentUser?.name || 'Authorized Operator'
    };
};

export interface ProcessReceiptResult {
    success: boolean;
    error?: string;
    updatedProducts: Product[];
    ledgerEntries: StockLedgerEntry[];
}

export const processInboundReceipt = (
    op: Operation,
    products: Product[],
    warehouses: Warehouse[],
    operatorName: string,
    operatorId: string,
    nowIso: string
): ProcessReceiptResult => {
    const newLedgerEntries: StockLedgerEntry[] = [];
    const updatedProducts = [...products];

    for (const item of op.items) {
        const productIndex = updatedProducts.findIndex(p => p.id === item.productId);
        if (productIndex === -1) continue;

        const currentProduct = updatedProducts[productIndex];
        const destWh = op.destinationWarehouseId || 'wh-northdock';
        const destLoc = op.destinationLocationId || 'loc-dock-01';
        const qtyToAdd = item.receivedQuantity ?? item.quantity;

        const existingLocIndex = currentProduct.locations.findIndex(
            l => l.warehouseId === destWh && l.locationId === destLoc
        );

        let updatedLocations = [...currentProduct.locations];
        if (existingLocIndex >= 0) {
            updatedLocations[existingLocIndex] = {
                ...updatedLocations[existingLocIndex],
                quantity: updatedLocations[existingLocIndex].quantity + qtyToAdd
            };
        } else {
            updatedLocations.push({
                warehouseId: destWh,
                locationId: destLoc,
                quantity: qtyToAdd
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
            operationType: 'receipt',
            productId: currentProduct.id,
            productName: currentProduct.name,
            sku: currentProduct.sku,
            fromLocation: op.partnerName ? `${op.partnerName} (Vendor)` : 'Inbound Shipment',
            toLocation: resolveLocationLabel(warehouses, destWh, destLoc),
            quantityDelta: qtyToAdd,
            unit: item.unit,
            balanceAfter: newTotalStock,
            operatorId,
            operatorName,
            reason: op.notes || `Received from vendor ${op.partnerName || ''}`
        });
    }

    return {
        success: true,
        updatedProducts,
        ledgerEntries: newLedgerEntries
    };
};

export interface ProcessDeliveryResult {
    success: boolean;
    error?: string;
    updatedProducts: Product[];
    ledgerEntries: StockLedgerEntry[];
}

export const processOutboundDelivery = (
    op: Operation,
    products: Product[],
    warehouses: Warehouse[],
    operatorName: string,
    operatorId: string,
    nowIso: string
): ProcessDeliveryResult => {
    const newLedgerEntries: StockLedgerEntry[] = [];
    const updatedProducts = [...products];

    for (const item of op.items) {
        const productIndex = updatedProducts.findIndex(p => p.id === item.productId);
        if (productIndex === -1) continue;

        const currentProduct = updatedProducts[productIndex];
        const srcWh = op.sourceWarehouseId || 'wh-northdock';
        const srcLoc = op.sourceLocationId || currentProduct.locations[0]?.locationId;
        const qtyToDeduct = item.pickedQuantity ?? item.quantity;

        const locItem = currentProduct.locations.find(
            l => l.warehouseId === srcWh && (!srcLoc || l.locationId === srcLoc)
        );

        if (!locItem || locItem.quantity < qtyToDeduct) {
            return {
                success: false,
                error: `Insufficient stock for "${currentProduct.name}" at location ${resolveLocationLabel(
                    warehouses,
                    srcWh,
                    srcLoc
                )}. Available: ${locItem?.quantity || 0} ${item.unit}.`,
                updatedProducts: products,
                ledgerEntries: []
            };
        }

        const updatedLocations = currentProduct.locations.map(loc => {
            if (loc.warehouseId === srcWh && (!srcLoc || loc.locationId === srcLoc)) {
                return { ...loc, quantity: loc.quantity - qtyToDeduct };
            }
            return loc;
        });

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
            operationType: 'delivery',
            productId: currentProduct.id,
            productName: currentProduct.name,
            sku: currentProduct.sku,
            fromLocation: resolveLocationLabel(warehouses, srcWh, srcLoc),
            toLocation: op.partnerName ? `${op.partnerName} (Customer)` : 'Outbound Dispatch',
            quantityDelta: -qtyToDeduct,
            unit: item.unit,
            balanceAfter: newTotalStock,
            operatorId,
            operatorName,
            reason: op.notes || `Dispatched to customer ${op.partnerName || ''}`
        });
    }

    return {
        success: true,
        updatedProducts,
        ledgerEntries: newLedgerEntries
    };
};

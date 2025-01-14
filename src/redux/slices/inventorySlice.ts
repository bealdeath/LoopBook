// File: src/redux/slices/inventorySlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  reorderLevel?: number;
}

interface PurchaseOrder {
  id: string;
  items: { inventoryId: string; quantity: number }[];
  status: string;
}

interface InventoryState {
  items: InventoryItem[];
  purchaseOrders: PurchaseOrder[];
}

const initialState: InventoryState = {
  items: [],
  purchaseOrders: [],
};

export const inventorySlice = createSlice({
  name: "inventory",
  initialState,
  reducers: {
    addInventoryItem: (state, action: PayloadAction<InventoryItem>) => {
      state.items.push(action.payload);
    },
    updateInventoryItem: (
      state,
      action: PayloadAction<{ id: string; changes: Partial<InventoryItem> }>
    ) => {
      const index = state.items.findIndex((i) => i.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = {
          ...state.items[index],
          ...action.payload.changes,
        };
      }
    },
    removeInventoryItem: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((i) => i.id !== action.payload);
    },

    // Purchase Orders
    createPurchaseOrder: (state, action: PayloadAction<PurchaseOrder>) => {
      state.purchaseOrders.push(action.payload);
    },
    updatePurchaseOrder: (
      state,
      action: PayloadAction<{ id: string; changes: Partial<PurchaseOrder> }>
    ) => {
      const index = state.purchaseOrders.findIndex((po) => po.id === action.payload.id);
      if (index !== -1) {
        state.purchaseOrders[index] = {
          ...state.purchaseOrders[index],
          ...action.payload.changes,
        };
      }
    },
    removePurchaseOrder: (state, action: PayloadAction<string>) => {
      state.purchaseOrders = state.purchaseOrders.filter((po) => po.id !== action.payload);
    },
  },
});

export const {
  addInventoryItem,
  updateInventoryItem,
  removeInventoryItem,
  createPurchaseOrder,
  updatePurchaseOrder,
  removePurchaseOrder,
} = inventorySlice.actions;

export default inventorySlice.reducer;

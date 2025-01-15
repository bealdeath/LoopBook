// File: src/utils/lineItemAIService.ts
import { LineItem } from "../redux/slices/receiptSlice";

// Suppose we have a server or Google Document AI:
export async function lineItemAIService(images: string[]): Promise<LineItem[]> {
  // 1) Possibly upload images to server or call Google Doc AI
  // 2) Return line items
  // For demonstration, return a mock array
  return [
    {
      id: "item-1",
      description: "Mock Line Item 1",
      quantity: 2,
      price: 5.99,
      tax: 0.5,
    },
    {
      id: "item-2",
      description: "Mock Line Item 2",
      quantity: 1,
      price: 10.0,
      tax: 1.0,
    },
  ];
}

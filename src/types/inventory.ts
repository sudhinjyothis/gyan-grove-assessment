export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  price: number;
  description: string;
  lastUpdated: string;
  partNumber : string;
}

export type SortDirection = 'asc' | 'desc';
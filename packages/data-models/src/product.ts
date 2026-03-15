export interface Product {
  id: string;
  businessId: string;
  name: string;
  category: string;
  costPrice: number;
  sellingPrice: number;
  estimatedMonthlyUnits: number;
  supplier?: string;
  createdAt: Date;
}


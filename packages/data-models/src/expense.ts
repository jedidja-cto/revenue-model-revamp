export interface Expense {
  id: string;
  businessId: string;
  name: string;
  category: string;
  amountMonthly: number;
  fixed: boolean;
  createdAt: Date;
}


export interface BankingTransaction {
  id?: string;
  shipId: string;
  transactionType: 'BANK' | 'BORROW';
  year: number;
  amount: number;
  amountTonnes: number;
  sourceYear?: number;
  remainingBalance: number;
  remainingBalanceTonnes: number;
  transactionDate: string;
  description?: string;
}

export interface BankingHistory {
  shipId: string;
  currentBalance: number;
  currentBalanceTonnes: number;
  totalTransactions: number;
  transactions: BankingTransaction[];
}
import { IBankingRepository } from '../../../ports/outbound/IBankingRepository';

/**
 * Get Banking History Use Case
 * 
 * Business Logic:
 * 1. Get all banking transactions for a ship
 * 2. Calculate current balance
 * 3. Format and return history
 */

/**
 * Input DTO
 */
export interface GetBankingHistoryInput {
  shipId: string;
  year?: number;  // Optional: filter by year
}

/**
 * Transaction DTO
 */
export interface BankingTransactionDTO {
  id?: string;
  transactionType: string;
  year: number;
  amount: number;
  amountTonnes: number;
  sourceYear?: number;
  remainingBalance: number;
  remainingBalanceTonnes: number;
  transactionDate: Date;
  description?: string;
}

/**
 * Output DTO
 */
export interface GetBankingHistoryOutput {
  success: boolean;
  shipId: string;
  currentBalance: number;           // gCO₂e
  currentBalanceTonnes: number;     // tonnes
  totalTransactions: number;
  transactions: BankingTransactionDTO[];
}

export class GetBankingHistoryUseCase {
  
  constructor(private bankingRepository: IBankingRepository) {}

  /**
   * Execute the use case
   */
  async execute(input: GetBankingHistoryInput): Promise<GetBankingHistoryOutput> {
    console.log(`📊 [UseCase] GetBankingHistory.execute() called`);
    console.log(`   Ship: ${input.shipId}${input.year ? `, Year: ${input.year}` : ''}`);

    // Validate
    if (!input.shipId || input.shipId.trim() === '') {
      throw new Error('Ship ID is required');
    }

    // Step 1: Get transactions
    let records;
    
    if (input.year) {
      console.log(`🔍 [UseCase] Getting transactions for year ${input.year}...`);
      records = await this.bankingRepository.findByShipIdAndYear(input.shipId, input.year);
    } else {
      console.log(`🔍 [UseCase] Getting all transactions...`);
      records = await this.bankingRepository.findByShipId(input.shipId);
    }

    console.log(`✅ [UseCase] Found ${records.length} transactions`);

    // Step 2: Get current balance
    const currentBalance = await this.bankingRepository.getCurrentBalance(input.shipId);
    const currentBalanceTonnes = currentBalance / 1000000;

    console.log(`💰 [UseCase] Current balance: ${currentBalanceTonnes.toFixed(2)} tonnes`);

    // Step 3: Format transactions
    const transactions: BankingTransactionDTO[] = records.map(record => ({
      id: record.getId(),
      transactionType: record.getTransactionType(),
      year: record.getYear(),
      amount: record.getAmount(),
      amountTonnes: record.getAmountInTonnes(),
      sourceYear: record.getSourceYear(),
      remainingBalance: record.getRemainingBalance(),
      remainingBalanceTonnes: record.getRemainingBalanceInTonnes(),
      transactionDate: record.getTransactionDate(),
      description: record.getDescription(),
    }));

    return {
      success: true,
      shipId: input.shipId,
      currentBalance: currentBalance,
      currentBalanceTonnes: parseFloat(currentBalanceTonnes.toFixed(2)),
      totalTransactions: transactions.length,
      transactions: transactions,
    };
  }
}
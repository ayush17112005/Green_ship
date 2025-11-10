import { BankingRecord } from '../../../domain/entities/BankingRecord.entity';
import { IBankingRepository } from '../../../ports/outbound/IBankingRepository';

/**
 * Bank Surplus Use Case
 * 
 * Business Logic:
 * 1. Validate ship has surplus to bank
 * 2. Get current banked balance
 * 3. Create BANK transaction
 * 4. Save to repository
 * 5. Return updated balance
 * 
 * Use Case: When a ship has surplus compliance balance,
 * they can bank it for future use.
 */

/**
 * Input DTO
 */
export interface BankSurplusInput {
  shipId: string;
  year: number;
  amount: number;          // Amount to bank (in gCO₂e)
  description?: string;    // Optional description
}

/**
 * Output DTO
 */
export interface BankSurplusOutput {
  success: boolean;
  message: string;
  transaction: {
    id?: string;
    shipId: string;
    transactionType: string;
    year: number;
    amount: number;            // gCO₂e
    amountTonnes: number;      // tonnes CO₂e
    previousBalance: number;   // gCO₂e
    newBalance: number;        // gCO₂e
    previousBalanceTonnes: number; // tonnes
    newBalanceTonnes: number;      // tonnes
    transactionDate: Date;
    description?: string;
  };
}

export class BankSurplusUseCase {
  
  constructor(private bankingRepository: IBankingRepository) {}

  /**
   * Execute the use case
   */
  async execute(input: BankSurplusInput): Promise<BankSurplusOutput> {
    console.log(`🏦 [UseCase] BankSurplus.execute() called`);
    console.log(`   Ship: ${input.shipId}, Year: ${input.year}, Amount: ${input.amount} gCO₂e`);

    // Validate input
    this.validateInput(input);

    // Step 1: Get current banked balance
    console.log(`💰 [UseCase] Getting current balance...`);
    const currentBalance = await this.bankingRepository.getCurrentBalance(input.shipId);
    console.log(`   Current balance: ${currentBalance} gCO₂e (${(currentBalance / 1000000).toFixed(2)} tonnes)`);

    // Step 2: Create banking transaction
    console.log(`📝 [UseCase] Creating BANK transaction...`);
    const bankingRecord = BankingRecord.createBankTransaction(
      input.shipId,
      input.year,
      input.amount,
      currentBalance,
      input.description
    );

    console.log(`   New balance will be: ${bankingRecord.getRemainingBalance()} gCO₂e`);

    // Step 3: Save to repository
    console.log(`💾 [UseCase] Saving transaction to database...`);
    const savedRecord = await this.bankingRepository.save(bankingRecord);
    console.log(`✅ [UseCase] Transaction saved successfully!`);

    // Step 4: Format output
    const newBalance = savedRecord.getRemainingBalance();
    const amountTonnes = input.amount / 1000000;
    const previousBalanceTonnes = currentBalance / 1000000;
    const newBalanceTonnes = newBalance / 1000000;

    const message = `Successfully banked ${amountTonnes.toFixed(2)} tonnes CO₂e. ` +
                   `New balance: ${newBalanceTonnes.toFixed(2)} tonnes CO₂e.`;

    console.log(`🎉 [UseCase] ${message}`);

    return {
      success: true,
      message: message,
      transaction: {
        id: savedRecord.getId(),
        shipId: savedRecord.getShipId(),
        transactionType: savedRecord.getTransactionType(),
        year: savedRecord.getYear(),
        amount: savedRecord.getAmount(),
        amountTonnes: amountTonnes,
        previousBalance: currentBalance,
        newBalance: newBalance,
        previousBalanceTonnes: previousBalanceTonnes,
        newBalanceTonnes: newBalanceTonnes,
        transactionDate: savedRecord.getTransactionDate(),
        description: savedRecord.getDescription(),
      },
    };
  }

  /**
   * Validate input
   */
  private validateInput(input: BankSurplusInput): void {
    if (!input.shipId || input.shipId.trim() === '') {
      throw new Error('Ship ID is required');
    }

    if (!input.year || input.year < 2025 || input.year > 2030) {
      throw new Error('Year must be between 2025 and 2030');
    }

    if (!input.amount || input.amount <= 0) {
      throw new Error('Amount must be positive');
    }
  }
}
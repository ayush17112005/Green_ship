import { BankingRecord } from '../../../domain/entities/BankingRecord.entity';
import { IBankingRepository } from '../../../ports/outbound/IBankingRepository';

/**
 * Apply Banking Use Case
 * 
 * Business Logic:
 * 1. Check if ship has enough banked balance
 * 2. Create BORROW transaction
 * 3. Deduct from banked balance
 * 4. Save to repository
 * 5. Return updated balance
 * 
 * Use Case: When a ship has deficit, they can use
 * previously banked credits to offset it.
 */

/**
 * Input DTO
 */
export interface ApplyBankingInput {
  shipId: string;
  year: number;
  amount: number;          // Amount to borrow (in gCO₂e)
  sourceYear: number;      // Year where surplus was banked
  description?: string;
}

/**
 * Output DTO
 */
export interface ApplyBankingOutput {
  success: boolean;
  message: string;
  transaction: {
    id?: string;
    shipId: string;
    transactionType: string;
    year: number;
    amount: number;
    amountTonnes: number;
    sourceYear: number;
    previousBalance: number;
    newBalance: number;
    previousBalanceTonnes: number;
    newBalanceTonnes: number;
    transactionDate: Date;
    description?: string;
  };
}

export class ApplyBankingUseCase {
  
  constructor(private bankingRepository: IBankingRepository) {}

  /**
   * Execute the use case
   */
  async execute(input: ApplyBankingInput): Promise<ApplyBankingOutput> {
    console.log(`🏦 [UseCase] ApplyBanking.execute() called`);
    console.log(`   Ship: ${input.shipId}, Year: ${input.year}, Amount: ${input.amount} gCO₂e`);

    // Validate input
    this.validateInput(input);

    // Step 1: Get current banked balance
    console.log(`💰 [UseCase] Checking available balance...`);
    const currentBalance = await this.bankingRepository.getCurrentBalance(input.shipId);
    console.log(`   Available balance: ${currentBalance} gCO₂e (${(currentBalance / 1000000).toFixed(2)} tonnes)`);

    // Step 2: Check if enough balance
    if (currentBalance < input.amount) {
      const availableTonnes = (currentBalance / 1000000).toFixed(2);
      const requestedTonnes = (input.amount / 1000000).toFixed(2);
      
      throw new Error(
        `Insufficient banked balance. ` +
        `Available: ${availableTonnes} tonnes CO₂e, ` +
        `Requested: ${requestedTonnes} tonnes CO₂e`
      );
    }

    // Step 3: Create borrow transaction
    console.log(`📝 [UseCase] Creating BORROW transaction...`);
    const bankingRecord = BankingRecord.createBorrowTransaction(
      input.shipId,
      input.year,
      input.amount,
      input.sourceYear,
      currentBalance,
      input.description
    );

    console.log(`   New balance will be: ${bankingRecord.getRemainingBalance()} gCO₂e`);

    // Step 4: Save to repository
    console.log(`💾 [UseCase] Saving transaction to database...`);
    const savedRecord = await this.bankingRepository.save(bankingRecord);
    console.log(`✅ [UseCase] Transaction saved successfully!`);

    // Step 5: Format output
    const newBalance = savedRecord.getRemainingBalance();
    const amountTonnes = input.amount / 1000000;
    const previousBalanceTonnes = currentBalance / 1000000;
    const newBalanceTonnes = newBalance / 1000000;

    const message = `Successfully applied ${amountTonnes.toFixed(2)} tonnes CO₂e from banked credits. ` +
                   `Remaining balance: ${newBalanceTonnes.toFixed(2)} tonnes CO₂e.`;

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
        sourceYear: savedRecord.getSourceYear()!,
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
  private validateInput(input: ApplyBankingInput): void {
    if (!input.shipId || input.shipId.trim() === '') {
      throw new Error('Ship ID is required');
    }

    if (!input.year || input.year < 2025 || input.year > 2030) {
      throw new Error('Year must be between 2025 and 2030');
    }

    if (!input.amount || input.amount <= 0) {
      throw new Error('Amount must be positive');
    }

    if (!input.sourceYear || input.sourceYear < 2025 || input.sourceYear > 2030) {
      throw new Error('Source year must be between 2025 and 2030');
    }

    if (input.sourceYear >= input.year) {
      throw new Error('Source year must be before the year of use');
    }
  }
}
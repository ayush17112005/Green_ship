/**
 * Banking Record Entity
 * 
 * Represents a banking transaction (saving surplus or using banked credits).
 * 
 * Business Rules:
 * - Can only bank surplus (positive CB)
 * - Can only borrow from available banked balance
 * - Banked credits expire after certain years (per regulation)
 * - Each transaction is tracked with timestamp
 * - Banking affects the adjusted CB
 */

/**
 * Banking Transaction Types
 */

export enum BankingTransactionType {
    BANK = 'BANK', //saving surplus for future use
    BORROW = 'BORROW', //using previously banked credits
}

//Blue print of the object structure
export interface IBankingRecordProps{
    id?: string;
    shipId: string;
    transactionType: BankingTransactionType; //BANK or BORROW
    year: number;
    amount: number;
    sourceYear?: number;
    remainingBalance: number;
    transactionDate?: Date;
    description?: string;
}

/**
 * Banking Record Entity
 */

export class BankingRecord {

    //Private Properties
    private readonly id?: string;
    private readonly shipId: string;
    private readonly transactionType: BankingTransactionType;
    private readonly year: number;
    private readonly amount: number;
    private readonly sourceYear?: number
    private remainingBalance: number;
    private readonly transactionDate: Date;
    private readonly description?: string;

    /**
   * Constructor
   */
    constructor(props: IBankingRecordProps) {
        //Validate
        this.validate(props);

        //set properties
        this.id = props.id;
        this.id = props.id;
        this.shipId = props.shipId;
        this.transactionType = props.transactionType;
        this.year = props.year;
        this.amount = props.amount;
        this.sourceYear = props.sourceYear;
        this.remainingBalance = props.remainingBalance;
        this.transactionDate = props.transactionDate || new Date();
        this.description = props.description;
    }

    /**
   * Validation
   */
    private validate(props: IBankingRecordProps): void {
        if(!props.shipId || props.shipId.trim() === ''){
            throw new Error('Ship ID is required');
        }
        if(props.year < 2025 || props.year > 2030){
            throw new Error('Year must be between 2025 and 2030');
        }
        if(props.amount <= 0){
            throw new Error('Amount must be positive');
        }
        if(props.remainingBalance < 0){
            throw new Error('Remaining balance cannot be negative');
        } 
        //If borrow must have source year
        if (props.transactionType === BankingTransactionType.BORROW && !props.sourceYear) {
        throw new Error('Source year is required for BORROW transactions');
        }
    }
    /**
   * STATIC FACTORY: Create Bank Transaction
   * 
   * @param shipId - Ship identifier
   * @param year - Year of banking
   * @param amount - Amount to bank (gCO₂e)
   * @param currentBalance - Current banked balance before this transaction
   * @param description - Optional description
   */
    static createBankTransaction(
    shipId: string,
    year: number,
    amount: number,
    currentBalance: number,
    description?: string
  ): BankingRecord {
    
    return new BankingRecord({
      shipId,
      transactionType: BankingTransactionType.BANK,
      year,
      amount,
      remainingBalance: currentBalance + amount, // Add to balance
      description: description || `Banked ${(amount / 1000000).toFixed(2)} tonnes CO₂e from ${year}`,
    });
  }

  /**
   * STATIC FACTORY: Create Borrow Transaction
   * 
   * @param shipId - Ship identifier
   * @param year - Year of borrowing
   * @param amount - Amount to borrow (gCO₂e)
   * @param sourceYear - Year where surplus was banked
   * @param currentBalance - Current banked balance before this transaction
   * @param description - Optional description
   */
  static createBorrowTransaction(
    shipId: string,
    year: number,
    amount: number,
    sourceYear: number,
    currentBalance: number,
    description?: string
  ): BankingRecord {
    
    if (amount > currentBalance) {
      throw new Error(`Cannot borrow ${amount} gCO₂e. Available balance: ${currentBalance} gCO₂e`);
    }

    return new BankingRecord({
      shipId,
      transactionType: BankingTransactionType.BORROW,
      year,
      amount,
      sourceYear,
      remainingBalance: currentBalance - amount, // Subtract from balance
      description: description || `Borrowed ${(amount / 1000000).toFixed(2)} tonnes CO₂e for ${year}`,
    });
  }

  /**
   * BUSINESS LOGIC: Is Bank Transaction?
   */
  isBankTransaction(): boolean {
    return this.transactionType === BankingTransactionType.BANK;
  }

  /**
   * BUSINESS LOGIC: Is Borrow Transaction?
   */
  isBorrowTransaction(): boolean {
    return this.transactionType === BankingTransactionType.BORROW;
  }

  /**
   * BUSINESS LOGIC: Get Amount in Tonnes
   */
  getAmountInTonnes(): number {
    return this.amount / 1000000;
  }

  /**
   * BUSINESS LOGIC: Get Remaining Balance in Tonnes
   */
  getRemainingBalanceInTonnes(): number {
    return this.remainingBalance / 1000000;
  }

  // ========================================
  // GETTERS
  // ========================================

  getId(): string | undefined {
    return this.id;
  }

  getShipId(): string {
    return this.shipId;
  }

  getTransactionType(): BankingTransactionType {
    return this.transactionType;
  }

  getYear(): number {
    return this.year;
  }

  getAmount(): number {
    return this.amount;
  }

  getSourceYear(): number | undefined {
    return this.sourceYear;
  }

  getRemainingBalance(): number {
    return this.remainingBalance;
  }

  getTransactionDate(): Date {
    return this.transactionDate;
  }

  getDescription(): string | undefined {
    return this.description;
  }

  /**
   * Convert to plain object
   */
  toObject(): IBankingRecordProps {
    return {
      id: this.id,
      shipId: this.shipId,
      transactionType: this.transactionType,
      year: this.year,
      amount: this.amount,
      sourceYear: this.sourceYear,
      remainingBalance: this.remainingBalance,
      transactionDate: this.transactionDate,
      description: this.description,
    };
  }
}

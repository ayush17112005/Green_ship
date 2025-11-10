import { BankingRecord } from '../../domain/entities/BankingRecord.entity';

/**
 * Banking Repository Interface (Port)
 * 
 * Contract for banking record persistence operations.
 */

export interface IBankingRepository {
  
  /**
   * Save a banking transaction
   * 
   * @param record - BankingRecord entity
   * @returns Promise with saved BankingRecord
   */
  save(record: BankingRecord): Promise<BankingRecord>;

  /**
   * Get all banking records for a ship
   * 
   * @param shipId - Ship identifier
   * @returns Promise with array of BankingRecords
   */
  findByShipId(shipId: string): Promise<BankingRecord[]>;

  /**
   * Get banking records for a ship in a specific year
   * 
   * @param shipId - Ship identifier
   * @param year - Year
   * @returns Promise with array of BankingRecords
   */
  findByShipIdAndYear(shipId: string, year: number): Promise<BankingRecord[]>;

  /**
   * Get current banked balance for a ship
   * 
   * @param shipId - Ship identifier
   * @returns Promise with balance (in gCO₂e)
   */
  getCurrentBalance(shipId: string): Promise<number>;

  /**
   * Get all transactions (for admin/audit)
   * 
   * @returns Promise with all BankingRecords
   */
  findAll(): Promise<BankingRecord[]>;
}
import { Repository } from 'typeorm';
import { AppDataSource } from '../../../../infrastructure/database/connection';
import { BankingRecordModel } from '../models/BankingRecordModel';
import { BankingRecord, BankingTransactionType } from '../../../../core/domain/entities/BankingRecord.entity';
import { IBankingRepository } from '../../../../core/ports/outbound/IBankingRepository';

/**
 * Banking Repository Implementation
 * 
 * Handles persistence of banking records in PostgreSQL
 */

export class BankingRepository implements IBankingRepository {
  
  private repository: Repository<BankingRecordModel>;

  constructor() {
    this.repository = AppDataSource.getRepository(BankingRecordModel);
  }

  /**
   * Save banking record
   */
  async save(record: BankingRecord): Promise<BankingRecord> {
    console.log(`💾 [BankingRepo] Saving banking record for ${record.getShipId()}`);
    
    const model = this.toModel(record);
    const savedModel = await this.repository.save(model);
    
    console.log(`✅ [BankingRepo] Saved successfully`);
    
    return this.toDomain(savedModel);
  }

  /**
   * Find all records for a ship
   */
  async findByShipId(shipId: string): Promise<BankingRecord[]> {
    console.log(`🔍 [BankingRepo] Finding records for ship: ${shipId}`);
    
    const models = await this.repository.find({
      where: { ship_id: shipId },
      order: { transaction_date: 'ASC' },
    });

    console.log(`✅ [BankingRepo] Found ${models.length} records`);
    
    return models.map(model => this.toDomain(model));
  }

  /**
   * Find records for a ship in a specific year
   */
  async findByShipIdAndYear(shipId: string, year: number): Promise<BankingRecord[]> {
    console.log(`🔍 [BankingRepo] Finding records for ${shipId} in ${year}`);
    
    const models = await this.repository.find({
      where: { 
        ship_id: shipId,
        year: year,
      },
      order: { transaction_date: 'ASC' },
    });

    console.log(`✅ [BankingRepo] Found ${models.length} records`);
    
    return models.map(model => this.toDomain(model));
  }

  /**
   * Get current balance for a ship
   * 
   * Strategy: Get the most recent transaction and return its remaining_balance
   */
  async getCurrentBalance(shipId: string): Promise<number> {
    console.log(`💰 [BankingRepo] Getting current balance for ${shipId}`);
    
    const latestRecord = await this.repository.findOne({
      where: { ship_id: shipId },
      order: { transaction_date: 'DESC' }, // Most recent first
    });

    if (!latestRecord) {
      console.log(`✅ [BankingRepo] No records found, balance = 0`);
      return 0;
    }

    const balance = Number(latestRecord.remaining_balance);
    console.log(`✅ [BankingRepo] Current balance: ${balance} gCO₂e`);
    
    return balance;
  }

  /**
   * Find all banking records (for admin)
   */
  async findAll(): Promise<BankingRecord[]> {
    console.log(`🔍 [BankingRepo] Finding all banking records`);
    
    const models = await this.repository.find({
      order: { transaction_date: 'DESC' },
    });

    console.log(`✅ [BankingRepo] Found ${models.length} records`);
    
    return models.map(model => this.toDomain(model));
  }

  /**
   * HELPER: Convert database model to domain entity
   */
  private toDomain(model: BankingRecordModel): BankingRecord {
    return new BankingRecord({
      id: model.id,
      shipId: model.ship_id,
      transactionType: model.transaction_type as BankingTransactionType,
      year: model.year,
      amount: Number(model.amount),
      sourceYear: model.source_year,
      remainingBalance: Number(model.remaining_balance),
      transactionDate: model.transaction_date,
      description: model.description,
    });
  }

  /**
   * HELPER: Convert domain entity to database model
   */
  private toModel(record: BankingRecord): BankingRecordModel {
    const model = new BankingRecordModel();
    
    model.ship_id = record.getShipId();
    model.transaction_type = record.getTransactionType();
    model.year = record.getYear();
    model.amount = record.getAmount();
    model.source_year = record.getSourceYear();
    model.remaining_balance = record.getRemainingBalance();
    model.transaction_date = record.getTransactionDate();
    model.description = record.getDescription();

    return model;
  }
}
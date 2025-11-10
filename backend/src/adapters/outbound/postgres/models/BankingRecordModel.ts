import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

/**
 * Banking Record Database Model (TypeORM Entity)
 * 
 * Maps to 'banking_records' table in PostgreSQL
 */

@Entity('banking_records')
export class BankingRecordModel {
  
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 100 })
  ship_id!: string;

  @Column({ type: 'varchar', length: 20 })
  transaction_type!: string;  // 'BANK' or 'BORROW'

  @Column({ type: 'int' })
  year!: number;

  @Column({ type: 'decimal', precision: 20, scale: 2 })
  amount!: number;  // gCO₂e

  @Column({ type: 'int', nullable: true })
  source_year?: number;

  @Column({ type: 'decimal', precision: 20, scale: 2 })
  remaining_balance!: number;  // gCO₂e

  @Column({ type: 'timestamp', nullable: true })
  transaction_date?: Date;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
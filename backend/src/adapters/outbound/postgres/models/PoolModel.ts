import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

/**
 * Pool Database Model (TypeORM Entity)
 * 
 * Maps to 'pools' table in PostgreSQL
 * 
 * Note: Members are stored as JSON array
 */

@Entity('pools')
export class PoolModel {
  
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 200 })
  pool_name!: string;

  @Column({ type: 'int' })
  year!: number;

  @Column({ type: 'jsonb' })
  members!: any; // JSON array of PoolMember objects

  @Column({ type: 'decimal', precision: 20, scale: 2 })
  total_cb!: number;  // Total compliance balance (gCO₂e)

  @Column({ type: 'boolean' })
  is_compliant!: boolean;

  @Column({ type: 'varchar', length: 100, nullable: true })
  created_by?: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

/**
 * Route Database Model
 * 
 * This represents how routes are stored in PostgreSQL.
 * TypeORM will auto-create the table from this class!
 * 
 * @Entity - Tells TypeORM this is a database table
 * @Column - Tells TypeORM this is a column in the table
 */

// Table name will be 'routes'
@Entity('routes')
export class RouteModel {

  // Primary key - auto-generated UUID
  @PrimaryGeneratedColumn('uuid')
  id!: string;  // ← Add ! here too

  // Route identifier (like R001, R002)
  @Column({ type: 'varchar', length: 50, unique: true })
  route_id!: string;  // ← Add !

  // Type of vessel (Container, Tanker, etc.)
  @Column({ type: 'varchar', length: 50 })
  vessel_type!: string;  // ← Add !

  // Type of fuel (HFO, LNG, MGO)
  @Column({ type: 'varchar', length: 50 })
  fuel_type!: string;  // ← Add !

  // Year of route (e.g., 2024, 2025)
  @Column({ type: 'int' })
  year!: number;  // ← Add !

  // GHG Intensity in gCO₂e/MJ
  @Column({ type: 'decimal', precision: 10, scale: 4 })
  ghg_intensity!: number;  // ← Add ! (you had ghg_emissions, should be ghg_intensity)

  // Fuel consumption in tonnes
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  fuel_consumption!: number;  // ← Add !

  // Distance in kilometers
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  distance!: number;  // ← Add !

  // Is this the baseline route?
  @Column({ type: 'boolean', default: false })
  is_baseline!: boolean;  // ← Add !

  // When was this record created?
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at!: Date;  // ← Fixed!

  // When was this record last updated?
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at!: Date;  // ← Fixed!
}
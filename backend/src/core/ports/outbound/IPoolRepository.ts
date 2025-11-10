import { Pool } from '../../domain/entities/Pool.entity';

/**
 * Pool Repository Interface (Port)
 * 
 * Contract for pool persistence operations.
 */

export interface IPoolRepository {
  
  /**
   * Save a pool
   * 
   * @param pool - Pool entity
   * @returns Promise with saved Pool
   */
  save(pool: Pool): Promise<Pool>;

  /**
   * Find pool by ID
   * 
   * @param id - Pool UUID
   * @returns Promise with Pool or null
   */
  findById(id: string): Promise<Pool | null>;

  /**
   * Find pool by name
   * 
   * @param poolName - Pool name
   * @returns Promise with Pool or null
   */
  findByName(poolName: string): Promise<Pool | null>;

  /**
   * Find all pools for a specific year
   * 
   * @param year - Year
   * @returns Promise with array of Pools
   */
  findByYear(year: number): Promise<Pool[]>;

  /**
   * Find pools where a ship is a member
   * 
   * @param shipId - Ship identifier
   * @returns Promise with array of Pools
   */
  findByShipId(shipId: string): Promise<Pool[]>;

  /**
   * Get all pools
   * 
   * @returns Promise with all Pools
   */
  findAll(): Promise<Pool[]>;

  /**
   * Update pool
   * 
   * @param pool - Pool entity with changes
   * @returns Promise with updated Pool
   */
  update(pool: Pool): Promise<Pool>;

  /**
   * Delete pool
   * 
   * @param id - Pool UUID
   * @returns Promise with boolean (true if deleted)
   */
  delete(id: string): Promise<boolean>;
}
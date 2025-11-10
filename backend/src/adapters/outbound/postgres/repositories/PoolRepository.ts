import { Repository, Like } from 'typeorm';
import { AppDataSource } from '../../../../infrastructure/database/connection';
import { PoolModel } from '../models/PoolModel';
import { Pool, PoolMember } from '../../../../core/domain/entities/Pool.entity';
import { IPoolRepository } from '../../../../core/ports/outbound/IPoolRepository';

/**
 * Pool Repository Implementation
 * 
 * Handles persistence of pools in PostgreSQL
 */

export class PoolRepository implements IPoolRepository {
  
  private repository: Repository<PoolModel>;

  constructor() {
    this.repository = AppDataSource.getRepository(PoolModel);
  }

  /**
   * Save pool
   */
  async save(pool: Pool): Promise<Pool> {
    console.log(`💾 [PoolRepo] Saving pool: ${pool.getPoolName()}`);
    
    const model = this.toModel(pool);
    const savedModel = await this.repository.save(model);
    
    console.log(`✅ [PoolRepo] Pool saved with ID: ${savedModel.id}`);
    
    return this.toDomain(savedModel);
  }

  /**
   * Find pool by ID
   */
  async findById(id: string): Promise<Pool | null> {
    console.log(`🔍 [PoolRepo] Finding pool by ID: ${id}`);
    
    const model = await this.repository.findOne({
      where: { id },
    });

    if (!model) {
      console.log(`❌ [PoolRepo] Pool not found`);
      return null;
    }

    console.log(`✅ [PoolRepo] Found pool: ${model.pool_name}`);
    
    return this.toDomain(model);
  }

  /**
   * Find pool by name
   */
  async findByName(poolName: string): Promise<Pool | null> {
    console.log(`🔍 [PoolRepo] Finding pool by name: ${poolName}`);
    
    const model = await this.repository.findOne({
      where: { pool_name: poolName },
    });

    if (!model) {
      console.log(`❌ [PoolRepo] Pool not found`);
      return null;
    }

    console.log(`✅ [PoolRepo] Found pool`);
    
    return this.toDomain(model);
  }

  /**
   * Find pools by year
   */
  async findByYear(year: number): Promise<Pool[]> {
    console.log(`🔍 [PoolRepo] Finding pools for year: ${year}`);
    
    const models = await this.repository.find({
      where: { year },
      order: { created_at: 'DESC' },
    });

    console.log(`✅ [PoolRepo] Found ${models.length} pools`);
    
    return models.map(model => this.toDomain(model));
  }

  /**
   * Find pools by ship ID
   * 
   * Uses JSONB query to search in members array
   */
  async findByShipId(shipId: string): Promise<Pool[]> {
    console.log(`🔍 [PoolRepo] Finding pools for ship: ${shipId}`);
    
    // Raw query to search in JSONB array
    const models = await this.repository
      .createQueryBuilder('pool')
      .where(`pool.members::jsonb @> '[{"shipId": "${shipId}"}]'`)
      .orderBy('pool.created_at', 'DESC')
      .getMany();

    console.log(`✅ [PoolRepo] Found ${models.length} pools`);
    
    return models.map(model => this.toDomain(model));
  }

  /**
   * Find all pools
   */
  async findAll(): Promise<Pool[]> {
    console.log(`🔍 [PoolRepo] Finding all pools`);
    
    const models = await this.repository.find({
      order: { created_at: 'DESC' },
    });

    console.log(`✅ [PoolRepo] Found ${models.length} pools`);
    
    return models.map(model => this.toDomain(model));
  }

  /**
   * Update pool
   */
  async update(pool: Pool): Promise<Pool> {
    console.log(`💾 [PoolRepo] Updating pool: ${pool.getPoolName()}`);
    
    const id = pool.getId();
    
    if (!id) {
      throw new Error('Cannot update pool without ID');
    }

    const model = this.toModel(pool);
    model.id = id;

    const updatedModel = await this.repository.save(model);
    
    console.log(`✅ [PoolRepo] Pool updated`);
    
    return this.toDomain(updatedModel);
  }

  /**
   * Delete pool
   */
  async delete(id: string): Promise<boolean> {
    console.log(`🗑️ [PoolRepo] Deleting pool: ${id}`);
    
    const result = await this.repository.delete(id);

    const deleted = (result.affected ?? 0) > 0;
    
    console.log(`${deleted ? '✅' : '❌'} [PoolRepo] Pool ${deleted ? 'deleted' : 'not found'}`);
    
    return deleted;
  }

  /**
   * HELPER: Convert database model to domain entity
   */
  private toDomain(model: PoolModel): Pool {
    // Parse JSONB members
    const members: PoolMember[] = typeof model.members === 'string' 
      ? JSON.parse(model.members) 
      : model.members;

    return new Pool({
      id: model.id,
      poolName: model.pool_name,
      year: model.year,
      members: members,
      totalCB: Number(model.total_cb),
      isCompliant: model.is_compliant,
      createdBy: model.created_by,
      createdAt: model.created_at,
      description: model.description,
    });
  }

  /**
   * HELPER: Convert domain entity to database model
   */
  private toModel(pool: Pool): PoolModel {
    const model = new PoolModel();
    
    model.pool_name = pool.getPoolName();
    model.year = pool.getYear();
    model.members = pool.getMembers(); // TypeORM will auto-convert to JSONB
    model.total_cb = pool.getTotalCB();
    model.is_compliant = pool.getIsCompliant();
    model.created_by = pool.getCreatedBy();
    model.description = pool.getDescription();

    return model;
  }
}
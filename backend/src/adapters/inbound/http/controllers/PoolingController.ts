import { Request, Response, NextFunction } from 'express';

// Import use cases
import { CreatePoolUseCase } from '../../../../core/application/use-cases/pooling/CreatePool.usecase';
import { GetPoolDetailsUseCase } from '../../../../core/application/use-cases/pooling/GetPoolDetails.usecase';
import { GetAllPoolsUseCase } from '../../../../core/application/use-cases/pooling/GetAllPools.usecase';

// Import repositories
import { PoolRepository } from '../../../outbound/postgres/repositories/PoolRepository';
import { RouteRepository } from '../../../outbound/postgres/repositories/RouteRepository';

/**
 * Pooling Controller
 * 
 * Handles HTTP requests for pooling operations.
 */

export class PoolingController {
  
  // Use cases
  private createPoolUseCase: CreatePoolUseCase;
  private getPoolDetailsUseCase: GetPoolDetailsUseCase;
  private getAllPoolsUseCase: GetAllPoolsUseCase;

  constructor() {
    const poolRepository = new PoolRepository();
    const routeRepository = new RouteRepository();

    this.createPoolUseCase = new CreatePoolUseCase(poolRepository, routeRepository);
    this.getPoolDetailsUseCase = new GetPoolDetailsUseCase(poolRepository);
    this.getAllPoolsUseCase = new GetAllPoolsUseCase(poolRepository);
  }

  /**
   * POST /api/pools
   * Create a new pool
   * 
   * Body:
   * {
   *   "poolName": "Green Shipping Alliance",
   *   "year": 2025,
   *   "ships": [
   *     { "shipId": "SHIP001", "routeId": "R001" },
   *     { "shipId": "SHIP002", "routeId": "R002" }
   *   ],
   *   "createdBy": "Admin001",
   *   "description": "Pool for 2025 compliance"
   * }
   */
  async createPool(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      console.log('🌐 [Controller] POST /api/pools called');
      
      const { poolName, year, ships, createdBy, description } = req.body;

      // Validate required fields
      if (!poolName) {
        res.status(400).json({
          success: false,
          error: 'Missing required field: poolName',
        });
        return;
      }

      if (!year) {
        res.status(400).json({
          success: false,
          error: 'Missing required field: year',
        });
        return;
      }

      if (!ships || !Array.isArray(ships) || ships.length < 2) {
        res.status(400).json({
          success: false,
          error: 'Pool must have at least 2 ships',
        });
        return;
      }

      console.log(`🤝 [Controller] Creating pool: ${poolName} with ${ships.length} ships`);

      // Call use case
      const result = await this.createPoolUseCase.execute({
        poolName,
        year,
        ships,
        createdBy,
        description,
      });

      console.log(`✅ [Controller] Pool created successfully`);

      res.status(201).json(result);
      
    } catch (error: any) {
      console.error('❌ [Controller] Error in createPool:', error);
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to create pool',
      });
    }
  }

  /**
   * GET /api/pools/:id
   * Get pool details by ID
   */
  async getPoolById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      console.log('🌐 [Controller] GET /api/pools/:id called');
      
      const poolId = req.params.id;

      console.log(`🔍 [Controller] Getting pool: ${poolId}`);

      // Call use case
      const result = await this.getPoolDetailsUseCase.execute({
        poolId,
      });

      console.log(`✅ [Controller] Pool details retrieved`);

      res.status(200).json(result);
      
    } catch (error: any) {
      console.error('❌ [Controller] Error in getPoolById:', error);
      res.status(404).json({
        success: false,
        error: error.message || 'Pool not found',
      });
    }
  }

  /**
   * GET /api/pools?year=2025&shipId=SHIP001
   * Get all pools (with optional filters)
   */
  async getAllPools(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      console.log('🌐 [Controller] GET /api/pools called');
      
      const yearParam = req.query.year as string | undefined;
      const shipId = req.query.shipId as string | undefined;

      const year = yearParam ? parseInt(yearParam) : undefined;

      console.log(`📊 [Controller] Getting pools${year ? ` for year ${year}` : ''}${shipId ? ` for ship ${shipId}` : ''}`);

      // Call use case
      const result = await this.getAllPoolsUseCase.execute({
        year,
        shipId,
      });

      console.log(`✅ [Controller] Found ${result.totalPools} pools`);

      res.status(200).json(result);
      
    } catch (error: any) {
      console.error('❌ [Controller] Error in getAllPools:', error);
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to get pools',
      });
    }
  }
}

// Export singleton
export default new PoolingController();
import { IPoolRepository } from '../../../ports/outbound/IPoolRepository';

/**
 * Get All Pools Use Case
 * 
 * Business Logic:
 * 1. Get all pools (optionally filter by year or ship)
 * 2. Format and return list
 */

/**
 * Input DTO
 */
export interface GetAllPoolsInput {
  year?: number;      // Optional: filter by year
  shipId?: string;    // Optional: filter by ship membership
}

/**
 * Pool Summary DTO
 */
export interface PoolSummary {
  id?: string;
  poolName: string;
  year: number;
  memberCount: number;
  totalCBTonnes: number;
  isCompliant: boolean;
  status: 'compliant' | 'non-compliant';
  createdAt: Date;
}

/**
 * Output DTO
 */
export interface GetAllPoolsOutput {
  success: boolean;
  totalPools: number;
  compliantPools: number;
  nonCompliantPools: number;
  pools: PoolSummary[];
}

export class GetAllPoolsUseCase {
  
  constructor(private poolRepository: IPoolRepository) {}

  /**
   * Execute the use case
   */
  async execute(input: GetAllPoolsInput): Promise<GetAllPoolsOutput> {
    console.log(`📊 [UseCase] GetAllPools.execute() called`);

    let pools;

    // Filter based on input
    if (input.year) {
      console.log(`   Filtering by year: ${input.year}`);
      pools = await this.poolRepository.findByYear(input.year);
    } else if (input.shipId) {
      console.log(`   Filtering by ship: ${input.shipId}`);
      pools = await this.poolRepository.findByShipId(input.shipId);
    } else {
      console.log(`   Getting all pools`);
      pools = await this.poolRepository.findAll();
    }

    console.log(`✅ [UseCase] Found ${pools.length} pools`);

    // Count compliant vs non-compliant
    const compliantPools = pools.filter(p => p.getIsCompliant()).length;
    const nonCompliantPools = pools.length - compliantPools;

    // Format pools
    const poolSummaries: PoolSummary[] = pools.map(pool => ({
      id: pool.getId(),
      poolName: pool.getPoolName(),
      year: pool.getYear(),
      memberCount: pool.getMemberCount(),
      totalCBTonnes: parseFloat(pool.getTotalCBInTonnes().toFixed(2)),
      isCompliant: pool.getIsCompliant(),
      status: pool.getIsCompliant() ? 'compliant' : 'non-compliant',
      createdAt: pool.getCreatedAt(),
    }));

    return {
      success: true,
      totalPools: pools.length,
      compliantPools: compliantPools,
      nonCompliantPools: nonCompliantPools,
      pools: poolSummaries,
    };
  }
}
import { IPoolRepository } from '../../../ports/outbound/IPoolRepository';

/**
 * Get Pool Details Use Case
 * 
 * Business Logic:
 * 1. Find pool by ID or name
 * 2. Format and return detailed pool information
 */

/**
 * Input DTO
 */
export interface GetPoolDetailsInput {
  poolId?: string;      // Search by ID
  poolName?: string;    // Or search by name
}

/**
 * Output DTO
 */
export interface GetPoolDetailsOutput {
  success: boolean;
  pool: {
    id?: string;
    poolName: string;
    year: number;
    memberCount: number;
    members: Array<{
      shipId: string;
      complianceBalance: number;
      complianceBalanceTonnes: number;
      contribution: 'surplus' | 'deficit';
    }>;
    totalCB: number;
    totalCBTonnes: number;
    totalSurplus: number;
    totalDeficit: number;
    totalSurplusTonnes: number;
    totalDeficitTonnes: number;
    surplusMembers: number;
    deficitMembers: number;
    isCompliant: boolean;
    status: 'compliant' | 'non-compliant';
    penalty: number;
    penaltyPerMember: number;
    createdBy?: string;
    createdAt: Date;
    description?: string;
  };
}

export class GetPoolDetailsUseCase {
  
  constructor(private poolRepository: IPoolRepository) {}

  /**
   * Execute the use case
   */
  async execute(input: GetPoolDetailsInput): Promise<GetPoolDetailsOutput> {
    console.log(`🔍 [UseCase] GetPoolDetails.execute() called`);

    // Validate input
    if (!input.poolId && !input.poolName) {
      throw new Error('Either poolId or poolName must be provided');
    }

    // Find pool
    let pool;
    
    if (input.poolId) {
      console.log(`   Searching by ID: ${input.poolId}`);
      pool = await this.poolRepository.findById(input.poolId);
    } else if (input.poolName) {
      console.log(`   Searching by name: ${input.poolName}`);
      pool = await this.poolRepository.findByName(input.poolName);
    }

    if (!pool) {
      throw new Error('Pool not found');
    }

    console.log(`✅ [UseCase] Found pool: ${pool.getPoolName()}`);

    // Format output
    const totalCB = pool.getTotalCB();
    const totalCBTonnes = pool.getTotalCBInTonnes();
    const isCompliant = pool.getIsCompliant();
    const totalSurplus = pool.getTotalSurplus();
    const totalDeficit = pool.getTotalDeficit();
    const surplusMembers = pool.getSurplusMembers();
    const deficitMembers = pool.getDeficitMembers();
    const penalty = pool.calculatePenalty();
    const penaltyPerMember = pool.getPenaltyPerMember();

    return {
      success: true,
      pool: {
        id: pool.getId(),
        poolName: pool.getPoolName(),
        year: pool.getYear(),
        memberCount: pool.getMemberCount(),
        members: pool.getMembers().map(m => ({
          shipId: m.shipId,
          complianceBalance: m.complianceBalance,
          complianceBalanceTonnes: m.contributionTonnes,
          contribution: m.complianceBalance >= 0 ? 'surplus' : 'deficit',
        })),
        totalCB: totalCB,
        totalCBTonnes: parseFloat(totalCBTonnes.toFixed(2)),
        totalSurplus: totalSurplus,
        totalDeficit: totalDeficit,
        totalSurplusTonnes: parseFloat((totalSurplus / 1000000).toFixed(2)),
        totalDeficitTonnes: parseFloat((totalDeficit / 1000000).toFixed(2)),
        surplusMembers: surplusMembers.length,
        deficitMembers: deficitMembers.length,
        isCompliant: isCompliant,
        status: isCompliant ? 'compliant' : 'non-compliant',
        penalty: parseFloat(penalty.toFixed(2)),
        penaltyPerMember: parseFloat(penaltyPerMember.toFixed(2)),
        createdBy: pool.getCreatedBy(),
        createdAt: pool.getCreatedAt(),
        description: pool.getDescription(),
      },
    };
  }
}
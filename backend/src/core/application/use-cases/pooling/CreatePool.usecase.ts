import { Pool, PoolMember } from '../../../domain/entities/Pool.entity';
import { ComplianceBalance } from '../../../domain/entities/ComplianceBalance.entity';
import { IPoolRepository } from '../../../ports/outbound/IPoolRepository';
import { IRouteRepository } from '../../../ports/outbound/IRouteRepository';

/**
 * Create Pool Use Case
 * 
 * Business Logic:
 * 1. Validate pool doesn't already exist
 * 2. For each ship, calculate their compliance balance
 * 3. Create pool members array
 * 4. Create Pool entity (auto-calculates total CB)
 * 5. Save to repository
 * 6. Return pool details
 * 
 * Use Case: Multiple ships want to form a pooling agreement
 * to share their compliance balances.
 */

/**
 * Ship Input for Pool Creation
 */
export interface ShipInput {
  shipId: string;
  routeId?: string;  // Optional: specific route, otherwise use baseline
}

/**
 * Input DTO
 */
export interface CreatePoolInput {
  poolName: string;
  year: number;
  ships: ShipInput[];  // Array of ships to include
  createdBy?: string;
  description?: string;
}

/**
 * Output DTO
 */
export interface CreatePoolOutput {
  success: boolean;
  message: string;
  pool: {
    id?: string;
    poolName: string;
    year: number;
    memberCount: number;
    members: Array<{
      shipId: string;
      routeId: string;
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
    isCompliant: boolean;
    status: 'compliant' | 'non-compliant';
    penalty: number;
    penaltyPerMember: number;
    createdBy?: string;
    createdAt: Date;
    description?: string;
  };
}

export class CreatePoolUseCase {
  
  constructor(
    private poolRepository: IPoolRepository,
    private routeRepository: IRouteRepository
  ) {}

  /**
   * Execute the use case
   */
  async execute(input: CreatePoolInput): Promise<CreatePoolOutput> {
    console.log(`🤝 [UseCase] CreatePool.execute() called`);
    console.log(`   Pool: ${input.poolName}, Year: ${input.year}, Ships: ${input.ships.length}`);

    // Validate input
    this.validateInput(input);

    // Step 1: Check if pool name already exists
    console.log(`🔍 [UseCase] Checking if pool name exists...`);
    const existingPool = await this.poolRepository.findByName(input.poolName);
    
    if (existingPool) {
      throw new Error(`Pool with name "${input.poolName}" already exists`);
    }

    // Step 2: Calculate compliance balance for each ship
    console.log(`🧮 [UseCase] Calculating compliance balances for ${input.ships.length} ships...`);
    
    const poolMembers: PoolMember[] = [];

    for (const shipInput of input.ships) {
      console.log(`   Processing ${shipInput.shipId}...`);
      
      // Get route data
      let route;
      
      if (shipInput.routeId) {
        route = await this.routeRepository.findByRouteId(shipInput.routeId);
        if (!route) {
          throw new Error(`Route ${shipInput.routeId} not found for ship ${shipInput.shipId}`);
        }
      } else {
        // Use baseline route
        route = await this.routeRepository.findBaseline();
        if (!route) {
          throw new Error('No baseline route found. Please set a baseline route first.');
        }
      }

      // Calculate compliance balance
      const cb = ComplianceBalance.createFromRoute(
        shipInput.shipId,
        input.year,
        route.getFuelConsumption(),
        route.getGHGIntensity(),
        1.0
      );

      const complianceBalance = cb.getComplianceBalance();
      const contributionTonnes = complianceBalance / 1000000;

      console.log(`      CB: ${contributionTonnes.toFixed(2)} tonnes`);

      // Add to members array
      poolMembers.push({
        shipId: shipInput.shipId,
        complianceBalance: complianceBalance,
        contribution: complianceBalance,
        contributionTonnes: parseFloat(contributionTonnes.toFixed(2)),
      });
    }

    // Step 3: Create Pool entity
    console.log(`📝 [UseCase] Creating pool entity...`);
    
    const pool = Pool.createPool(
      input.poolName,
      input.year,
      poolMembers,
      input.createdBy,
      input.description
    );

    console.log(`   Total CB: ${pool.getTotalCBInTonnes().toFixed(2)} tonnes`);
    console.log(`   Status: ${pool.getIsCompliant() ? 'COMPLIANT ✅' : 'NON-COMPLIANT ❌'}`);

    // Step 4: Save to repository
    console.log(`💾 [UseCase] Saving pool to database...`);
    
    const savedPool = await this.poolRepository.save(pool);
    
    console.log(`✅ [UseCase] Pool created successfully!`);

    // Step 5: Format output
    const totalCB = savedPool.getTotalCB();
    const totalCBTonnes = savedPool.getTotalCBInTonnes();
    const isCompliant = savedPool.getIsCompliant();
    const totalSurplus = savedPool.getTotalSurplus();
    const totalDeficit = savedPool.getTotalDeficit();
    const penalty = savedPool.calculatePenalty();
    const penaltyPerMember = savedPool.getPenaltyPerMember();

    const message = isCompliant
      ? `✅ Pool "${input.poolName}" created successfully! Pool is COMPLIANT with a total surplus of ${totalCBTonnes.toFixed(2)} tonnes CO₂e.`
      : `⚠️ Pool "${input.poolName}" created but is NON-COMPLIANT. Total deficit: ${Math.abs(totalCBTonnes).toFixed(2)} tonnes. Penalty: €${penalty.toFixed(2)} (€${penaltyPerMember.toFixed(2)} per member).`;

    console.log(`🎉 [UseCase] ${message}`);

    return {
      success: true,
      message: message,
      pool: {
        id: savedPool.getId(),
        poolName: savedPool.getPoolName(),
        year: savedPool.getYear(),
        memberCount: savedPool.getMemberCount(),
        members: savedPool.getMembers().map(m => ({
          shipId: m.shipId,
          routeId: 'auto-calculated', // Would need to track this separately if needed
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
        isCompliant: isCompliant,
        status: isCompliant ? 'compliant' : 'non-compliant',
        penalty: parseFloat(penalty.toFixed(2)),
        penaltyPerMember: parseFloat(penaltyPerMember.toFixed(2)),
        createdBy: savedPool.getCreatedBy(),
        createdAt: savedPool.getCreatedAt(),
        description: savedPool.getDescription(),
      },
    };
  }

  /**
   * Validate input
   */
  private validateInput(input: CreatePoolInput): void {
    if (!input.poolName || input.poolName.trim() === '') {
      throw new Error('Pool name is required');
    }

    if (!input.year || input.year < 2025 || input.year > 2030) {
      throw new Error('Year must be between 2025 and 2030');
    }

    if (!input.ships || input.ships.length < 2) {
      throw new Error('Pool must have at least 2 ships');
    }

    // Check for duplicate ships
    const shipIds = input.ships.map(s => s.shipId);
    const uniqueShipIds = new Set(shipIds);
    
    if (shipIds.length !== uniqueShipIds.size) {
      throw new Error('Cannot include the same ship multiple times in a pool');
    }
  }
}
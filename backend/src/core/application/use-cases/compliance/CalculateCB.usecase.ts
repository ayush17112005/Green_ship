import { ComplianceBalance } from '../../../domain/entities/ComplianceBalance.entity';
import { IRouteRepository } from '../../../ports/outbound/IRouteRepository';

/**
 * Calculate Compliance Balance (CB) Use Case
 * 
 * Business Logic:
 * 1. Get route data for the ship
 * 2. Extract fuel consumption and GHG intensity
 * 3. Use ComplianceBalance.createFromRoute() to calculate CB
 * 4. Return the compliance balance with status
 * 
 * Use Case Input:
 * - shipId: Identifier of the ship (e.g., "SHIP001")
 * - year: Compliance year (2025-2030)
 * - routeId: (Optional) Specific route to use
 * 
 * Use Case Output:
 * - ComplianceBalance entity with all calculations
 * - Compliance status (compliant/non-compliant)
 * - Surplus or deficit amount
 */

/**
 * Input DTO (Data Transfer Object)
 */
export interface CalculateCBInput {
  shipId: string;
  year: number;
  routeId?: string;  // Optional: use specific route
}

/**
 * Output DTO
 */
export interface CalculateCBOutput {
  shipId: string;
  year: number;
  routeId: string;
  
  // Energy and GHG data
  energyInScope: number;           // MJ
  fuelConsumption: number;         // tonnes
  ghgTarget: number;               // gCO₂e/MJ
  ghgActual: number;               // gCO₂e/MJ
  
  // Compliance Balance
  complianceBalance: number;       // gCO₂e (positive = surplus, negative = deficit)
  complianceBalanceTonnes: number; // tonnes CO₂e (easier to read)
  
  // Status
  isCompliant: boolean;
  status: 'compliant' | 'non-compliant';
  
  // Surplus or Deficit
  surplus: number;                 // gCO₂e (if compliant)
  deficit: number;                 // gCO₂e (if non-compliant)
  surplusTonnes: number;           // tonnes CO₂e
  deficitTonnes: number;           // tonnes CO₂e
  
  // Potential penalty
  penalty: number;                 // EUR (if non-compliant)
  
  // Additional info
  message: string;
}

export class CalculateCBUseCase {
  
  constructor(private routeRepository: IRouteRepository) {}

  /**
   * Execute the use case
   * 
   * @param input - CalculateCBInput
   * @returns Promise<CalculateCBOutput>
   */
  async execute(input: CalculateCBInput): Promise<CalculateCBOutput> {
    console.log(`[UseCase] CalculateCB.execute() called`);
    console.log(`   Ship: ${input.shipId}, Year: ${input.year}`);

    // Validate input
    this.validateInput(input);

    // Step 1: Get route data
    let route;
    
    if (input.routeId) {
      // Use specific route if provided
      console.log(`[UseCase] Finding route: ${input.routeId}`);
      route = await this.routeRepository.findByRouteId(input.routeId);
      
      if (!route) {
        throw new Error(`Route ${input.routeId} not found`);
      }
    } else {
      // Use baseline route (typical scenario)
      console.log(`[UseCase] Using baseline route`);
      route = await this.routeRepository.findBaseline();
      
      if (!route) {
        throw new Error('No baseline route found. Please set a baseline route first.');
      }
    }

    console.log(`[UseCase] Using route: ${route.getRouteId()}`);

    // Step 2: Extract data from route
    const fuelConsumption = route.getFuelConsumption();
    const ghgActual = route.getGHGIntensity();
    const routeYear = route.getYear();

    console.log(`[UseCase] Route data:`);
    console.log(`   Fuel: ${fuelConsumption} tonnes`);
    console.log(`   GHG Actual: ${ghgActual} gCO₂e/MJ`);
    console.log(`   Route Year: ${routeYear}`);

    // Step 3: Calculate Compliance Balance using domain entity
    console.log(`[UseCase] Calculating CB for year ${input.year}...`);
    
    const cb = ComplianceBalance.createFromRoute(
      input.shipId,
      input.year,
      fuelConsumption,
      ghgActual,
      1.0  // Multiplier (M) = 1.0
    );

    console.log(`[UseCase] CB calculated: ${cb.getComplianceBalance()} gCO₂e`);

    // Step 4: Format output
    const complianceBalanceGrams = cb.getComplianceBalance();
    const complianceBalanceTonnes = complianceBalanceGrams / 1000000; // Convert to tonnes
    
    const isCompliant = cb.isCompliant();
    const surplus = cb.getSurplusAmount();
    const deficit = cb.getDeficitAmount();
    const penalty = cb.calculatePenalty();

    // Create user-friendly message
    let message = '';
    if (isCompliant) {
      if (surplus > 0) {
        message = `Compliant! You have a surplus of ${(surplus / 1000000).toFixed(2)} tonnes CO₂e that can be banked or pooled.`;
      } else {
        message = `Compliant! You exactly met the FuelEU target.`;
      }
    } else {
      message = `Non-compliant! You have a deficit of ${(deficit / 1000000).toFixed(2)} tonnes CO₂e. You must use banked credits, join a pool, or pay a penalty of €${penalty.toFixed(2)}.`;
    }

    console.log(`[UseCase] Result: ${message}`);

    // Step 5: Return output
    return {
      shipId: input.shipId,
      year: input.year,
      routeId: route.getRouteId(),
      
      energyInScope: cb.getEnergyInScope(),
      fuelConsumption: fuelConsumption,
      ghgTarget: cb.getGHGTarget(),
      ghgActual: cb.getGHGActual(),
      
      complianceBalance: complianceBalanceGrams,
      complianceBalanceTonnes: parseFloat(complianceBalanceTonnes.toFixed(2)),
      
      isCompliant: isCompliant,
      status: isCompliant ? 'compliant' : 'non-compliant',
      
      surplus: surplus,
      deficit: deficit,
      surplusTonnes: parseFloat((surplus / 1000000).toFixed(2)),
      deficitTonnes: parseFloat((deficit / 1000000).toFixed(2)),
      
      penalty: parseFloat(penalty.toFixed(2)),
      
      message: message,
    };
  }

  /**
   * Validate input
   */
  private validateInput(input: CalculateCBInput): void {
    if (!input.shipId || input.shipId.trim() === '') {
      throw new Error('Ship ID is required');
    }

    if (!input.year || input.year < 2025 || input.year > 2030) {
      throw new Error('Year must be between 2025 and 2030');
    }
  }
}
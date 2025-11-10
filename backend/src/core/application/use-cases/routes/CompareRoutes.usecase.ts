import { Route } from '../../../domain/entities/Route.entity';
import { IRouteRepository } from '../../../ports/outbound/IRouteRepository';

/**
 * Compare Routes Use Case
 * 
 * Business Logic:
 * 1. Get the baseline route
 * 2. Get all other routes
 * 3. Compare each route against baseline
 * 4. Calculate percentage difference
 * 5. Check compliance against FuelEU target
 */

// FuelEU Maritime GHG Intensity Targets (gCO₂e/MJ)
const FUELEU_TARGETS = {
  2025: 89.3368,  // 2% reduction from 91.16 baseline
  2026: 87.7528,  // 4% reduction
  2027: 86.1688,  // 6% reduction
  2028: 84.5848,  // 8% reduction
  2029: 83.0008,  // 10% reduction
  2030: 81.4168,  // 13% reduction
};

/**
 * Route Comparison Result
 */
export interface RouteComparison {
  routeId: string;
  vesselType: string;
  fuelType: string;
  year: number;
  ghgIntensity: number;
  percentDiffFromBaseline: number;  // % difference from baseline
  compliant: boolean;                // Meets FuelEU target?
  surplus: number;                   // If compliant, how much surplus (gCO₂e)
  deficit: number;                   // If non-compliant, how much deficit (gCO₂e)
}

/**
 * Comparison Response
 */
export interface ComparisonResponse {
  baseline: {
    routeId: string;
    vesselType: string;
    fuelType: string;
    ghgIntensity: number;
  };
  target: number;  // FuelEU target for the year
  year: number;
  comparisons: RouteComparison[];
}

export class CompareRoutesUseCase {
  
  constructor(private routeRepository: IRouteRepository) {}

  /**
   * Execute the comparison
   * 
   * @param year - Year for FuelEU target (2025-2030)
   * @returns Promise with comparison results
   */
  async execute(year: number = 2025): Promise<ComparisonResponse> {
    console.log(`📊 [UseCase] CompareRoutes.execute() called for year ${year}`);

    // Step 1: Get baseline route
    const baselineRoute = await this.routeRepository.findBaseline();
    
    if (!baselineRoute) {
      throw new Error('No baseline route found. Please set a baseline first.');
    }

    console.log(`✅ [UseCase] Found baseline: ${baselineRoute.getRouteId()}`);

    // Step 2: Get FuelEU target for the year
    const target = FUELEU_TARGETS[year as keyof typeof FUELEU_TARGETS] || FUELEU_TARGETS[2025];
    
    console.log(`🎯 [UseCase] FuelEU ${year} target: ${target} gCO₂e/MJ`);

    // Step 3: Get all routes
    const allRoutes = await this.routeRepository.findAll();
    
    console.log(`📋 [UseCase] Comparing ${allRoutes.length} routes`);

    // Step 4: Compare each route against baseline
    const comparisons: RouteComparison[] = allRoutes
      .filter(route => route.getRouteId() !== baselineRoute.getRouteId()) // Exclude baseline
      .map(route => {
        const ghgIntensity = route.getGHGIntensity();
        const baselineIntensity = baselineRoute.getGHGIntensity();
        
        // Calculate percentage difference from baseline
        const percentDiff = ((ghgIntensity - baselineIntensity) / baselineIntensity) * 100;
        
        // Check if compliant (intensity below target)
        const compliant = ghgIntensity <= target;
        
        // Calculate surplus or deficit
        // Using route's fuel consumption for calculation
        const energyInScope = route.getFuelConsumption() * 41000; // MJ
        const actualEmissions = ghgIntensity * energyInScope; // gCO₂e
        const targetEmissions = target * energyInScope; // gCO₂e
        const difference = targetEmissions - actualEmissions; // Positive = surplus, Negative = deficit
        
        return {
          routeId: route.getRouteId(),
          vesselType: route.getVesselType(),
          fuelType: route.getFuelType(),
          year: route.getYear(),
          ghgIntensity: ghgIntensity,
          percentDiffFromBaseline: parseFloat(percentDiff.toFixed(2)),
          compliant: compliant,
          surplus: compliant ? parseFloat((difference / 1000000).toFixed(2)) : 0, // Convert to tonnes
          deficit: !compliant ? parseFloat((Math.abs(difference) / 1000000).toFixed(2)) : 0, // Convert to tonnes
        };
      });

    console.log(`✅ [UseCase] Comparison complete`);

    // Step 5: Return comparison response
    return {
      baseline: {
        routeId: baselineRoute.getRouteId(),
        vesselType: baselineRoute.getVesselType(),
        fuelType: baselineRoute.getFuelType(),
        ghgIntensity: baselineRoute.getGHGIntensity(),
      },
      target: target,
      year: year,
      comparisons: comparisons,
    };
  }
}
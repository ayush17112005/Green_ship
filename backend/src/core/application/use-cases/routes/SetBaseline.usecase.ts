import { Route } from '../../../domain/entities/Route.entity';
import { IRouteRepository } from '../../../ports/outbound/IRouteRepository';

/**
 * Set Baseline Use Case
 * 
 * Business rule: Only ONE route can be baseline at a time
 * This use case ensures that rule is followed.
 */

export class SetBaselineUseCase {
  
  constructor(private routeRepository: IRouteRepository) {}

  /**
   * Set a route as baseline
   * 
   * @param routeId - The route_id to set as baseline (e.g., "R001")
   * @returns Promise with the updated Route
   * @throws Error if route not found
   */
  async execute(routeId: string): Promise<Route> {
    // Validate input
    if (!routeId || routeId.trim() === '') {
      throw new Error('Route ID is required');
    }

    // Check if route exists
    const route = await this.routeRepository.findByRouteId(routeId);
    
    if (!route) {
      throw new Error(`Route ${routeId} not found`);
    }

    // Set as baseline (repository handles removing baseline from others)
    const updatedRoute = await this.routeRepository.setBaseline(routeId);

    return updatedRoute;
  }
}
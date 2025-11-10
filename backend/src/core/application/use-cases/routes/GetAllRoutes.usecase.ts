// Import the Route entity
import { Route } from '../../../domain/entities/Route.entity';

// Import the repository interface
import { IRouteRepository } from '../../../ports/outbound/IRouteRepository';

/**
 * Get All Routes Use Case
 * 
 * This is BUSINESS LOGIC - independent of HTTP, database, etc.
 * 
 * Responsibility: Fetch all routes from repository
 * 
 * Why a separate use case?
 * - Reusable (can be called from HTTP, CLI, cron job, etc.)
 * - Testable (easy to mock repository)
 * - Clear business intent (what does this do?)
 */

export class GetAllRoutesUseCase {
  
  // Dependency injection - use case depends on interface, not implementation
  constructor(private routeRepository: IRouteRepository) {}

  /**
   * Execute the use case
   * 
   * @returns Promise with array of Route entities
   */
  async execute(): Promise<Route[]> {
    // Simply delegate to repository
    // In real projects, you might add:
    // - Logging
    // - Caching
    // - Authorization checks
    // - Data transformation
    return await this.routeRepository.findAll();
  }
}
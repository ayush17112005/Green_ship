import { Request, Response, NextFunction } from 'express';

// Import use cases
import { GetAllRoutesUseCase } from '../../../../core/application/use-cases/routes/GetAllRoutes.usecase';
import { SetBaselineUseCase } from '../../../../core/application/use-cases/routes/SetBaseline.usecase';
import { CompareRoutesUseCase } from '../../../../core/application/use-cases/routes/CompareRoutes.usecase';
// Import repository
import { RouteRepository } from '../../../outbound/postgres/repositories/RouteRepository';

/**
 * Route Controller
 * 
 * Handles HTTP requests for route-related operations.
 * This is the ADAPTER layer - adapts HTTP to use cases.
 * 
 * Responsibilities:
 * - Parse HTTP request (body, params, query)
 * - Call appropriate use case
 * - Format HTTP response
 * - Handle HTTP errors
 */

export class RouteController {
  
  // Use cases
  private getAllRoutesUseCase: GetAllRoutesUseCase;
  private setBaselineUseCase: SetBaselineUseCase;
   private compareRoutesUseCase: CompareRoutesUseCase;
  /**
   * Constructor
   * 
   * Creates instances of use cases with repository
   */
  constructor() {
    // Create repository instance
    const routeRepository = new RouteRepository();

    // Create use cases with repository
    this.getAllRoutesUseCase = new GetAllRoutesUseCase(routeRepository);
    this.setBaselineUseCase = new SetBaselineUseCase(routeRepository);
    this.compareRoutesUseCase = new CompareRoutesUseCase(routeRepository);
  }

  /**
   * GET /api/routes
   * Get all routes
   */
  async getAllRoutes(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Call use case
      const routes = await this.getAllRoutesUseCase.execute();

      // Convert domain entities to JSON-friendly format
      const routesData = routes.map(route => ({
        id: route.getId(),
        routeId: route.getRouteId(),
        vesselType: route.getVesselType(),
        fuelType: route.getFuelType(),
        year: route.getYear(),
        ghgIntensity: route.getGHGIntensity(),
        fuelConsumption: route.getFuelConsumption(),
        distance: route.getDistance(),
        totalEmissions: route.calculateTotalEmissions(),
        isBaseline: route.getIsBaseline(),
      }));

      // Send success response
      res.status(200).json({
        success: true,
        count: routesData.length,
        data: routesData,
      });
      
    } catch (error) {
      // Pass error to error handler middleware
      next(error);
    }
  }

  /**
   * POST /api/routes/:id/baseline
   * Set a route as baseline
   */
  async setBaseline(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Get route ID from URL parameter
      const routeId = req.params.id;

      // Call use case
      const updatedRoute = await this.setBaselineUseCase.execute(routeId);

      // Format response
      res.status(200).json({
        success: true,
        message: `Route ${routeId} set as baseline`,
        data: {
          id: updatedRoute.getId(),
          routeId: updatedRoute.getRouteId(),
          isBaseline: updatedRoute.getIsBaseline(),
        },
      });
      
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/routes/comparison
   * Compare routes against baseline
   */
/**
 * GET /api/routes/comparison
 * Compare routes against baseline
 */
  async compareRoutes(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      console.log('🌐 [Controller] GET /api/routes/comparison called');
      
      // Get year from query parameter (default: 2025)
      const year = req.query.year ? parseInt(req.query.year as string) : 2025;
      
      console.log(`📊 [Controller] Comparing routes for year ${year}`);

      // Call use case
      const comparison = await this.compareRoutesUseCase.execute(year);

      console.log(`✅ [Controller] Comparison complete - ${comparison.comparisons.length} routes compared`);

      // Send success response
      res.status(200).json({
        success: true,
        data: comparison,
      });
      
    } catch (error) {
      console.error('❌ [Controller] Error in compareRoutes:', error);
      next(error);
    }
  }
}

// Export singleton instance
export default new RouteController();
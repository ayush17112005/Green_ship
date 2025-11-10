import { Request, Response, NextFunction } from 'express';

// Import use case
import { CalculateCBUseCase } from '../../../../core/application/use-cases/compliance/CalculateCB.usecase';

// Import repository
import { RouteRepository } from '../../../outbound/postgres/repositories/RouteRepository';

/**
 * Compliance Controller
 * 
 * Handles HTTP requests for compliance-related operations.
 * 
 * Responsibilities:
 * - Parse HTTP request (query params, body)
 * - Call appropriate use case
 * - Format HTTP response
 * - Handle HTTP errors
 */

export class ComplianceController {
  
  // Use cases
  private calculateCBUseCase: CalculateCBUseCase;

  /**
   * Constructor
   * 
   * Creates instances of use cases with repository
   */
  constructor() {
    // Create repository instance
    const routeRepository = new RouteRepository();

    // Create use cases with repository
    this.calculateCBUseCase = new CalculateCBUseCase(routeRepository);
  }

  /**
   * GET /api/compliance/cb?shipId=SHIP001&year=2025&routeId=R001
   * Calculate Compliance Balance
   * 
   * Query Parameters:
   * - shipId (required): Ship identifier
   * - year (required): Compliance year (2025-2030)
   * - routeId (optional): Specific route to use
   */
  async calculateCB(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      console.log('🌐 [Controller] GET /api/compliance/cb called');
      
      // Parse query parameters
      const shipId = req.query.shipId as string;
      const yearParam = req.query.year as string;
      const routeId = req.query.routeId as string | undefined;

      // Validate required parameters
      if (!shipId) {
        res.status(400).json({
          success: false,
          error: 'Missing required parameter: shipId',
          example: '/api/compliance/cb?shipId=SHIP001&year=2025',
        });
        return;
      }

      if (!yearParam) {
        res.status(400).json({
          success: false,
          error: 'Missing required parameter: year',
          example: '/api/compliance/cb?shipId=SHIP001&year=2025',
        });
        return;
      }

      // Parse year to number
      const year = parseInt(yearParam);

      if (isNaN(year)) {
        res.status(400).json({
          success: false,
          error: 'Year must be a number',
          example: '/api/compliance/cb?shipId=SHIP001&year=2025',
        });
        return;
      }

      console.log(`📊 [Controller] Calculating CB for ship: ${shipId}, year: ${year}`);

      // Call use case
      const result = await this.calculateCBUseCase.execute({
        shipId,
        year,
        routeId,
      });

      console.log(`✅ [Controller] CB calculated successfully`);

      // Send success response
      res.status(200).json({
        success: true,
        data: result,
      });
      
    } catch (error: any) {
      console.error('❌ [Controller] Error in calculateCB:', error);
      
      // Send error response
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to calculate compliance balance',
      });
    }
  }
}

// Export singleton instance
export default new ComplianceController();
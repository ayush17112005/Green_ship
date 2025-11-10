import { Router } from 'express';
import ComplianceController from '../controllers/ComplianceController';

/**
 * Compliance Routes
 * 
 * Base path: /api/compliance
 * 
 * Endpoints:
 * - GET /api/compliance/cb - Calculate Compliance Balance
 */

// Create a new Router instance
const router = Router();

/**
 * GET /api/compliance/cb
 * Calculate Compliance Balance for a ship
 * 
 * Query params:
 * - shipId: string (required) - Ship identifier
 * - year: number (required) - Compliance year (2025-2030)
 * - routeId: string (optional) - Specific route to use
 * 
 * Example: GET /api/compliance/cb?shipId=SHIP001&year=2025
 */
router.get('/cb', (req, res, next) => {
  ComplianceController.calculateCB(req, res, next);
});

// Export the router
export default router;
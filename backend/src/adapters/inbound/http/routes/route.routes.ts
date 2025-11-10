import { Router } from 'express';
import RouteController from '../controllers/RouteController';

/**
 * Route Routes
 * 
 * Base path: /api/routes
 * 
 * This connects HTTP endpoints to the RouteController
 */

// Create a new Router instance
const router = Router();

/**
 * GET /api/routes
 * Get all routes from database
 */
router.get('/', (req, res, next) => {
  RouteController.getAllRoutes(req, res, next);
});

/**
 * POST /api/routes/:id/baseline
 * Set a route as baseline
 */
router.post('/:id/baseline', (req, res, next) => {
  RouteController.setBaseline(req, res, next);
});

/**
 * GET /api/routes/comparison
 * Compare routes against baseline
 */
router.get('/comparison', (req, res, next) => {
  RouteController.compareRoutes(req, res, next);
});

// Export the router
export default router;
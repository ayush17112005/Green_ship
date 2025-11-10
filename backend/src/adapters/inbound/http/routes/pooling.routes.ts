import { Router } from 'express';
import PoolingController from '../controllers/PoolingController';

/**
 * Pooling Routes
 * 
 * Base path: /api/pools
 * 
 * Endpoints:
 * - POST /api/pools - Create a new pool
 * - GET /api/pools - Get all pools
 * - GET /api/pools/:id - Get pool by ID
 */

const router = Router();

/**
 * POST /api/pools
 * Create a new pooling agreement
 */
router.post('/', (req, res, next) => {
  PoolingController.createPool(req, res, next);
});

/**
 * GET /api/pools
 * Get all pools (with optional filters)
 */
router.get('/', (req, res, next) => {
  PoolingController.getAllPools(req, res, next);
});

/**
 * GET /api/pools/:id
 * Get pool details by ID
 */
router.get('/:id', (req, res, next) => {
  PoolingController.getPoolById(req, res, next);
});

export default router;
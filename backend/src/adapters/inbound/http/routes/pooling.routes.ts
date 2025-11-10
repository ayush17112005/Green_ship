import { Router, Request, Response } from 'express';

const router = Router();

/**
 * Pooling Routes
 * Base path: /api/pools
 */

/**
 * POST /api/pools
 * Create a new pool with multiple ships
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { year, members } = req.body;

    // TODO: Call CreatePool use case

    res.status(201).json({
      success: true,
      message: 'Pool created successfully',
      data: {
        poolId: 'POOL001',
        year: year,
        totalCB: 5000.50,
        members: [
          {
            shipId: 'SHIP001',
            cbBefore: 15000,
            cbAfter: 10000,
          },
          {
            shipId: 'SHIP002',
            cbBefore: -10000,
            cbAfter: -4999.50,
          },
        ],
      },
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to create pool',
    });
  }
});

export default router;
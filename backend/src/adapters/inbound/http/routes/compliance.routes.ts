// Import Router from Express
import { Router, Request, Response } from 'express';

const router = Router();

/**
 * Compliance Routes
 * Base path: /api/compliance
 */

/**
 * GET /api/compliance/cb
 * Calculate Compliance Balance for a ship
 * 
 * Query params: 
 * - shipId: string
 * - year: number
 * 
 * Example: GET /api/compliance/cb?shipId=SHIP001&year=2024
 */
router.get('/cb', async (req: Request, res: Response) => {
  try {
    // Get query parameters
    const shipId = req.query.shipId as string;
    const year = req.query.year as string;

    // TODO: Call CalculateCB use case

    // Mock response
    res.status(200).json({
      success: true,
      message: 'Compliance Balance calculated',
      data: {
        shipId: shipId,
        year: parseInt(year),
        complianceBalance: 15000.50, // gCO₂e (positive = surplus)
        status: 'compliant',
      },
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to calculate CB',
    });
  }
});

/**
 * GET /api/compliance/adjusted-cb
 * Get Compliance Balance after banking adjustments
 */
router.get('/adjusted-cb', async (req: Request, res: Response) => {
  try {
    const shipId = req.query.shipId as string;
    const year = req.query.year as string;

    // TODO: Call GetAdjustedCB use case

    res.status(200).json({
      success: true,
      message: 'Adjusted CB retrieved',
      data: {
        shipId: shipId,
        year: parseInt(year),
        originalCB: 15000.50,
        bankedAmount: 5000.00,
        adjustedCB: 20000.50,
      },
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get adjusted CB',
    });
  }
});

export default router;
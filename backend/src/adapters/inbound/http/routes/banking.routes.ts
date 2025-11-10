import { Router, Request, Response } from 'express';

const router = Router();

/**
 * Banking Routes
 * Base path: /api/banking
 */

/**
 * GET /api/banking/records
 * Get banking history for a ship
 */
router.get('/records', async (req: Request, res: Response) => {
  try {
    const shipId = req.query.shipId as string;
    const year = req.query.year as string;

    // TODO: Call GetBankingRecords use case

    res.status(200).json({
      success: true,
      message: 'Banking records retrieved',
      data: {
        shipId: shipId,
        records: [
          {
            year: 2024,
            amountBanked: 5000.00,
            timestamp: '2024-12-31T23:59:59Z',
          },
        ],
      },
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get banking records',
    });
  }
});

/**
 * POST /api/banking/bank
 * Bank surplus CB for future use
 */
router.post('/bank', async (req: Request, res: Response) => {
  try {
    const { shipId, year, amount } = req.body;

    // TODO: Call BankSurplus use case

    res.status(201).json({
      success: true,
      message: 'Surplus banked successfully',
      data: {
        shipId: shipId,
        year: year,
        amountBanked: amount,
      },
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to bank surplus',
    });
  }
});

/**
 * POST /api/banking/apply
 * Apply banked credits to deficit
 */
router.post('/apply', async (req: Request, res: Response) => {
  try {
    const { shipId, year, amount } = req.body;

    // TODO: Call ApplyBanked use case

    res.status(200).json({
      success: true,
      message: 'Banked credits applied',
      data: {
        shipId: shipId,
        year: year,
        amountApplied: amount,
        remainingBanked: 2000.00,
      },
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to apply banked credits',
    });
  }
});

export default router;
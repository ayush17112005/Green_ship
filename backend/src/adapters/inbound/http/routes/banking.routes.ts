import { Router } from 'express';
import BankingController from '../controllers/BankingController';

/**
 * Banking Routes
 * 
 * Base path: /api/banking
 * 
 * Endpoints:
 * - POST /api/banking/bank - Bank surplus credits
 * - POST /api/banking/apply - Apply banked credits
 * - GET /api/banking/history - Get transaction history
 */

const router = Router();

/**
 * POST /api/banking/bank
 * Bank surplus credits for future use
 */
router.post('/bank', (req, res, next) => {
  BankingController.bankSurplus(req, res, next);
});

/**
 * POST /api/banking/apply
 * Apply previously banked credits to offset deficit
 */
router.post('/apply', (req, res, next) => {
  BankingController.applyBanking(req, res, next);
});

/**
 * GET /api/banking/history
 * Get banking transaction history for a ship
 */
router.get('/history', (req, res, next) => {
  BankingController.getBankingHistory(req, res, next);
});

export default router;
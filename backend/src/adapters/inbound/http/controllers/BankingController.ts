import { Request, Response, NextFunction } from 'express';

// Import use cases
import { BankSurplusUseCase } from '../../../../core/application/use-cases/banking/BankSurplus.usecase';
import { ApplyBankingUseCase } from '../../../../core/application/use-cases/banking/ApplyBanking.usecase';
import { GetBankingHistoryUseCase } from '../../../../core/application/use-cases/banking/GetBankingHistory.usecase';

// Import repository
import { BankingRepository } from '../../../outbound/postgres/repositories/BankingRepository';

/**
 * Banking Controller
 * 
 * Handles HTTP requests for banking operations.
 */

export class BankingController {
  
  // Use cases
  private bankSurplusUseCase: BankSurplusUseCase;
  private applyBankingUseCase: ApplyBankingUseCase;
  private getBankingHistoryUseCase: GetBankingHistoryUseCase;

  constructor() {
    const bankingRepository = new BankingRepository();

    this.bankSurplusUseCase = new BankSurplusUseCase(bankingRepository);
    this.applyBankingUseCase = new ApplyBankingUseCase(bankingRepository);
    this.getBankingHistoryUseCase = new GetBankingHistoryUseCase(bankingRepository);
  }

  /**
   * POST /api/banking/bank
   * Bank surplus credits
   * 
   * Body:
   * {
   *   "shipId": "SHIP001",
   *   "year": 2025,
   *   "amount": 100000000,  // gCO₂e (or use amountTonnes)
   *   "amountTonnes": 100,  // tonnes CO₂e (alternative)
   *   "description": "Banking surplus from route optimization"
   * }
   */
  async bankSurplus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      console.log('🌐 [Controller] POST /api/banking/bank called');
      
      const { shipId, year, amount, amountTonnes, description } = req.body;

      // Validate required fields
      if (!shipId) {
        res.status(400).json({
          success: false,
          error: 'Missing required field: shipId',
        });
        return;
      }

      if (!year) {
        res.status(400).json({
          success: false,
          error: 'Missing required field: year',
        });
        return;
      }

      // Accept either amount (grams) or amountTonnes (tonnes)
      let amountInGrams: number;
      
      if (amountTonnes) {
        amountInGrams = amountTonnes * 1000000;
      } else if (amount) {
        amountInGrams = amount;
      } else {
        res.status(400).json({
          success: false,
          error: 'Missing required field: amount or amountTonnes',
        });
        return;
      }

      console.log(`🏦 [Controller] Banking ${amountInGrams} gCO₂e for ${shipId}`);

      // Call use case
      const result = await this.bankSurplusUseCase.execute({
        shipId,
        year,
        amount: amountInGrams,
        description,
      });

      console.log(`✅ [Controller] Banking successful`);

      res.status(201).json(result);
      
    } catch (error: any) {
      console.error('❌ [Controller] Error in bankSurplus:', error);
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to bank surplus',
      });
    }
  }

  /**
   * POST /api/banking/apply
   * Apply banked credits to offset deficit
   * 
   * Body:
   * {
   *   "shipId": "SHIP001",
   *   "year": 2026,
   *   "amount": 50000000,  // gCO₂e
   *   "amountTonnes": 50,  // tonnes (alternative)
   *   "sourceYear": 2025,
   *   "description": "Using 2025 surplus for 2026 deficit"
   * }
   */
  async applyBanking(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      console.log('🌐 [Controller] POST /api/banking/apply called');
      
      const { shipId, year, amount, amountTonnes, sourceYear, description } = req.body;

      // Validate required fields
      if (!shipId || !year || !sourceYear) {
        res.status(400).json({
          success: false,
          error: 'Missing required fields: shipId, year, sourceYear',
        });
        return;
      }

      // Accept either amount or amountTonnes
      let amountInGrams: number;
      
      if (amountTonnes) {
        amountInGrams = amountTonnes * 1000000;
      } else if (amount) {
        amountInGrams = amount;
      } else {
        res.status(400).json({
          success: false,
          error: 'Missing required field: amount or amountTonnes',
        });
        return;
      }

      console.log(`🏦 [Controller] Applying ${amountInGrams} gCO₂e for ${shipId}`);

      // Call use case
      const result = await this.applyBankingUseCase.execute({
        shipId,
        year,
        amount: amountInGrams,
        sourceYear,
        description,
      });

      console.log(`✅ [Controller] Banking applied successfully`);

      res.status(201).json(result);
      
    } catch (error: any) {
      console.error('❌ [Controller] Error in applyBanking:', error);
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to apply banking',
      });
    }
  }

  /**
   * GET /api/banking/history?shipId=SHIP001&year=2025
   * Get banking transaction history
   * 
   * Query params:
   * - shipId (required)
   * - year (optional)
   */
  async getBankingHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      console.log('🌐 [Controller] GET /api/banking/history called');
      
      const shipId = req.query.shipId as string;
      const yearParam = req.query.year as string | undefined;

      if (!shipId) {
        res.status(400).json({
          success: false,
          error: 'Missing required parameter: shipId',
        });
        return;
      }

      const year = yearParam ? parseInt(yearParam) : undefined;

      console.log(`📊 [Controller] Getting history for ${shipId}`);

      // Call use case
      const result = await this.getBankingHistoryUseCase.execute({
        shipId,
        year,
      });

      console.log(`✅ [Controller] Found ${result.totalTransactions} transactions`);

      res.status(200).json(result);
      
    } catch (error: any) {
      console.error('❌ [Controller] Error in getBankingHistory:', error);
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to get banking history',
      });
    }
  }
}

// Export singleton
export default new BankingController();
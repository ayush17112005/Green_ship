import ApiClient from './ApiClient';

const api = ApiClient.getInstance();

export interface BankSurplusRequest {
  shipId: string;
  year: number;
  amountTonnes: number;
  description?: string;
}

export interface ApplyBankingRequest {
  shipId: string;
  year: number;
  amountTonnes: number;
  sourceYear: number;
  description?: string;
}

export const BankingApiClient = {
  /**
   * Bank surplus credits
   */
  bankSurplus: (data: BankSurplusRequest) => api.post('/banking/bank', data),

  /**
   * Apply banked credits
   */
  applyBanking: (data: ApplyBankingRequest) => api.post('/banking/apply', data),

  /**
   * Get banking history
   */
  getHistory: (shipId: string, year?: number) => {
    const params: Record<string, string | number> = { shipId };
    if (year) params.year = year;
    
    return api.get('/banking/history', { params });
  },
};
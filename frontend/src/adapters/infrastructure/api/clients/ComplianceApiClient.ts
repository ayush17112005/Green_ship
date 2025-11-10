import ApiClient from './ApiClient';

const api = ApiClient.getInstance();

export const ComplianceApiClient = {
  /**
   * Calculate Compliance Balance
   */
  calculateCB: (shipId: string, year: number, routeId?: string) => {
    const params: Record<string, string | number> = { shipId, year };
    if (routeId) params.routeId = routeId;
    
    return api.get('/compliance/cb', { params });
  },
};
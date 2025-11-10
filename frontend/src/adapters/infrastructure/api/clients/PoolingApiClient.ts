import ApiClient from './ApiClient';

const api = ApiClient.getInstance();

export interface CreatePoolRequest {
  poolName: string;
  year: number;
  ships: Array<{
    shipId: string;
    routeId?: string;
  }>;
  createdBy?: string;
  description?: string;
}

export const PoolingApiClient = {
  /**
   * Create a new pool
   */
  createPool: (data: CreatePoolRequest) => api.post('/pools', data),

  /**
   * Get all pools
   */
  getAll: (year?: number, shipId?: string) => {
    const params: Record<string, string | number> = {};
    if (year) params.year = year;
    if (shipId) params.shipId = shipId;
    
    return api.get('/pools', { params });
  },

  /**
   * Get pool by ID
   */
  getById: (poolId: string) => api.get(`/pools/${poolId}`),
};
import ApiClient from './ApiClient';

const api = ApiClient.getInstance();

export const RoutesApiClient = {
  /**
   * Get all routes
   */
  getAll: () => api.get('/routes'),

  /**
   * Set baseline route
   */
  setBaseline: (routeId: string) => api.post(`/routes/${routeId}/baseline`),

  /**
   * Get route comparison
   */
  getComparison: (year: number) => api.get(`/routes/comparison`, {
    params: { year },
  }),
};
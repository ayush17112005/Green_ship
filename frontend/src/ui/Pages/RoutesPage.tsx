import { useEffect, useState } from 'react';
import { Card, LoadingSpinner } from '../components';
import { RoutesApiClient } from '../../adapters/infrastructure/api/clients';
import type { Route, RouteComparison } from '../../core/domain';
import { Ship, Star } from 'lucide-react';
import { getErrorMessage } from '../../shared/utils';

export const RoutesPage = () => {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(2025);
  const [comparison, setComparison] = useState<RouteComparison | null>(null);
  const [comparingLoading, setComparingLoading] = useState(false);

  useEffect(() => {
    loadRoutes();
  }, []);

  const loadRoutes = async () => {
    try {
      const response = await RoutesApiClient.getAll();
      setRoutes(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading routes:', error);
      alert(`❌ ${getErrorMessage(error)}`);
      setLoading(false);
    }
  };

  const setBaseline = async (routeId: string) => {
    try {
      await RoutesApiClient.setBaseline(routeId);
      await loadRoutes();
      alert(`✅ Route ${routeId} set as baseline!`);
    } catch (error) {
      console.error('Error setting baseline:', error);
      alert(`❌ ${getErrorMessage(error)}`);
    }
  };

  const loadComparison = async () => {
    setComparingLoading(true);
    try {
      const response = await RoutesApiClient.getComparison(selectedYear);
      setComparison(response.data.data);
    } catch (error) {
      console.error('Error loading comparison:', error);
      alert(`❌ ${getErrorMessage(error)}`);
    } finally {
      setComparingLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Routes Management</h1>
        <p className="mt-2 text-gray-600">Manage shipping routes and baseline selection</p>
      </div>

      {/* Routes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {routes.map((route) => (
          <Card key={route.id} className="relative">
            {route.isBaseline && (
              <div className="absolute top-4 right-4">
                <Star className="h-6 w-6 text-yellow-500 fill-current" />
              </div>
            )}
            
            <div className="flex items-center mb-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Ship className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-bold text-gray-900">{route.routeId}</h3>
                <p className="text-sm text-gray-500">{route.vesselType}</p>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Fuel Type:</span>
                <span className="text-sm font-medium">{route.fuelType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">GHG Intensity:</span>
                <span className="text-sm font-medium">{route.ghgIntensity} gCO₂e/MJ</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Distance:</span>
                <span className="text-sm font-medium">{route.distance.toLocaleString()} nm</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Fuel:</span>
                <span className="text-sm font-medium">{route.fuelConsumption.toLocaleString()} t</span>
              </div>
            </div>

            {!route.isBaseline && (
              <button
                onClick={() => setBaseline(route.routeId)}
                className="w-full btn-secondary text-sm"
              >
                Set as Baseline
              </button>
            )}
            
            {route.isBaseline && (
              <div className="w-full bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2 text-sm text-yellow-800 text-center font-medium">
                ⭐ Baseline Route
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Comparison Section */}
      <Card title="Route Comparison">
        <div className="flex items-center gap-4 mb-4">
          <label className="label">Select Year:</label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="input w-40"
          >
            {[2025, 2026, 2027, 2028, 2029, 2030].map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          <button 
            onClick={loadComparison} 
            className="btn-primary"
            disabled={comparingLoading}
          >
            {comparingLoading ? 'Loading...' : 'Compare Routes'}
          </button>
        </div>

        {comparison && (
          <div className="mt-6">
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h4 className="font-semibold mb-2">Baseline Route</h4>
              <p className="text-sm text-gray-600">
                {comparison.baseline.routeId} - {comparison.baseline.ghgIntensity} gCO₂e/MJ
              </p>
              <p className="text-sm text-gray-600">
                FuelEU {selectedYear} Target: {comparison.target} gCO₂e/MJ
              </p>
            </div>

            <div className="space-y-3">
              {comparison.comparisons.map((comp, index) => (
                <div key={index} className={`border rounded-lg p-4 ${
                  comp.compliant ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                }`}>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold">{comp.routeId}</p>
                      <p className="text-sm text-gray-600">
                        GHG: {comp.ghgIntensity} gCO₂e/MJ ({comp.percentDiffFromBaseline > 0 ? '+' : ''}{comp.percentDiffFromBaseline}%)
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`badge ${comp.compliant ? 'badge-green' : 'badge-red'}`}>
                        {comp.compliant ? '✅ Compliant' : '❌ Non-compliant'}
                      </span>
                      <p className="text-sm text-gray-600 mt-1">
                        {comp.compliant 
                          ? `Surplus: ${comp.surplus.toFixed(2)} t`
                          : `Deficit: ${comp.deficit.toFixed(2)} t`
                        }
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
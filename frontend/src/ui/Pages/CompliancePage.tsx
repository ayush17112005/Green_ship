import { useState } from 'react';
import { Card } from '../components';
import { ComplianceApiClient } from '../../adapters/infrastructure/api/clients';
import type { ComplianceBalance } from '../../core/domain';
import { Calculator, AlertCircle, CheckCircle } from 'lucide-react';
import { getErrorMessage } from '../../shared/utils';

export const CompliancePage = () => {
  const [shipId, setShipId] = useState('SHIP001');
  const [year, setYear] = useState(2025);
  const [routeId, setRouteId] = useState('');
  const [result, setResult] = useState<ComplianceBalance | null>(null);
  const [loading, setLoading] = useState(false);

  const calculateCB = async () => {
    setLoading(true);
    try {
      const response = await ComplianceApiClient.calculateCB(
        shipId,
        year,
        routeId || undefined
      );
      setResult(response.data.data);
    } catch (error) {
      console.error('Error calculating CB:', error);
      alert(`❌ ${getErrorMessage(error)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Compliance Calculator</h1>
        <p className="mt-2 text-gray-600">Calculate Compliance Balance for your vessel</p>
      </div>

      {/* Input Form */}
      <Card title="Calculate Compliance Balance">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="label">Ship ID</label>
            <input
              type="text"
              value={shipId}
              onChange={(e) => setShipId(e.target.value)}
              className="input"
              placeholder="SHIP001"
            />
          </div>
          <div>
            <label className="label">Year</label>
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="input"
            >
              {[2025, 2026, 2027, 2028, 2029, 2030].map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Route ID (Optional)</label>
            <input
              type="text"
              value={routeId}
              onChange={(e) => setRouteId(e.target.value)}
              className="input"
              placeholder="Leave empty for baseline"
            />
          </div>
        </div>
        <button
          onClick={calculateCB}
          disabled={loading || !shipId}
          className="btn-primary"
        >
          <Calculator className="inline h-4 w-4 mr-2" />
          {loading ? 'Calculating...' : 'Calculate Compliance Balance'}
        </button>
      </Card>

      {/* Results */}
      {result && (
        <Card className={`mt-6 ${result.isCompliant ? 'border-green-200' : 'border-red-200'}`}>
          <div className="flex items-center mb-4">
            {result.isCompliant ? (
              <CheckCircle className="h-8 w-8 text-green-500 mr-3" />
            ) : (
              <AlertCircle className="h-8 w-8 text-red-500 mr-3" />
            )}
            <div>
              <h3 className="text-xl font-bold">
                {result.isCompliant ? '✅ Compliant' : '❌ Non-Compliant'}
              </h3>
              <p className="text-sm text-gray-600">{result.message}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold mb-3">Vessel Information</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Ship ID:</span>
                  <span className="text-sm font-medium">{result.shipId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Route:</span>
                  <span className="text-sm font-medium">{result.routeId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Year:</span>
                  <span className="text-sm font-medium">{result.year}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Fuel Consumption:</span>
                  <span className="text-sm font-medium">{result.fuelConsumption.toLocaleString()} tonnes</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold mb-3">GHG Intensity</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Actual:</span>
                  <span className="text-sm font-medium">{result.ghgActual} gCO₂e/MJ</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Target ({result.year}):</span>
                  <span className="text-sm font-medium">{result.ghgTarget} gCO₂e/MJ</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Difference:</span>
                  <span className={`text-sm font-medium ${result.isCompliant ? 'text-green-600' : 'text-red-600'}`}>
                    {(result.ghgActual - result.ghgTarget).toFixed(2)} gCO₂e/MJ
                  </span>
                </div>
              </div>
            </div>

            <div className={`rounded-lg p-4 ${result.isCompliant ? 'bg-green-50' : 'bg-red-50'}`}>
              <h4 className="font-semibold mb-3">Compliance Balance</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">CB (gCO₂e):</span>
                  <span className="text-sm font-medium">{result.complianceBalance.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">CB (tonnes):</span>
                  <span className={`text-lg font-bold ${result.isCompliant ? 'text-green-600' : 'text-red-600'}`}>
                    {result.complianceBalanceTonnes > 0 ? '+' : ''}{result.complianceBalanceTonnes} t
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold mb-3">
                {result.isCompliant ? 'Surplus' : 'Deficit & Penalty'}
              </h4>
              <div className="space-y-2">
                {result.isCompliant ? (
                  <>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Surplus:</span>
                      <span className="text-sm font-medium text-green-600">
                        {result.surplusTonnes} tonnes
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      💡 You can bank this surplus for future use!
                    </p>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Deficit:</span>
                      <span className="text-sm font-medium text-red-600">
                        {result.deficitTonnes} tonnes
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Penalty:</span>
                      <span className="text-sm font-medium text-red-600">
                        €{result.penalty.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      💡 Use banking or pooling to avoid penalties!
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
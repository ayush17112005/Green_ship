import { useState, useEffect } from 'react';
import { Card, LoadingSpinner } from '../components';
import { PoolingApiClient } from '../../adapters/infrastructure/api/clients';
import type { Pool, PoolSummary } from '../../core/domain';
import { Users, Plus, Eye, Ship } from 'lucide-react';
import { getErrorMessage } from '../../shared/utils';

type TabType = 'create' | 'list';

export const PoolingPage = () => {
  const [activeTab, setActiveTab] = useState<TabType>('create');
  const [pools, setPools] = useState<PoolSummary[]>([]);
  const [selectedPool, setSelectedPool] = useState<Pool | null>(null);
  const [loading, setLoading] = useState(false);

  // Create Pool Form
  const [poolForm, setPoolForm] = useState({
    poolName: '',
    year: 2025,
    ships: [
      { shipId: 'SHIP001', routeId: '' },
      { shipId: 'SHIP002', routeId: '' },
    ],
    createdBy: 'Admin',
    description: '',
  });

  useEffect(() => {
    if (activeTab === 'list') {
      loadPools();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const addShip = () => {
    setPoolForm({
      ...poolForm,
      ships: [...poolForm.ships, { shipId: '', routeId: '' }],
    });
  };

  const removeShip = (index: number) => {
    setPoolForm({
      ...poolForm,
      ships: poolForm.ships.filter((_, i) => i !== index),
    });
  };

  const updateShip = (index: number, field: 'shipId' | 'routeId', value: string) => {
    const newShips = [...poolForm.ships];
    newShips[index][field] = value;
    setPoolForm({ ...poolForm, ships: newShips });
  };

  const handleCreatePool = async () => {
    setLoading(true);
    try {
      const response = await PoolingApiClient.createPool(poolForm);
      alert(`✅ ${response.data.message}`);
      
      // Reset form
      setPoolForm({
        poolName: '',
        year: 2025,
        ships: [
          { shipId: 'SHIP001', routeId: '' },
          { shipId: 'SHIP002', routeId: '' },
        ],
        createdBy: 'Admin',
        description: '',
      });
      
      // Switch to list tab
      setActiveTab('list');
    } catch (error) {
      alert(`❌ ${getErrorMessage(error)}`);
    } finally {
      setLoading(false);
    }
  };

  const loadPools = async () => {
    setLoading(true);
    try {
      const response = await PoolingApiClient.getAll();
      setPools(response.data.pools);
    } catch (error) {
      console.error('Error loading pools:', error);
      alert(`❌ ${getErrorMessage(error)}`);
    } finally {
      setLoading(false);
    }
  };

  const viewPoolDetails = async (poolId: string) => {
    setLoading(true);
    try {
      const response = await PoolingApiClient.getById(poolId);
      setSelectedPool(response.data.pool);
    } catch (error) {
      console.error('Error loading pool details:', error);
      alert(`❌ ${getErrorMessage(error)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Pooling System</h1>
        <p className="mt-2 text-gray-600">Create and manage multi-ship compliance pools</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('create')}
          className={`px-4 py-2 font-medium transition-colors border-b-2 ${
            activeTab === 'create'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Plus className="inline h-4 w-4 mr-2" />
          Create Pool
        </button>
        <button
          onClick={() => setActiveTab('list')}
          className={`px-4 py-2 font-medium transition-colors border-b-2 ${
            activeTab === 'list'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Users className="inline h-4 w-4 mr-2" />
          View Pools
        </button>
      </div>

      {/* Create Pool Tab */}
      {activeTab === 'create' && (
        <Card title="Create Pooling Agreement">
          <p className="text-sm text-gray-600 mb-6">
            Form a pooling agreement with multiple ships to share compliance balance. Pool is compliant if total CB ≥ 0.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="label">Pool Name</label>
              <input
                type="text"
                value={poolForm.poolName}
                onChange={(e) => setPoolForm({ ...poolForm, poolName: e.target.value })}
                className="input"
                placeholder="Green Shipping Alliance"
              />
            </div>
            <div>
              <label className="label">Year</label>
              <select
                value={poolForm.year}
                onChange={(e) => setPoolForm({ ...poolForm, year: Number(e.target.value) })}
                className="input"
              >
                {[2025, 2026, 2027, 2028, 2029, 2030].map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Ships */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <label className="label">Pool Members (min 2 ships)</label>
              <button onClick={addShip} className="btn-secondary text-sm">
                <Plus className="inline h-4 w-4 mr-1" />
                Add Ship
              </button>
            </div>

            <div className="space-y-3">
              {poolForm.ships.map((ship, index) => (
                <div key={index} className="flex gap-3 items-center">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={ship.shipId}
                      onChange={(e) => updateShip(index, 'shipId', e.target.value)}
                      className="input"
                      placeholder={`Ship ${index + 1} ID`}
                    />
                  </div>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={ship.routeId}
                      onChange={(e) => updateShip(index, 'routeId', e.target.value)}
                      className="input"
                      placeholder="Route ID (optional)"
                    />
                  </div>
                  {poolForm.ships.length > 2 && (
                    <button
                      onClick={() => removeShip(index)}
                      className="btn-danger text-sm px-3"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="label">Created By (Optional)</label>
              <input
                type="text"
                value={poolForm.createdBy}
                onChange={(e) => setPoolForm({ ...poolForm, createdBy: e.target.value })}
                className="input"
                placeholder="Admin"
              />
            </div>
            <div>
              <label className="label">Description (Optional)</label>
              <input
                type="text"
                value={poolForm.description}
                onChange={(e) => setPoolForm({ ...poolForm, description: e.target.value })}
                className="input"
                placeholder="e.g., 2025 compliance pooling"
              />
            </div>
          </div>

          <button
            onClick={handleCreatePool}
            disabled={
              loading ||
              !poolForm.poolName ||
              poolForm.ships.length < 2 ||
              poolForm.ships.some(s => !s.shipId)
            }
            className="btn-primary"
          >
            <Users className="inline h-4 w-4 mr-2" />
            {loading ? 'Creating Pool...' : 'Create Pooling Agreement'}
          </button>
        </Card>
      )}

      {/* List Pools Tab */}
      {activeTab === 'list' && (
        <>
          <Card title="All Pools">
            {loading && !selectedPool && <LoadingSpinner />}

            {!loading && pools.length === 0 && (
              <p className="text-gray-500 text-center py-8">No pools found. Create one!</p>
            )}

            {!loading && pools.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pools.map((pool) => (
                  <div
                    key={pool.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                      pool.isCompliant
                        ? 'border-green-200 bg-green-50'
                        : 'border-red-200 bg-red-50'
                    }`}
                    onClick={() => pool.id && viewPoolDetails(pool.id)}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-bold text-lg">{pool.poolName}</h3>
                      <span className={`badge ${pool.isCompliant ? 'badge-green' : 'badge-red'}`}>
                        {pool.isCompliant ? '✅' : '❌'}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Year:</span>
                        <span className="font-medium">{pool.year}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Members:</span>
                        <span className="font-medium">{pool.memberCount} ships</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Total CB:</span>
                        <span
                          className={`font-bold ${
                            pool.totalCBTonnes >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {pool.totalCBTonnes > 0 ? '+' : ''}
                          {pool.totalCBTonnes.toFixed(2)} t
                        </span>
                      </div>
                    </div>

                    <button className="btn-secondary w-full mt-4 text-sm">
                      <Eye className="inline h-4 w-4 mr-2" />
                      View Details
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Pool Details Modal/Card */}
          {selectedPool && (
            <Card className="mt-6" title={`Pool Details: ${selectedPool.poolName}`}>
              <button
                onClick={() => setSelectedPool(null)}
                className="btn-secondary mb-4 text-sm"
              >
                ← Back to List
              </button>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Year</p>
                  <p className="text-2xl font-bold">{selectedPool.year}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Members</p>
                  <p className="text-2xl font-bold">{selectedPool.memberCount} ships</p>
                </div>
                <div
                  className={`rounded-lg p-4 ${
                    selectedPool.isCompliant ? 'bg-green-50' : 'bg-red-50'
                  }`}
                >
                  <p className="text-sm text-gray-600">Status</p>
                  <p className="text-2xl font-bold">
                    {selectedPool.isCompliant ? '✅ Compliant' : '❌ Non-compliant'}
                  </p>
                </div>
              </div>

              {/* Pool Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-3">Pool Compliance Balance</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total CB:</span>
                      <span
                        className={`font-bold ${
                          selectedPool.totalCBTonnes >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {selectedPool.totalCBTonnes > 0 ? '+' : ''}
                        {selectedPool.totalCBTonnes.toFixed(2)} tonnes
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Surplus:</span>
                      <span className="text-sm font-medium text-green-600">
                        {selectedPool.totalSurplusTonnes.toFixed(2)} t
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Deficit:</span>
                      <span className="text-sm font-medium text-red-600">
                        {selectedPool.totalDeficitTonnes.toFixed(2)} t
                      </span>
                    </div>
                  </div>
                </div>

                {!selectedPool.isCompliant && (
                  <div className="border border-red-200 bg-red-50 rounded-lg p-4">
                    <h4 className="font-semibold mb-3 text-red-800">Penalty</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Total:</span>
                        <span className="font-bold text-red-600">
                          €{selectedPool.penalty.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Per Member:</span>
                        <span className="font-medium text-red-600">
                          €{selectedPool.penaltyPerMember.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Pool Members */}
              <h4 className="font-semibold mb-3">Pool Members</h4>
              <div className="space-y-3">
                {selectedPool.members.map((member, index) => (
                  <div
                    key={index}
                    className={`border rounded-lg p-4 ${
                      member.contribution === 'surplus'
                        ? 'border-green-200 bg-green-50'
                        : 'border-red-200 bg-red-50'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <Ship className="h-5 w-5 mr-2 text-gray-600" />
                        <div>
                          <p className="font-semibold">{member.shipId}</p>
                          <p className="text-xs text-gray-500">
                            {member.contribution === 'surplus' ? 'Surplus contributor' : 'Has deficit'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={`text-lg font-bold ${
                            member.contribution === 'surplus' ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {member.complianceBalanceTonnes > 0 ? '+' : ''}
                          {member.complianceBalanceTonnes.toFixed(2)} t
                        </p>
                        <span
                          className={`badge ${
                            member.contribution === 'surplus' ? 'badge-green' : 'badge-red'
                          }`}
                        >
                          {member.contribution}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {selectedPool.description && (
                <div className="mt-6 bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Description</p>
                  <p className="text-sm mt-1">{selectedPool.description}</p>
                </div>
              )}
            </Card>
          )}
        </>
      )}
    </div>
  );
};
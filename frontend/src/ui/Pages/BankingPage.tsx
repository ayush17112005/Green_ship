import { useState, useEffect } from 'react';
import { Card, LoadingSpinner } from '../components';
import { BankingApiClient } from '../../adapters/infrastructure/api/clients';
import type { BankingHistory } from '../../core/domain';
import { Wallet, Plus, Minus, History } from 'lucide-react';
import { format } from 'date-fns';
import { getErrorMessage } from '../../shared/utils';

type TabType = 'bank' | 'apply' | 'history';

export const BankingPage = () => {
  const [activeTab, setActiveTab] = useState<TabType>('bank');
  const [history, setHistory] = useState<BankingHistory | null>(null);
  const [loading, setLoading] = useState(false);

  // Bank Surplus Form
  const [bankForm, setBankForm] = useState({
    shipId: 'SHIP001',
    year: 2025,
    amountTonnes: 100,
    description: '',
  });

  // Apply Banking Form
  const [applyForm, setApplyForm] = useState({
    shipId: 'SHIP001',
    year: 2026,
    amountTonnes: 50,
    sourceYear: 2025,
    description: '',
  });

  // History Filter
  const [historyShipId, setHistoryShipId] = useState('SHIP001');

  const handleBankSurplus = async () => {
    setLoading(true);
    try {
      const response = await BankingApiClient.bankSurplus(bankForm);
      alert(`✅ ${response.data.message}`);
      setBankForm({ ...bankForm, amountTonnes: 100, description: '' });
      
      // Refresh history if on that tab
      if (activeTab === 'history') {
        loadHistory();
      }
    } catch (error) {
      alert(`❌ ${getErrorMessage(error)}`);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyBanking = async () => {
    setLoading(true);
    try {
      const response = await BankingApiClient.applyBanking(applyForm);
      alert(`✅ ${response.data.message}`);
      setApplyForm({ ...applyForm, amountTonnes: 50, description: '' });
      
      // Refresh history if on that tab
      if (activeTab === 'history') {
        loadHistory();
      }
    } catch (error) {
      alert(`❌ ${getErrorMessage(error)}`);
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async () => {
    setLoading(true);
    try {
      const response = await BankingApiClient.getHistory(historyShipId);
      setHistory(response.data);
    } catch (error) {
      console.error('Error loading history:', error);
      alert(`❌ ${getErrorMessage(error)}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'history') {
      loadHistory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, historyShipId]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Banking System</h1>
        <p className="mt-2 text-gray-600">Manage surplus credits and apply banked amounts</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('bank')}
          className={`px-4 py-2 font-medium transition-colors border-b-2 ${
            activeTab === 'bank'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Plus className="inline h-4 w-4 mr-2" />
          Bank Surplus
        </button>
        <button
          onClick={() => setActiveTab('apply')}
          className={`px-4 py-2 font-medium transition-colors border-b-2 ${
            activeTab === 'apply'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Minus className="inline h-4 w-4 mr-2" />
          Apply Banking
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 font-medium transition-colors border-b-2 ${
            activeTab === 'history'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <History className="inline h-4 w-4 mr-2" />
          History
        </button>
      </div>

      {/* Bank Surplus Tab */}
      {activeTab === 'bank' && (
        <Card title="Bank Surplus Credits">
          <p className="text-sm text-gray-600 mb-6">
            Save your surplus compliance balance for future use. Banked credits can be used in future years to offset deficits.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="label">Ship ID</label>
              <input
                type="text"
                value={bankForm.shipId}
                onChange={(e) => setBankForm({ ...bankForm, shipId: e.target.value })}
                className="input"
                placeholder="SHIP001"
              />
            </div>
            <div>
              <label className="label">Year</label>
              <select
                value={bankForm.year}
                onChange={(e) => setBankForm({ ...bankForm, year: Number(e.target.value) })}
                className="input"
              >
                {[2025, 2026, 2027, 2028, 2029, 2030].map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Amount (tonnes CO₂e)</label>
              <input
                type="number"
                value={bankForm.amountTonnes}
                onChange={(e) => setBankForm({ ...bankForm, amountTonnes: Number(e.target.value) })}
                className="input"
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label className="label">Description (Optional)</label>
              <input
                type="text"
                value={bankForm.description}
                onChange={(e) => setBankForm({ ...bankForm, description: e.target.value })}
                className="input"
                placeholder="e.g., Surplus from LNG usage"
              />
            </div>
          </div>
          <button
            onClick={handleBankSurplus}
            disabled={loading || !bankForm.shipId || bankForm.amountTonnes <= 0}
            className="btn-success"
          >
            <Wallet className="inline h-4 w-4 mr-2" />
            {loading ? 'Banking...' : 'Bank Surplus Credits'}
          </button>
        </Card>
      )}

      {/* Apply Banking Tab */}
      {activeTab === 'apply' && (
        <Card title="Apply Banked Credits">
          <p className="text-sm text-gray-600 mb-6">
            Use previously banked credits to offset your current deficit. Make sure you have sufficient banked balance.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="label">Ship ID</label>
              <input
                type="text"
                value={applyForm.shipId}
                onChange={(e) => setApplyForm({ ...applyForm, shipId: e.target.value })}
                className="input"
                placeholder="SHIP001"
              />
            </div>
            <div>
              <label className="label">Year (Apply To)</label>
              <select
                value={applyForm.year}
                onChange={(e) => setApplyForm({ ...applyForm, year: Number(e.target.value) })}
                className="input"
              >
                {[2025, 2026, 2027, 2028, 2029, 2030].map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Amount (tonnes CO₂e)</label>
              <input
                type="number"
                value={applyForm.amountTonnes}
                onChange={(e) => setApplyForm({ ...applyForm, amountTonnes: Number(e.target.value) })}
                className="input"
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label className="label">Source Year</label>
              <select
                value={applyForm.sourceYear}
                onChange={(e) => setApplyForm({ ...applyForm, sourceYear: Number(e.target.value) })}
                className="input"
              >
                {[2025, 2026, 2027, 2028, 2029, 2030]
                  .filter(y => y < applyForm.year)
                  .map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="label">Description (Optional)</label>
              <input
                type="text"
                value={applyForm.description}
                onChange={(e) => setApplyForm({ ...applyForm, description: e.target.value })}
                className="input"
                placeholder="e.g., Using 2025 surplus for 2026 deficit"
              />
            </div>
          </div>
          <button
            onClick={handleApplyBanking}
            disabled={loading || !applyForm.shipId || applyForm.amountTonnes <= 0}
            className="btn-primary"
          >
            <Minus className="inline h-4 w-4 mr-2" />
            {loading ? 'Applying...' : 'Apply Banked Credits'}
          </button>
        </Card>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <Card title="Banking Transaction History">
          <div className="flex items-center gap-4 mb-6">
            <label className="label">Ship ID:</label>
            <input
              type="text"
              value={historyShipId}
              onChange={(e) => setHistoryShipId(e.target.value)}
              className="input w-48"
              placeholder="SHIP001"
            />
            <button onClick={loadHistory} className="btn-primary" disabled={loading}>
              {loading ? 'Loading...' : 'Load History'}
            </button>
          </div>

          {loading && <LoadingSpinner />}

          {!loading && history && (
            <>
              {/* Current Balance */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-600">Current Banked Balance</p>
                    <p className="text-3xl font-bold text-blue-600">
                      {history.currentBalanceTonnes.toFixed(2)} tonnes CO₂e
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {history.currentBalance.toLocaleString()} gCO₂e
                    </p>
                  </div>
                  <Wallet className="h-12 w-12 text-blue-400" />
                </div>
              </div>

              {/* Transactions */}
              <h3 className="font-semibold mb-4">
                Transaction History ({history.totalTransactions} transactions)
              </h3>

              {history.transactions.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No transactions found</p>
              ) : (
                <div className="space-y-3">
                  {history.transactions.map((tx, index) => (
                    <div
                      key={tx.id || index}
                      className={`border rounded-lg p-4 ${
                        tx.transactionType === 'BANK'
                          ? 'border-green-200 bg-green-50'
                          : 'border-blue-200 bg-blue-50'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span
                              className={`badge ${
                                tx.transactionType === 'BANK' ? 'badge-green' : 'badge-blue'
                              }`}
                            >
                              {tx.transactionType === 'BANK' ? '💰 BANK' : '📤 BORROW'}
                            </span>
                            <span className="text-sm text-gray-500">
                              {format(new Date(tx.transactionDate), 'MMM dd, yyyy HH:mm')}
                            </span>
                          </div>
                          <p className="text-sm font-medium">
                            Year: {tx.year}
                            {tx.sourceYear && ` (from ${tx.sourceYear})`}
                          </p>
                          {tx.description && (
                            <p className="text-sm text-gray-600 mt-1">{tx.description}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p
                            className={`text-lg font-bold ${
                              tx.transactionType === 'BANK' ? 'text-green-600' : 'text-blue-600'
                            }`}
                          >
                            {tx.transactionType === 'BANK' ? '+' : '-'}
                            {tx.amountTonnes.toFixed(2)} t
                          </p>
                          <p className="text-sm text-gray-500">
                            Balance: {tx.remainingBalanceTonnes.toFixed(2)} t
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </Card>
      )}
    </div>
  );
};
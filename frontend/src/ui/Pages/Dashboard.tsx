import { useEffect, useState } from 'react';
import { Card, LoadingSpinner } from '../components';
import { Ship, TrendingUp, Wallet, Users } from 'lucide-react';
import { RoutesApiClient, PoolingApiClient } from '../../adapters/infrastructure/api/clients';
import { getErrorMessage } from '../../shared/utils';

export const Dashboard = () => {
  const [stats, setStats] = useState({
    totalRoutes: 0,
    baselineRoute: '',
    totalPools: 0,
    compliantPools: 0,
    loading: true,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [routesRes, poolsRes] = await Promise.all([
        RoutesApiClient.getAll(),
        PoolingApiClient.getAll(),
      ]);

      const routes = routesRes.data.data;
      const baseline = routes.find((r: { isBaseline: boolean }) => r.isBaseline);

      setStats({
        totalRoutes: routesRes.data.count,
        baselineRoute: baseline?.routeId || 'None',
        totalPools: poolsRes.data.totalPools,
        compliantPools: poolsRes.data.compliantPools,
        loading: false,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
      alert(`❌ ${getErrorMessage(error)}`);
      setStats(prev => ({ ...prev, loading: false }));
    }
  };

  if (stats.loading) {
    return <LoadingSpinner />;
  }

  const statCards = [
    {
      title: 'Total Routes',
      value: stats.totalRoutes,
      icon: Ship,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
    },
    {
      title: 'Baseline Route',
      value: stats.baselineRoute,
      icon: TrendingUp,
      color: 'bg-green-500',
      textColor: 'text-green-600',
    },
    {
      title: 'Active Pools',
      value: stats.totalPools,
      icon: Users,
      color: 'bg-purple-500',
      textColor: 'text-purple-600',
    },
    {
      title: 'Compliant Pools',
      value: stats.compliantPools,
      icon: Wallet,
      color: 'bg-orange-500',
      textColor: 'text-orange-600',
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">FuelEU Maritime Compliance Overview</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <div className="flex items-center">
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Welcome Card */}
      <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
        <h2 className="text-2xl font-bold mb-2">Welcome to FuelEU Compliance System</h2>
        <p className="text-blue-100 mb-6">
          Manage your maritime emissions compliance, banking, and pooling agreements all in one place.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <h3 className="font-semibold mb-2">✅ Calculate Compliance</h3>
            <p className="text-sm text-blue-100">
              Check your GHG compliance balance against FuelEU targets (2025-2030)
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <h3 className="font-semibold mb-2">💰 Banking System</h3>
            <p className="text-sm text-blue-100">
              Save surplus credits or use banked credits for future compliance
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <h3 className="font-semibold mb-2">🤝 Pooling Agreements</h3>
            <p className="text-sm text-blue-100">
              Form pools with other ships to share compliance balance
            </p>
          </div>
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <a href="/routes" className="btn-primary text-center">
            Manage Routes
          </a>
          <a href="/compliance" className="btn-primary text-center">
            Calculate CB
          </a>
          <a href="/banking" className="btn-primary text-center">
            Banking
          </a>
          <a href="/pooling" className="btn-primary text-center">
            Create Pool
          </a>
        </div>
      </div>
    </div>
  );
};
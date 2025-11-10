import { Link, useLocation } from 'react-router-dom';
import { Ship, Calculator, Wallet, Users, LayoutDashboard } from 'lucide-react';

export const Navbar = () => {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;
  
  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/routes', label: 'Routes', icon: Ship },
    { path: '/compliance', label: 'Compliance', icon: Calculator },
    { path: '/banking', label: 'Banking', icon: Wallet },
    { path: '/pooling', label: 'Pooling', icon: Users },
  ];

  return (
    <nav className="bg-white shadow-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Ship className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">
                FuelEU Compliance
              </span>
            </div>
            
            {/* Navigation */}
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                      isActive(item.path)
                        ? 'border-blue-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
          
          {/* Right side */}
          <div className="flex items-center">
            <span className="text-sm text-gray-500">
              Maritime Compliance System
            </span>
          </div>
        </div>
      </div>
    </nav>
  );
};
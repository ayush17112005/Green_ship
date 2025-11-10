import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MainLayout } from './ui/layouts/MainLayout';
import { Dashboard } from './ui/Pages/Dashboard';
import { RoutesPage } from './ui/Pages/RoutesPage';
import { CompliancePage } from './ui/Pages/CompliancePage';
import { BankingPage } from './ui/Pages/BankingPage';
import { PoolingPage } from './ui/Pages/PoolingPage'; 
function App() {
  return (
    <Router>
      <MainLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/routes" element={<RoutesPage />} />
          <Route path="/compliance" element={<CompliancePage />} />
          <Route path="/banking" element={<BankingPage />} />
          <Route path="/pooling" element={<PoolingPage />} />
        </Routes>
      </MainLayout>
    </Router>
  );
}

export default App;
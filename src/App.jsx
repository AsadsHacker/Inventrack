import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import UnitEntry from './pages/UnitEntry';
import CategoryEntry from './pages/CategoryEntry';
import SupplierEntry from './pages/SupplierEntry';
import ItemEntries from './pages/ItemEntries';
import LocationEntries from './pages/LocationEntries';
import StockIn from './pages/StockIn';
import StockOutPage from './pages/StockOut';
import StockTransferPage from './pages/StockTransfer';
import Reports from './pages/Reports';
import UserAccess from './pages/UserAccess';
import Login from './pages/Login';

function App() {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      localStorage.removeItem('user');
      return null;
    }
  });

  const handleLogin = (userData) => { setUser(userData); };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  if (!user) {
    return (
      <>
        <Toaster position="top-right" toastOptions={{ duration: 3000, style: { background: '#333', color: '#fff' } }} />
        <Login onLogin={handleLogin} />
      </>
    );
  }

  return (
    <Router>
      <Toaster position="top-right" toastOptions={{ duration: 3000, style: { background: '#333', color: '#fff' }, success: { iconTheme: { primary: '#16a34a', secondary: '#fff' } }, error: { iconTheme: { primary: '#dc2626', secondary: '#fff' } } }} />
      <Layout onLogout={handleLogout}>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/unit-entry" element={<UnitEntry />} />
          <Route path="/category-entry" element={<CategoryEntry />} />
          <Route path="/supplier-entry" element={<SupplierEntry />} />
          <Route path="/item-entries" element={<ItemEntries />} />
          <Route path="/location-entries" element={<LocationEntries />} />
          <Route path="/stock-in" element={<StockIn />} />
          <Route path="/stock-out" element={<StockOutPage />} />
          <Route path="/stock-transfer" element={<StockTransferPage />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/user-access" element={<UserAccess />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;

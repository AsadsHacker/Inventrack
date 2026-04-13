import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import UnitEntry from './pages/UnitEntry';
import ComingSoon from './pages/ComingSoon';

function App() {
  return (
    <Router>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#333',
            color: '#fff',
          },
          success: {
            iconTheme: {
              primary: '#16a34a',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#dc2626',
              secondary: '#fff',
            },
          },
        }}
      />
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/unit-entry" element={<UnitEntry />} />
          
          {/* Coming Soon Routes */}
          <Route path="/category" element={<ComingSoon />} />
          <Route path="/supplier" element={<ComingSoon />} />
          <Route path="/items" element={<ComingSoon />} />
          <Route path="/locations" element={<ComingSoon />} />
          <Route path="/stock-in" element={<ComingSoon />} />
          <Route path="/stock-out" element={<ComingSoon />} />
          <Route path="/stock-transfer" element={<ComingSoon />} />
          <Route path="/reports" element={<ComingSoon />} />
          <Route path="/users" element={<ComingSoon />} />
          
          {/* Catch all */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;

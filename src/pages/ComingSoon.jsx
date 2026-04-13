import { Construction } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const ComingSoon = () => {
  const location = useLocation();
  const pathName = location.pathname.split('/')[1] || 'Module';
  const displayTitle = pathName.charAt(0).toUpperCase() + pathName.slice(1).replace('-', ' ');

  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-140px)] animate-fade-in">
      <div className="bg-white p-12 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center max-w-md w-full text-center">
        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6">
          <Construction size={40} className="text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{displayTitle} Coming Soon</h2>
        <p className="text-gray-500 mb-8">This module is under development and will be available in a future update.</p>
        <Link 
          to="/dashboard" 
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-6 rounded-lg transition-colors shadow-sm"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default ComingSoon;

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import Layout from '@/components/Layout';

// Auth Pages
import Login from '@/pages/auth/Login';
import Signup from '@/pages/auth/Signup';
import ForgotPassword from '@/pages/auth/ForgotPassword';

// Main Pages
import Dashboard from '@/pages/Dashboard';
import Documents from '@/pages/Documents';
import PropertyDetails from '@/pages/PropertyDetails';
import IncomeEmployment from '@/pages/IncomeEmployment';
import AssetsLiabilities from '@/pages/AssetsLiabilities';
import ReviewSubmit from '@/pages/ReviewSubmit';
import Settings from '@/pages/Settings';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/documents" element={<Documents />} />
            <Route path="/property-details" element={<PropertyDetails />} />
            <Route path="/income-employment" element={<IncomeEmployment />} />
            <Route path="/assets-liabilities" element={<AssetsLiabilities />} />
            <Route path="/review-submit" element={<ReviewSubmit />} />
            <Route path="/settings" element={<Settings />} />
          </Route>

          {/* 404 Route */}
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
        <Toaster />
      </AuthProvider>
    </Router>
  );
}

export default App; 
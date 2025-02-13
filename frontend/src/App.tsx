import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import Layout from '@/components/Layout';

// Auth Pages
import Login from '@/pages/auth/Login';
import Signup from '@/pages/auth/Signup';
import ForgotPassword from '@/pages/auth/ForgotPassword';

// Main Pages
import { Dashboard } from '@/pages/Dashboard';
import Documents from '@/pages/Documents';
import PropertyDetails from '@/pages/PropertyDetails';
import IncomeEmployment from '@/pages/IncomeEmployment';
import AssetsLiabilities from '@/pages/AssetsLiabilities';
import ReviewSubmit from '@/pages/ReviewSubmit';
import Settings from '@/pages/Settings';
import InitialApplication from '@/pages/InitialApplication';
import ApplicationSubmitted from '@/pages/ApplicationSubmitted';
import MortgageApplication from '@/pages/MortgageApplication';
import Status from '@/pages/Status';
import NotFound from '@/pages/NotFound';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
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
              <Route path="/application/new" element={<InitialApplication />} />
              <Route path="/application/submitted" element={<ApplicationSubmitted />} />
              <Route path="/application/:id" element={<MortgageApplication />} />
              <Route path="/application/:id/status" element={<Status />} />
            </Route>

            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
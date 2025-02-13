import React from 'react';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  // For MVP, we don't protect any routes
  return <>{children}</>;
} 
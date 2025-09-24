import React from 'react';

interface AuthWrapperProps {
  children: React.ReactNode;
}

export const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
  // For now, just render children without any auth logic
  // This prevents navigation issues during mounting
  return <>{children}</>;
};


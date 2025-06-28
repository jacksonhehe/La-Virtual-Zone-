import  { createContext, useContext, ReactNode } from 'react';

interface AuthContextType {
  role: 'admin' | 'dt' | 'user';
  user: { username: string } | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const value: AuthContextType = {
    role: 'admin',
    user: { username: 'admin' }
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
 
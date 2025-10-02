import React from 'react';
import LoginForm from './components/LoginForm';
import Header from './components/Header';
import HomePage from './components/HomePage';
import Rules from './components/Rules';
import { AuthProvider, useAuth } from './context/AuthContext';

const AppContent = () => {
  const { token, role } = useAuth(); 

  return token ? <HomePage token={token} role={role} /> : <LoginForm onLogin={(token, role) => console.log("Logged in with role:", role)} />;
};

const App = () => (
  <>
    <Header />
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  </>
);

export default App;
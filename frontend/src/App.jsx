import React from "react";
import { AuthProvider } from "../context/AuthContext";
import LoginForm from "./components/LoginForm";

const App = () => {
  return (
    <>
      <AuthProvider>
        <LoginForm />
        {/* other components */}
      </AuthProvider>
    </>
  );
};

export default App;

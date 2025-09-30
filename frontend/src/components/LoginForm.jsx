import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const LoginForm = ({ onLogin }) => {
  const [userType, setUserType] = useState('student');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const { setToken } = useAuth();


  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    if (!userType || !username || !password) {
      setMessage({ type: 'error', text: 'Please fill in all fields' });
      return;
    }

    // Backend validation
    try {
      setSubmitting(true);

      console.log("modda gudu 1")

      const email = username   
      const baseUrl = import.meta?.env?.VITE_API_BASE_URL || 'http://localhost:3000';
      const response = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        // body: JSON.stringify({ userType, username, password })
        body: JSON.stringify({ email, password })
      });

      console.log("modda gudu 2")

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const errorText = data?.message || 'Login failed. Please try again.';
        setMessage({ type: 'error', text: errorText });
        return;
      }

      const isSuccess = data?.success ?? true; // assume success if backend returns 200 without explicit flag
      if (isSuccess) {
        const token = data.token
        setToken(token); 
      } else {
        setMessage({ type: 'error', text: data?.message || 'Invalid credentials' });
      }

      console.log("modda gudu 3")
    } catch (err) { 
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md border rounded-lg p-6 shadow-sm bg-white">
        <div className="text-center mb-4">
          <h2 className="text-2xl font-semibold">AI Interview Assistant</h2>
          <p className="text-gray-500">Please login to continue</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="userType" className="block text-sm font-medium">User Type</label>
            <select
              id="userType"
              className="w-full border rounded px-3 py-2"
              value={userType}
              onChange={(e) => setUserType(e.target.value)}
            >
              {/* update student later */}
              <option value="student">Student</option>      
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="username" className="block text-sm font-medium">Username</label>
            <input
              id="username"
              className="w-full border rounded px-3 py-2"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium">Password</label>
            <input
              id="password"
              type="password"
              className="w-full border rounded px-3 py-2"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
            />
          </div>

          {message && (
            <div className={message.type === 'error' ? 'text-red-600 text-sm' : 'text-green-600 text-sm'}>
              {message.text}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded disabled:opacity-50"
            disabled={submitting}
          >
            {submitting ? 'Logging in…' : 'Login'}
          </button>
        </form>

        {/* <div className="mt-6 p-4 bg-gray-50 rounded-lg text-sm">
          <p className="font-medium mb-2">Demo Credentials:</p>
          <div className="space-y-1 text-gray-600">
            <p><strong>Student:</strong> username: student, password: student123</p>
            <p><strong>Admin:</strong> username: admin, password: admin123</p>
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default LoginForm;
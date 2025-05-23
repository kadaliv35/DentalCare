import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ToothIcon } from '../components/common/Icons';

const LoginPage = () => {
  const { login, error, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    if (!email || !password) {
      setLoginError('Please enter both email and password');
      return;
    }

    try {
      await login(email, password);
    } catch (err) {
      setLoginError(error || 'Failed to log in');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-500 to-secondary-700 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-xl">
        <div className="flex flex-col items-center justify-center space-y-3 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-100">
            <ToothIcon className="h-8 w-8 text-primary-600" />
          </div>
          <h1 className="text-2xl font-bold text-neutral-900">Welcome to DentalCare</h1>
          <p className="text-sm text-neutral-500">Sign in to access your clinic dashboard</p>
        </div>

        {(loginError || error) && (
          <div className="mt-4 rounded-md bg-error-50 p-3 text-sm text-error-800">
            {loginError || error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-neutral-700">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input mt-1 block w-full"
              placeholder="name@dentalcare.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-neutral-700">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input mt-1 block w-full"
              placeholder="••••••••"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-neutral-700">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <a href="#" className="font-medium text-primary-600 hover:text-primary-500">
                Forgot your password?
              </a>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full transition-all duration-200"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>

          <div className="mt-4 text-center text-sm">
            <p className="text-neutral-500">
              Demo accounts:
            </p>
            <div className="mt-1 grid grid-cols-3 gap-2 text-xs">
              <div className="rounded-md border border-neutral-200 p-2">
                <p className="font-medium">Admin</p>
                <p>admin@example.com</p>
              </div>
              <div className="rounded-md border border-neutral-200 p-2">
                <p className="font-medium">Dentist</p>
                <p>dentist@example.com</p>
              </div>
              <div className="rounded-md border border-neutral-200 p-2">
                <p className="font-medium">Receptionist</p>
                <p>receptionist@example.com</p>
              </div>
            </div>
            <p className="mt-2 text-xs text-neutral-400">
              Password for all accounts: password123
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
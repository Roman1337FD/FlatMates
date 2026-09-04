import {
  useState
} from 'react';

import {
  Link,
  useNavigate
} from 'react-router-dom';

import api from '../api/axios';

function Login() {
  const navigate =
    useNavigate();

  const [identifier, setIdentifier] =
    useState('');

  const [password, setPassword] =
    useState('');

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState('');

  const handleSubmit =
    async (e) => {
      e.preventDefault();

      const cleanIdentifier =
        identifier.trim();

      if (
        !cleanIdentifier ||
        !password
      ) {
        setError(
          'Email/User ID and password are required'
        );
        return;
      }

      try {
        setLoading(true);
        setError('');

        const isEmail =
          cleanIdentifier.includes('@');

        const payload = isEmail
          ? {
              email:
                cleanIdentifier.toLowerCase(),
              password
            }
          : {
              userId:
                cleanIdentifier.toLowerCase(),
              password
            };

        const response =
          await api.post(
            '/auth/login',
            payload
          );

        const data =
          response.data;

        if (
          !data?.token ||
          !data?.user
        ) {
          throw new Error(
            'Invalid login response'
          );
        }

        localStorage.setItem(
          'token',
          data.token
        );

        localStorage.setItem(
          'userId',
          data.user.id
        );

        localStorage.setItem(
          'userName',
          data.user.name || ''
        );

        localStorage.setItem(
          'userEmail',
          data.user.email || ''
        );

        localStorage.setItem(
          'customUserId',
          data.user.userId || ''
        );

        window.dispatchEvent(
          new Event('auth-changed')
        );

        navigate(
          '/dashboard',
          {
            replace: true
          }
        );
      } catch (error) {
        console.error(
          'Login Error:',
          error
        );

        setError(
          error.response?.data?.message ||
          error.message ||
          'Login failed'
        );
      } finally {
        setLoading(false);
      }
    };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-indigo-50 flex items-center justify-center px-4 py-8 sm:py-10">

      <div className="w-full max-w-md">

        <div className="bg-white rounded-3xl shadow-sm border border-indigo-100 p-6 sm:p-8">

          <div className="text-center mb-8">

            <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-rose-100 to-indigo-100 border border-indigo-100 flex items-center justify-center text-2xl mb-4">
              🏠
            </div>

            <h1 className="text-3xl font-extrabold text-slate-800">
              Welcome Back
            </h1>

            <p className="text-slate-500 mt-2 text-sm sm:text-base">
              Login to your FlatMate.GN account
            </p>

          </div>

          {error && (
            <div className="mb-5 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          <form
            onSubmit={
              handleSubmit
            }
            className="space-y-5"
          >

            <div>

              <label
                htmlFor="identifier"
                className="block text-sm font-semibold text-slate-700 mb-2"
              >
                Email or User ID
              </label>

              <input
                id="identifier"
                type="text"
                value={
                  identifier
                }
                onChange={(e) =>
                  setIdentifier(
                    e.target.value
                  )
                }
                placeholder="Enter email or User ID"
                autoComplete="username"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 text-slate-700 placeholder:text-slate-400 transition-colors"
              />

            </div>

            <div>

              <label
                htmlFor="password"
                className="block text-sm font-semibold text-slate-700 mb-2"
              >
                Password
              </label>

              <div className="relative">

                <input
                  id="password"
                  type={
                    showPassword
                      ? 'text'
                      : 'password'
                  }
                  value={
                    password
                  }
                  onChange={(e) =>
                    setPassword(
                      e.target.value
                    )
                  }
                  placeholder="Enter password"
                  autoComplete="current-password"
                  className="w-full px-4 py-3 pr-12 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 text-slate-700 placeholder:text-slate-400 transition-colors"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      (prev) =>
                        !prev
                    )
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg hover:bg-indigo-50 text-slate-500 hover:text-indigo-600 flex items-center justify-center transition-colors"
                  title={
                    showPassword
                      ? 'Hide password'
                      : 'Show password'
                  }
                >
                  {showPassword
                    ? '🙈'
                    : '👁️'}
                </button>

              </div>

            </div>

            <div className="flex justify-end">

              <Link
                to="/forgot-password"
                className="text-sm text-indigo-600 font-semibold hover:text-indigo-700 transition-colors"
              >
                Forgot Password?
              </Link>

            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-500 text-white py-3 rounded-xl font-semibold hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              {loading
                ? 'Logging in...'
                : 'Login'}
            </button>

          </form>

          <div className="relative my-7">

            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100"></div>
            </div>

            <div className="relative flex justify-center">
              <span className="bg-white px-3 text-xs text-slate-400">
                NEW TO FLATMATE.GN?
              </span>
            </div>

          </div>

          <div className="text-center">

            <p className="text-sm text-slate-500">

              Don't have an account?{' '}

              <Link
                to="/register"
                className="text-indigo-600 font-semibold hover:text-indigo-700 transition-colors"
              >
                Register
              </Link>

            </p>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Login;
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios.js';

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const email =
      formData.email.trim();

    const password =
      formData.password;

    if (!email || !password) {
      alert(
        'Please fill all fields'
      );
      return;
    }

    try {
      setLoading(true);

      const response =
        await api.post(
          '/auth/login',
          {
            email,
            password
          }
        );

      if (response.data.success) {
        const user =
          response.data.user;

        localStorage.setItem(
          'userId',
          user.id
        );

        localStorage.setItem(
          'userEmail',
          user.email
        );

        localStorage.setItem(
          'userName',
          user.name
        );

        localStorage.setItem(
          'token',
          response.data.token
        );

        window.dispatchEvent(
          new Event('auth-changed')
        );

        alert(
          'Login successful!'
        );

        navigate('/dashboard');
      }
    } catch (error) {
      console.error(
        'Login Error:',
        error
      );

      alert(
        error.response?.data?.message ||
        'Login failed. Please check your email and password.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-md">

        <h2 className="text-3xl font-bold text-center text-slate-800">
          Welcome Back
        </h2>

        <p className="text-center text-slate-500 mt-2 mb-6">
          Login to find your perfect flatmate
        </p>

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Email
            </label>

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              maxLength={100}
              autoComplete="email"
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Password
            </label>

            <div className="relative">
              <input
                type={
                  showPassword
                    ? 'text'
                    : 'password'
                }
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                maxLength={16}
                autoComplete="current-password"
                className="w-full px-4 py-3 pr-12 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                required
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    (prev) => !prev
                  )
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-800 text-lg"
                aria-label={
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

            <div className="text-right mt-2">
              <Link
                to="/forgot-password"
                className="text-sm text-indigo-600 font-semibold hover:underline"
              >
                Forgot Password?
              </Link>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
          >
            {loading
              ? 'Logging in...'
              : 'Login'}
          </button>

        </form>

        <p className="text-center text-sm text-slate-500 mt-6">
          Don't have an account?{' '}

          <Link
            to="/register"
            className="text-indigo-600 font-semibold hover:underline"
          >
            Create Account
          </Link>
        </p>

      </div>
    </div>
  );
}

export default Login;
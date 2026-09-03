import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';

function Dashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const userId =
      localStorage.getItem('userId');

    const token =
      localStorage.getItem('token');

    if (!userId || !token) {
      navigate('/login', {
        replace: true
      });
      return;
    }

    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError('');

        const response =
          await api.get(
            `/auth/profile/${encodeURIComponent(
              userId
            )}`
          );

        const profile =
          response.data?.user ||
          response.data;

        if (!profile) {
          throw new Error(
            'Profile not found'
          );
        }

        setUser(profile);

        localStorage.setItem(
          'userName',
          profile.name || ''
        );

        localStorage.setItem(
          'userEmail',
          profile.email || ''
        );
      } catch (error) {
        console.error(
          'Dashboard Profile Error:',
          error
        );

        if (
          error.response?.status ===
          401
        ) {
          localStorage.removeItem(
            'userId'
          );
          localStorage.removeItem(
            'userEmail'
          );
          localStorage.removeItem(
            'userName'
          );
          localStorage.removeItem(
            'token'
          );
          localStorage.removeItem(
            'userPreferences'
          );

          navigate('/login', {
            replace: true
          });

          return;
        }

        setError(
          error.response?.data?.message ||
          error.message ||
          'Failed to load dashboard.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 px-8 py-7 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-600 border-t-transparent mb-3"></div>

          <p className="text-slate-600 font-medium">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
          <div className="text-4xl mb-3">
            ⚠️
          </div>

          <h2 className="text-xl font-bold text-slate-800">
            Unable to load dashboard
          </h2>

          <p className="text-slate-500 mt-2">
            {error}
          </p>

          <button
            type="button"
            onClick={() =>
              window.location.reload()
            }
            className="mt-5 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-indigo-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

            <div>
              <p className="text-sm text-indigo-600 font-semibold">
                Welcome back 👋
              </p>

              <h1 className="text-3xl font-bold text-slate-800 mt-1">
                {user.name || 'User'}
              </h1>

              <p className="text-slate-500 mt-1">
                Find a compatible flatmate in Greater Noida.
              </p>
            </div>

            <Link
              to="/profile"
              className="inline-flex justify-center bg-slate-900 text-white px-5 py-3 rounded-xl font-semibold hover:bg-slate-800 transition"
            >
              View Profile
            </Link>

          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">

          <Link
            to="/listings"
            className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition"
          >
            <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center text-2xl mb-4">
              🔍
            </div>

            <h2 className="text-lg font-bold text-slate-800">
              Find Flatmates
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Discover users compatible with your lifestyle.
            </p>
          </Link>

          <Link
            to="/chat"
            className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-2xl mb-4">
              💬
            </div>

            <h2 className="text-lg font-bold text-slate-800">
              Messages
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Chat privately with your potential flatmates.
            </p>
          </Link>

          <Link
            to="/profile-setup"
            className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition"
          >
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-2xl mb-4">
              ⚙️
            </div>

            <h2 className="text-lg font-bold text-slate-800">
              Preferences
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Update your lifestyle and flatmate preferences.
            </p>
          </Link>

        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8">

          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xl font-bold text-slate-800">
                Your Preferences
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                These details are used for compatibility matching.
              </p>
            </div>

            <Link
              to="/profile-setup"
              className="text-sm text-indigo-600 font-semibold hover:underline"
            >
              Edit
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-xs text-slate-500 uppercase font-semibold">
                Area
              </p>

              <p className="font-semibold text-slate-800 mt-1">
                {user.targetArea ||
                  'Not set'}
              </p>
            </div>

            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-xs text-slate-500 uppercase font-semibold">
                Budget
              </p>

              <p className="font-semibold text-slate-800 mt-1">
                ₹{user.budgetMin ?? 0} - ₹
                {user.budgetMax ?? 0}
              </p>
            </div>

            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-xs text-slate-500 uppercase font-semibold">
                Sleep
              </p>

              <p className="font-semibold text-slate-800 mt-1">
                {user.sleepSchedule ||
                  'Not set'}
              </p>
            </div>

            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-xs text-slate-500 uppercase font-semibold">
                Food
              </p>

              <p className="font-semibold text-slate-800 mt-1">
                {user.foodPref ||
                  'Not set'}
              </p>
            </div>

            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-xs text-slate-500 uppercase font-semibold">
                Smoking
              </p>

              <p className="font-semibold text-slate-800 mt-1">
                {user.smoking ||
                  'Not set'}
              </p>
            </div>

            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-xs text-slate-500 uppercase font-semibold">
                Cleanliness
              </p>

              <p className="font-semibold text-slate-800 mt-1">
                {user.cleanliness ?? 0} / 5
              </p>
            </div>

          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">

            <Link
              to="/listings"
              className="flex-1 text-center bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition"
            >
              Find Compatible Flatmates
            </Link>

            <Link
              to="/chat"
              className="flex-1 text-center bg-slate-900 text-white py-3 rounded-xl font-semibold hover:bg-slate-800 transition"
            >
              Open Messages
            </Link>

          </div>

        </div>

      </div>
    </div>
  );
}

export default Dashboard;
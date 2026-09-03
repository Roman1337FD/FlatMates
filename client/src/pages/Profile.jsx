import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';

function Profile() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] =
    useState(true);
  const [error, setError] =
    useState('');

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
          'Failed to load profile:',
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
          'Failed to load profile'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="bg-white px-6 py-5 rounded-2xl shadow-sm border border-slate-200">
          <p className="text-slate-600 font-medium">
            Loading profile...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-100 py-10 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">

            <h2 className="text-xl font-bold text-slate-800">
              Unable to load profile
            </h2>

            <p className="text-slate-500 mt-2">
              {error}
            </p>

            <button
              type="button"
              onClick={() =>
                window.location.reload()
              }
              className="mt-5 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-indigo-700"
            >
              Try Again
            </button>

          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-100 py-10 px-4">
      <div className="max-w-3xl mx-auto">

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">

          <div className="bg-indigo-600 px-8 py-10 text-white">

            <div className="w-20 h-20 rounded-full bg-white text-indigo-600 flex items-center justify-center text-3xl font-bold mb-4">
              {(user.name || 'U')
                .charAt(0)
                .toUpperCase()}
            </div>

            <h1 className="text-3xl font-bold">
              {user.name || 'User'}
            </h1>

            <p className="text-indigo-100 mt-1">
              {user.email || 'No email'}
            </p>

            <div className="flex flex-wrap gap-2 mt-4">

              {user.gender && (
                <span className="bg-white/15 px-3 py-1 rounded-full text-sm">
                  {user.gender}
                </span>
              )}

              {user.profession && (
                <span className="bg-white/15 px-3 py-1 rounded-full text-sm">
                  {user.profession}
                </span>
              )}

            </div>
          </div>

          <div className="p-8">

            <h2 className="text-xl font-bold text-slate-800 mb-5">
              My Preferences
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <div className="bg-slate-50 p-4 rounded-xl">
                <p className="text-sm text-slate-500">
                  Target Area
                </p>

                <p className="font-semibold text-slate-800">
                  {user.targetArea ||
                    'Not set'}
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl">
                <p className="text-sm text-slate-500">
                  Budget
                </p>

                <p className="font-semibold text-slate-800">
                  ₹{user.budgetMin ?? 0} - ₹
                  {user.budgetMax ?? 0}
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl">
                <p className="text-sm text-slate-500">
                  Sleep Schedule
                </p>

                <p className="font-semibold text-slate-800">
                  {user.sleepSchedule ||
                    'Not set'}
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl">
                <p className="text-sm text-slate-500">
                  Food Preference
                </p>

                <p className="font-semibold text-slate-800">
                  {user.foodPref ||
                    'Not set'}
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl">
                <p className="text-sm text-slate-500">
                  Smoking
                </p>

                <p className="font-semibold text-slate-800">
                  {user.smoking ||
                    'Not set'}
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl">
                <p className="text-sm text-slate-500">
                  Cleanliness
                </p>

                <p className="font-semibold text-slate-800">
                  {user.cleanliness ?? 0} / 5
                </p>
              </div>

            </div>

            <div className="mt-6">

              <h2 className="text-xl font-bold text-slate-800 mb-3">
                About Me
              </h2>

              <div className="bg-slate-50 p-4 rounded-xl">

                <p className="text-slate-700 break-words">
                  {user.bio ||
                    'No bio added yet.'}
                </p>

              </div>

            </div>

            <div className="mt-6 flex flex-wrap gap-3">

              <Link
                to="/profile-setup"
                className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-indigo-700"
              >
                Edit Preferences
              </Link>

              <Link
                to="/listings"
                className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-slate-800"
              >
                Find Flatmates
              </Link>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

export default Profile;
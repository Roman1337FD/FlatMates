import {
  useEffect,
  useState
} from 'react';

import {
  useNavigate,
  useParams
} from 'react-router-dom';

import api from '../api/axios';

function PublicProfile() {
  const { userId } =
    useParams();

  const navigate = useNavigate();

  const [user, setUser] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  useEffect(() => {
    const token =
      localStorage.getItem('token');

    if (!token) {
      navigate('/login', {
        replace: true
      });

      return;
    }

    const fetchProfile =
      async () => {
        try {
          setLoading(true);
          setError('');

          const response =
            await api.get(
              `/auth/public-profile/${encodeURIComponent(
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
        } catch (error) {
          console.error(
            'Failed to load public profile:',
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

    if (userId) {
      fetchProfile();
    }
  }, [
    userId,
    navigate
  ]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-indigo-50 flex items-center justify-center px-4">

        <div className="bg-white rounded-2xl border border-indigo-100 shadow-sm px-7 py-6 text-center">

          <div className="w-10 h-10 mx-auto rounded-full border-4 border-indigo-200 border-t-indigo-500 animate-spin mb-4"></div>

          <p className="text-slate-700 font-semibold">
            Loading profile...
          </p>

          <p className="text-sm text-slate-400 mt-1">
            Please wait a moment.
          </p>

        </div>

      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-indigo-50 py-10 px-4">

        <div className="max-w-3xl mx-auto">

          <div className="bg-white rounded-2xl border border-rose-100 shadow-sm p-8 text-center">

            <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center text-2xl font-bold mb-4">
              !
            </div>

            <h2 className="text-xl font-bold text-slate-800">
              Unable to load profile
            </h2>

            <p className="text-slate-500 text-sm mt-2">
              {error}
            </p>

            <button
              type="button"
              onClick={() =>
                navigate(-1)
              }
              className="mt-5 bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-indigo-600 transition-colors"
            >
              Go Back
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
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-indigo-50 py-6 sm:py-8 px-4">

      <div className="max-w-4xl mx-auto">

        <div className="bg-white rounded-3xl border border-indigo-100 shadow-sm overflow-hidden">

          <div className="relative bg-gradient-to-r from-rose-200 via-pink-200 to-indigo-300 px-6 sm:px-8 py-9 sm:py-10">

            <div className="absolute inset-0 bg-white/10"></div>

            <div className="relative flex flex-col items-center text-center">

              {user.profileImage ? (
                <img
                  src={
                    user.profileImage
                  }
                  alt={`${user.name || 'User'} profile`}
                  className="w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-white shadow-md"
                />
              ) : (
                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-white text-indigo-500 flex items-center justify-center text-5xl font-bold border-4 border-white shadow-md">
                  {(user.name || 'U')
                    .charAt(0)
                    .toUpperCase()}
                </div>
              )}

              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800 mt-5">
                {user.name ||
                  'User'}
              </h1>

              {user.profession && (
                <p className="text-slate-600 mt-1 font-medium">
                  {user.profession}
                </p>
              )}

              {user.userId && (
                <div className="mt-3 inline-flex items-center gap-2 bg-white/70 border border-white/80 px-3 py-1.5 rounded-full text-sm">
                  <span className="text-slate-500">
                    User ID
                  </span>

                  <span className="font-semibold text-slate-700">
                    @{user.userId}
                  </span>
                </div>
              )}

              <div className="flex flex-wrap justify-center gap-2 mt-4">

                {user.gender && (
                  <span className="bg-white/70 border border-white/80 text-slate-700 px-3 py-1.5 rounded-full text-sm font-medium">
                    {user.gender}
                  </span>
                )}

                {user.targetArea && (
                  <span className="bg-white/70 border border-white/80 text-slate-700 px-3 py-1.5 rounded-full text-sm font-medium">
                    {user.targetArea}
                  </span>
                )}

              </div>

            </div>

          </div>

          <div className="p-5 sm:p-8">

            <div className="flex items-center justify-between gap-3 mb-5">

              <div>

                <h2 className="text-xl sm:text-2xl font-bold text-slate-800">
                  Lifestyle & Preferences
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  A quick look at their flatmate preferences.
                </p>

              </div>

            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              <div className="bg-rose-50/70 border border-rose-100 p-4 rounded-2xl">

                <p className="text-sm text-slate-500">
                  Target Area
                </p>

                <p className="font-bold text-slate-800 mt-1">
                  {user.targetArea ||
                    'Not set'}
                </p>

              </div>

              <div className="bg-indigo-50/70 border border-indigo-100 p-4 rounded-2xl">

                <p className="text-sm text-slate-500">
                  Budget
                </p>

                <p className="font-bold text-slate-800 mt-1">
                  ₹{user.budgetMin ?? 0}
                  {' - '}
                  ₹{user.budgetMax ?? 0}
                </p>

              </div>

              <div className="bg-pink-50/70 border border-pink-100 p-4 rounded-2xl">

                <p className="text-sm text-slate-500">
                  Sleep Schedule
                </p>

                <p className="font-bold text-slate-800 mt-1">
                  {user.sleepSchedule ||
                    'Not set'}
                </p>

              </div>

              <div className="bg-indigo-50/70 border border-indigo-100 p-4 rounded-2xl">

                <p className="text-sm text-slate-500">
                  Food Preference
                </p>

                <p className="font-bold text-slate-800 mt-1">
                  {user.foodPref ||
                    'Not set'}
                </p>

              </div>

              <div className="bg-rose-50/70 border border-rose-100 p-4 rounded-2xl">

                <p className="text-sm text-slate-500">
                  Smoking
                </p>

                <p className="font-bold text-slate-800 mt-1">
                  {user.smoking ||
                    'Not set'}
                </p>

              </div>

              <div className="bg-pink-50/70 border border-pink-100 p-4 rounded-2xl">

                <p className="text-sm text-slate-500">
                  Cleanliness
                </p>

                <p className="font-bold text-slate-800 mt-1">
                  {user.cleanliness ?? 0}
                  {' / 5'}
                </p>

              </div>

            </div>

            <div className="mt-7">

              <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-3">
                About Me
              </h2>

              <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl">

                <p className="text-slate-700 break-words leading-relaxed">
                  {user.bio ||
                    'No bio added yet.'}
                </p>

              </div>

            </div>

            <div className="mt-7 flex flex-col sm:flex-row gap-3">

              <button
                type="button"
                onClick={() =>
                  navigate(
                    `/chat/${user._id}`
                  )
                }
                className="flex-1 bg-indigo-500 text-white px-5 py-3 rounded-xl font-semibold hover:bg-indigo-600 transition-colors"
              >
                Connect & Chat
              </button>

              <button
                type="button"
                onClick={() =>
                  navigate(-1)
                }
                className="sm:w-32 bg-white border border-slate-200 text-slate-700 px-5 py-3 rounded-xl font-semibold hover:bg-slate-50 transition-colors"
              >
                Go Back
              </button>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default PublicProfile;
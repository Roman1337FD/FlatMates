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
      <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
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

            <div className="w-16 h-16 mx-auto rounded-full bg-red-100 text-red-600 flex items-center justify-center text-2xl mb-4">
              !
            </div>

            <h2 className="text-xl font-bold text-slate-800">
              Unable to load profile
            </h2>

            <p className="text-slate-500 mt-2">
              {error}
            </p>

            <button
              type="button"
              onClick={() =>
                navigate(-1)
              }
              className="mt-5 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-indigo-700"
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
    <div className="min-h-screen bg-slate-100 py-10 px-4">

      <div className="max-w-3xl mx-auto">

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">

          <div className="bg-indigo-600 px-8 py-10 text-white">

            <div className="flex flex-col items-center text-center">

              {user.profileImage ? (
                <img
                  src={
                    user.profileImage
                  }
                  alt={`${user.name || 'User'} profile`}
                  className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-lg"
                />
              ) : (
                <div className="w-28 h-28 rounded-full bg-white text-indigo-600 flex items-center justify-center text-5xl font-bold border-4 border-white shadow-lg">
                  {(user.name || 'U')
                    .charAt(0)
                    .toUpperCase()}
                </div>
              )}

              <h1 className="text-3xl font-bold mt-5">
                {user.name ||
                  'User'}
              </h1>

              {user.profession && (
                <p className="text-indigo-100 mt-1">
                  {user.profession}
                </p>
              )}

              <div className="flex flex-wrap justify-center gap-2 mt-4">

                {user.gender && (
                  <span className="bg-white/15 px-3 py-1 rounded-full text-sm">
                    {user.gender}
                  </span>
                )}

                {user.targetArea && (
                  <span className="bg-white/15 px-3 py-1 rounded-full text-sm">
                    {user.targetArea}
                  </span>
                )}

              </div>

            </div>

          </div>

          <div className="p-8">

            <h2 className="text-xl font-bold text-slate-800 mb-5">
              Lifestyle & Preferences
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
                  ₹{user.budgetMin ?? 0}
                  {' - '}
                  ₹{user.budgetMax ?? 0}
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
                  {user.cleanliness ?? 0}
                  {' / 5'}
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

              <button
                type="button"
                onClick={() =>
                  navigate(
                    `/chat/${user._id}`
                  )
                }
                className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-indigo-700"
              >
                Connect & Chat
              </button>

              <button
                type="button"
                onClick={() =>
                  navigate(-1)
                }
                className="bg-slate-200 text-slate-700 px-5 py-2.5 rounded-xl font-medium hover:bg-slate-300"
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
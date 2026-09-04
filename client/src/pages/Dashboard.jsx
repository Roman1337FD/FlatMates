import {
  useEffect,
  useState
} from 'react';

import {
  Link,
  useNavigate
} from 'react-router-dom';

import api from '../api/axios';

function Dashboard() {
  const navigate = useNavigate();

  const [user, setUser] =
    useState(null);

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

    const fetchProfile =
      async () => {
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

          if (profile.userId) {
            localStorage.setItem(
              'customUserId',
              profile.userId
            );
          }
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

            localStorage.removeItem(
              'customUserId'
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
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-indigo-50 flex items-center justify-center px-4">

        <div className="bg-white rounded-3xl border border-rose-100 shadow-sm px-8 py-7 text-center">

          <div className="w-10 h-10 mx-auto rounded-full border-4 border-indigo-400 border-t-transparent animate-spin mb-4"></div>

          <p className="text-slate-600 font-medium">
            Loading your FlatMate dashboard...
          </p>

        </div>

      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-indigo-50 flex items-center justify-center px-4">

        <div className="max-w-md w-full bg-white rounded-3xl border border-rose-100 shadow-sm p-8 text-center">

          <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center text-2xl mb-4">
            ⚠️
          </div>

          <h2 className="text-xl font-bold text-slate-800">
            Dashboard unavailable
          </h2>

          <p className="text-slate-500 mt-2">
            {error}
          </p>

          <button
            type="button"
            onClick={() =>
              window.location.reload()
            }
            className="mt-6 bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-indigo-600 transition"
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

  const profileImage =
    user.profileImage || '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-indigo-50 px-4 py-6 sm:py-8">

      <div className="max-w-6xl mx-auto">

        <section className="relative overflow-hidden rounded-[30px] bg-gradient-to-r from-rose-300 via-pink-300 to-indigo-400 shadow-lg border border-white text-slate-800 mb-7">

          <div className="absolute -right-16 -top-20 w-52 h-52 rounded-full border border-white/40"></div>

          <div className="absolute right-20 -bottom-20 w-44 h-44 rounded-full border border-white/30"></div>

          <div className="absolute -left-20 bottom-0 w-44 h-44 rounded-full bg-white/15"></div>

          <div className="relative p-6 sm:p-8 lg:p-9">

            <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-8 items-center">

              <div className="flex items-center gap-4 sm:gap-5 min-w-0">

                {profileImage ? (
                  <img
                    src={profileImage}
                    alt={`${user.name || 'User'} profile`}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl object-cover border-4 border-white shadow-lg flex-shrink-0"
                  />
                ) : (
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-white text-indigo-500 flex items-center justify-center text-4xl sm:text-5xl font-extrabold border-4 border-white shadow-lg flex-shrink-0">
                    {(user.name || 'U')
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                )}

                <div className="min-w-0">

                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/40 border border-white/50 text-xs font-semibold text-indigo-800 mb-2">

                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>

                    FlatMate.GN Member

                  </div>

                  <p className="text-indigo-900/80 text-sm font-medium">
                    Welcome back 👋
                  </p>

                  <h1 className="text-2xl sm:text-4xl font-extrabold mt-1 text-slate-800 truncate">
                    {user.name || 'User'}
                  </h1>

                  <p className="text-indigo-900/70 text-sm mt-1 truncate">
                    {user.email || 'No email'}
                  </p>

                  {user.userId && (
                    <p className="text-indigo-900/65 text-xs mt-2">
                      @{user.userId}
                    </p>
                  )}

                </div>

              </div>

              <div className="relative">

                <div className="rounded-3xl bg-white/45 border border-white/50 backdrop-blur-sm p-5 sm:p-6 shadow-sm">

                  <div className="flex items-center justify-between gap-4">

                    <div>

                      <p className="text-[11px] uppercase tracking-[0.18em] text-indigo-700/70 font-bold">
                        Smart Match
                      </p>

                      <h2 className="text-lg sm:text-xl font-extrabold text-slate-800 mt-1">
                        Find your best fit
                      </h2>

                    </div>

                    <div className="w-11 h-11 rounded-2xl bg-white/50 border border-white/60 flex items-center justify-center text-xl">
                      ✨
                    </div>

                  </div>

                  <p className="text-sm text-slate-700 leading-6 mt-4">
                    Find compatible flatmates using lifestyle, budget and location preferences.
                  </p>

                  <div className="flex flex-wrap gap-2 mt-5">

                    <span className="px-3 py-1.5 rounded-full bg-white/50 border border-white/60 text-xs font-semibold text-slate-700">
                      Lifestyle
                    </span>

                    <span className="px-3 py-1.5 rounded-full bg-white/50 border border-white/60 text-xs font-semibold text-slate-700">
                      Budget
                    </span>

                    <span className="px-3 py-1.5 rounded-full bg-white/50 border border-white/60 text-xs font-semibold text-slate-700">
                      Location
                    </span>

                  </div>

                  <p className="text-xs text-indigo-700/80 mt-5 font-semibold">
                    ✦ AI-powered compatibility matching
                  </p>

                </div>

              </div>

            </div>

          </div>

        </section>

        <section className="mb-7">

          <div className="mb-5">

            <p className="text-xs uppercase tracking-widest text-indigo-500 font-bold">
              Your FlatMate Journey
            </p>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 mt-1">
              Find. Match. Connect.
            </h2>

            <p className="text-slate-500 text-sm mt-2">
              Everything you need to find a compatible flatmate in Greater Noida.
            </p>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

            <Link
              to="/listings"
              className="group relative overflow-hidden bg-white rounded-2xl border border-indigo-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 p-6"
            >

              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-300 to-violet-300"></div>

              <div className="flex items-start justify-between">

                <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 text-2xl flex items-center justify-center shadow-sm">
                  🔍
                </div>

                <span className="text-indigo-400 text-xl group-hover:translate-x-1 transition-transform">
                  →
                </span>

              </div>

              <h3 className="text-xl font-bold text-slate-800 mt-5">
                Discover Flatmates
              </h3>

              <p className="text-sm text-slate-500 mt-2 leading-6">
                Explore people matched to your budget, area and lifestyle.
              </p>

              <p className="text-sm font-bold text-indigo-500 mt-5">
                Explore matches →
              </p>

            </Link>

            <Link
              to="/chat"
              className="group relative overflow-hidden bg-white rounded-2xl border border-rose-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 p-6"
            >

              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-300 to-pink-300"></div>

              <div className="flex items-start justify-between">

                <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-100 text-2xl flex items-center justify-center shadow-sm">
                  💬
                </div>

                <span className="text-rose-400 text-xl group-hover:translate-x-1 transition-transform">
                  →
                </span>

              </div>

              <h3 className="text-xl font-bold text-slate-800 mt-5">
                Connect & Chat
              </h3>

              <p className="text-sm text-slate-500 mt-2 leading-6">
                Start private conversations with your potential flatmates.
              </p>

              <p className="text-sm font-bold text-rose-500 mt-5">
                Open messages →
              </p>

            </Link>

            <Link
              to="/profile-setup"
              className="group relative overflow-hidden bg-white rounded-2xl border border-pink-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 p-6"
            >

              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-300 to-indigo-300"></div>

              <div className="flex items-start justify-between">

                <div className="w-14 h-14 rounded-2xl bg-pink-50 border border-pink-100 text-2xl flex items-center justify-center shadow-sm">
                  ⚙️
                </div>

                <span className="text-pink-400 text-xl group-hover:translate-x-1 transition-transform">
                  →
                </span>

              </div>

              <h3 className="text-xl font-bold text-slate-800 mt-5">
                Improve Your Match
              </h3>

              <p className="text-sm text-slate-500 mt-2 leading-6">
                Keep your lifestyle details updated for better compatibility.
              </p>

              <p className="text-sm font-bold text-pink-500 mt-5">
                Update preferences →
              </p>

            </Link>

          </div>

        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

            <div className="px-6 sm:px-7 py-6 border-b border-slate-200 bg-gradient-to-r from-white to-rose-50/40">

              <div className="flex items-start justify-between gap-4">

                <div>

                  <p className="text-xs uppercase tracking-widest text-indigo-500 font-bold">
                    Compatibility Profile
                  </p>

                  <h2 className="text-xl font-bold text-slate-800 mt-1">
                    Your Preferences
                  </h2>

                  <p className="text-sm text-slate-500 mt-1">
                    These details help us find better flatmate matches.
                  </p>

                </div>

                <Link
                  to="/profile-setup"
                  className="text-sm font-bold text-indigo-500 hover:text-rose-500 transition"
                >
                  Edit
                </Link>

              </div>

            </div>

            <div className="p-6 sm:p-7 grid grid-cols-1 sm:grid-cols-2 gap-4">

              <div className="rounded-2xl border border-indigo-100 bg-indigo-50/40 p-5">
                <p className="text-xs uppercase tracking-wider text-indigo-500 font-bold">
                  Target Area
                </p>

                <p className="text-slate-800 font-bold mt-2">
                  {user.targetArea ||
                    'Not set'}
                </p>
              </div>

              <div className="rounded-2xl border border-rose-100 bg-rose-50/40 p-5">
                <p className="text-xs uppercase tracking-wider text-rose-500 font-bold">
                  Monthly Budget
                </p>

                <p className="text-slate-800 font-bold mt-2">
                  ₹{user.budgetMin ?? 0}
                  {' - '}
                  ₹{user.budgetMax ?? 0}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-xs uppercase tracking-wider text-slate-400 font-bold">
                  Sleep Schedule
                </p>

                <p className="text-slate-800 font-bold mt-2">
                  {user.sleepSchedule ||
                    'Not set'}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-xs uppercase tracking-wider text-slate-400 font-bold">
                  Food Preference
                </p>

                <p className="text-slate-800 font-bold mt-2">
                  {user.foodPref ||
                    'Not set'}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-xs uppercase tracking-wider text-slate-400 font-bold">
                  Smoking
                </p>

                <p className="text-slate-800 font-bold mt-2">
                  {user.smoking ||
                    'Not set'}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-xs uppercase tracking-wider text-slate-400 font-bold">
                  Cleanliness
                </p>

                <p className="text-slate-800 font-bold mt-2">
                  {user.cleanliness ?? 0}
                  {' / 5'}
                </p>
              </div>

            </div>

          </div>

          <div className="relative overflow-hidden bg-gradient-to-br from-rose-300 via-pink-300 to-indigo-400 rounded-2xl border border-white shadow-lg p-6 sm:p-7 text-slate-800">

            <div className="absolute -right-12 -top-12 w-36 h-36 rounded-full border border-white/30"></div>

            <div className="relative">

              <div className="flex items-center gap-4">

                {profileImage ? (
                  <img
                    src={profileImage}
                    alt={`${user.name || 'User'} profile`}
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-sm"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-white/45 border border-white/50 flex items-center justify-center text-2xl font-bold text-indigo-600">
                    {(user.name || 'U')
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                )}

                <div className="min-w-0">

                  <p className="text-[11px] uppercase tracking-[0.18em] text-indigo-800/70 font-bold">
                    Your FlatMate Profile
                  </p>

                  <h2 className="text-xl font-extrabold mt-1 truncate text-slate-800">
                    {user.name || 'User'}
                  </h2>

                </div>

              </div>

              {user.profession && (
                <p className="text-slate-700 text-sm mt-3">
                  {user.profession}
                </p>
              )}

              <div className="mt-5 space-y-3">

                <div className="flex items-center justify-between gap-3 border-b border-white/30 pb-3">

                  <span className="text-sm text-slate-700/75">
                    User ID
                  </span>

                  <span className="text-sm font-semibold text-slate-800 break-all text-right">
                    {user.userId ||
                      'Not set'}
                  </span>

                </div>

                <div className="flex items-center justify-between gap-3 border-b border-white/30 pb-3">

                  <span className="text-sm text-slate-700/75">
                    Area
                  </span>

                  <span className="text-sm font-semibold text-slate-800 text-right">
                    {user.targetArea ||
                      'Not set'}
                  </span>

                </div>

                <div className="flex items-center justify-between gap-3">

                  <span className="text-sm text-slate-700/75">
                    Budget
                  </span>

                  <span className="text-sm font-semibold text-slate-800 text-right">
                    ₹{user.budgetMin ?? 0}
                    {' - '}
                    ₹{user.budgetMax ?? 0}
                  </span>

                </div>

              </div>

              <div className="mt-6 flex items-center gap-2 text-sm text-indigo-800 font-semibold">

                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>

                Profile ready for matching ✓

              </div>

              <Link
                to="/profile"
                className="inline-flex w-full justify-center mt-6 bg-white text-indigo-700 py-3 rounded-xl font-bold hover:bg-indigo-50 transition shadow-sm"
              >
                View Full Profile
              </Link>

            </div>

          </div>

        </section>

      </div>

    </div>
  );
}

export default Dashboard;
import { Link } from 'react-router-dom';

function Dashboard() {
  const name = localStorage.getItem('userName') || 'User';
  const email = localStorage.getItem('userEmail') || '';

  const savedPref = localStorage.getItem('userPreferences');
  const preferences = savedPref ? JSON.parse(savedPref) : {};

  return (
    <div className="min-h-screen bg-slate-50 py-6">
      <div className="max-w-6xl mx-auto">

        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-3xl p-7 md:p-10 text-white shadow-lg mb-7">
          <div className="flex flex-col md:flex-row justify-between gap-6">

            <div>
              <p className="text-indigo-100 text-sm font-medium mb-2">
                Welcome back 👋
              </p>

              <h1 className="text-3xl md:text-4xl font-bold">
                {name}
              </h1>

              <p className="text-indigo-100 mt-2">
                Find the right flatmate for your lifestyle.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-5 py-4 md:min-w-[220px]">
              <p className="text-xs text-indigo-100">
                Account
              </p>

              <p className="font-semibold mt-1 truncate">
                {email || 'Your account'}
              </p>

              <Link
                to="/profile"
                className="inline-block mt-3 text-sm font-medium bg-white text-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-50 transition"
              >
                View Profile
              </Link>
            </div>

          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-7">

          <Link
            to="/chat"
            className="group bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-indigo-200 transition"
          >
            <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center text-2xl mb-4">
              💬
            </div>

            <h2 className="font-bold text-slate-800 text-lg">
              Messages
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Open your conversations
            </p>

            <div className="text-indigo-600 text-sm font-semibold mt-4 group-hover:translate-x-1 transition">
              Open →
            </div>
          </Link>

          <Link
            to="/profile"
            className="group bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-indigo-200 transition"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-2xl mb-4">
              👤
            </div>

            <h2 className="font-bold text-slate-800 text-lg">
              My Profile
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              View your account details
            </p>

            <div className="text-indigo-600 text-sm font-semibold mt-4 group-hover:translate-x-1 transition">
              View →
            </div>
          </Link>

          <Link
            to="/profile-setup"
            className="group bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-indigo-200 transition"
          >
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-2xl mb-4">
              ⚙️
            </div>

            <h2 className="font-bold text-slate-800 text-lg">
              Preferences
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Manage your lifestyle choices
            </p>

            <div className="text-indigo-600 text-sm font-semibold mt-4 group-hover:translate-x-1 transition">
              Manage →
            </div>
          </Link>

          <Link
            to="/privacy"
            className="group bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-indigo-200 transition"
          >
            <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-2xl mb-4">
              🔒
            </div>

            <h2 className="font-bold text-slate-800 text-lg">
              Privacy
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Manage privacy and security
            </p>

            <div className="text-indigo-600 text-sm font-semibold mt-4 group-hover:translate-x-1 transition">
              Manage →
            </div>
          </Link>

        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">

            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  Your Preferences
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  These preferences help us find compatible flatmates.
                </p>
              </div>

              <Link
                to="/profile-setup"
                className="text-sm font-semibold text-indigo-600 hover:text-indigo-700"
              >
                Edit
              </Link>
            </div>

            {Object.keys(preferences).length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs text-slate-400">
                    Preferred Area
                  </p>
                  <p className="font-semibold text-slate-800 mt-1">
                    {preferences.targetArea || 'Not set'}
                  </p>
                </div>

                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs text-slate-400">
                    Budget
                  </p>
                  <p className="font-semibold text-slate-800 mt-1">
                    ₹{preferences.budgetMin || 0} - ₹{preferences.budgetMax || 0}
                  </p>
                </div>

                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs text-slate-400">
                    Sleep Schedule
                  </p>
                  <p className="font-semibold text-slate-800 mt-1">
                    {preferences.sleepSchedule || 'Not set'}
                  </p>
                </div>

                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs text-slate-400">
                    Food Preference
                  </p>
                  <p className="font-semibold text-slate-800 mt-1">
                    {preferences.foodPref || 'Not set'}
                  </p>
                </div>

                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs text-slate-400">
                    Smoking
                  </p>
                  <p className="font-semibold text-slate-800 mt-1">
                    {preferences.smoking || 'Not set'}
                  </p>
                </div>

                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs text-slate-400">
                    Cleanliness
                  </p>
                  <p className="font-semibold text-slate-800 mt-1">
                    {preferences.cleanliness || 'Not set'}
                  </p>
                </div>

              </div>
            ) : (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
                <p className="font-semibold text-amber-800">
                  Preferences not completed
                </p>

                <p className="text-sm text-amber-700 mt-1">
                  Complete your preferences to get better flatmate matches.
                </p>

                <Link
                  to="/profile-setup"
                  className="inline-block mt-4 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
                >
                  Complete Preferences
                </Link>
              </div>
            )}

          </div>

          <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-sm">

            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-2xl mb-5">
              ✨
            </div>

            <h2 className="text-2xl font-bold">
              Find your Flatmate
            </h2>

            <p className="text-slate-300 text-sm mt-2 leading-6">
              Discover people whose lifestyle, budget and preferences match yours.
            </p>

            <Link
              to="/listings"
              className="block text-center bg-white text-slate-900 font-semibold px-5 py-3 rounded-xl mt-6 hover:bg-slate-100 transition"
            >
              Find Flatmates
            </Link>

            <div className="border-t border-white/10 mt-6 pt-5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">
                  Matching
                </span>

                <span className="font-semibold text-emerald-400">
                  AI Powered
                </span>
              </div>

              <div className="flex items-center justify-between text-sm mt-3">
                <span className="text-slate-400">
                  Location
                </span>

                <span className="font-semibold">
                  Greater Noida
                </span>
              </div>
            </div>

          </div>

        </div>

        <div className="mt-6 bg-white border border-slate-200 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-slate-800">
              Keep your account secure 🔐
            </h3>

            <p className="text-sm text-slate-500 mt-1">
              Your profile and conversations are only available to your account.
            </p>
          </div>

          <Link
            to="/privacy"
            className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 whitespace-nowrap"
          >
            Privacy & Security →
          </Link>
        </div>

      </div>
    </div>
  );
}

export default Dashboard;
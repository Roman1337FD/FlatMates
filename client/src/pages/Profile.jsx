import { Link } from 'react-router-dom';

function Profile() {
  const name = localStorage.getItem('userName') || 'User';
  const email = localStorage.getItem('userEmail') || 'No email';
  const savedPref = localStorage.getItem('userPreferences');
  const preferences = savedPref ? JSON.parse(savedPref) : {};

  return (
    <div className="min-h-screen bg-slate-100 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">

          <div className="bg-indigo-600 px-8 py-10 text-white">
            <div className="w-20 h-20 rounded-full bg-white text-indigo-600 flex items-center justify-center text-3xl font-bold mb-4">
              {name.charAt(0).toUpperCase()}
            </div>

            <h1 className="text-3xl font-bold">{name}</h1>
            <p className="text-indigo-100 mt-1">{email}</p>
          </div>

          <div className="p-8">
            <h2 className="text-xl font-bold text-slate-800 mb-5">
              My Preferences
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <div className="bg-slate-50 p-4 rounded-xl">
                <p className="text-sm text-slate-500">Target Area</p>
                <p className="font-semibold text-slate-800">
                  {preferences.targetArea || 'Not set'}
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl">
                <p className="text-sm text-slate-500">Budget</p>
                <p className="font-semibold text-slate-800">
                  ₹{preferences.budgetMin || 0} - ₹{preferences.budgetMax || 0}
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl">
                <p className="text-sm text-slate-500">Sleep Schedule</p>
                <p className="font-semibold text-slate-800">
                  {preferences.sleepSchedule || 'Not set'}
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl">
                <p className="text-sm text-slate-500">Food Preference</p>
                <p className="font-semibold text-slate-800">
                  {preferences.foodPref || 'Not set'}
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl">
                <p className="text-sm text-slate-500">Smoking</p>
                <p className="font-semibold text-slate-800">
                  {preferences.smoking || 'Not set'}
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl">
                <p className="text-sm text-slate-500">Cleanliness</p>
                <p className="font-semibold text-slate-800">
                  {preferences.cleanliness || 'Not set'} / 5
                </p>
              </div>

            </div>

            <div className="mt-6 flex gap-3">
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
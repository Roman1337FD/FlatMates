import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-indigo-50 px-4 py-10 sm:py-14">

      <div className="max-w-5xl mx-auto">

        <div className="max-w-4xl mx-auto text-center">

          <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs sm:text-sm font-bold px-3.5 py-2 rounded-full uppercase tracking-wide">
            📍 Hyperlocal for Greater Noida
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-800 leading-tight mt-5">
            Find Your Ideal Flatmate with{' '}
            <span className="text-indigo-500">
              AI Precision
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-500 mt-5 max-w-3xl mx-auto leading-relaxed">
            Stop adjusting with incompatible roommates. Match based on lifestyle, budget, sleep schedules, and personal habits in Knowledge Park, Pari Chowk and nearby hubs.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">

            <Link
              to="/profile-setup"
              className="w-full sm:w-auto bg-indigo-500 text-white px-6 py-3 rounded-xl font-semibold shadow-sm hover:bg-indigo-600 transition-colors text-center"
            >
              Set Your Preferences
            </Link>

            <Link
              to="/listings"
              className="w-full sm:w-auto bg-white border border-indigo-100 text-slate-700 px-6 py-3 rounded-xl font-semibold hover:bg-indigo-50 transition-colors text-center"
            >
              Explore Listings
            </Link>

          </div>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-12">

          <div className="bg-white border border-rose-100 rounded-2xl p-6 shadow-sm">

            <div className="w-11 h-11 rounded-xl bg-rose-50 flex items-center justify-center text-xl mb-4">
              🎯
            </div>

            <h3 className="text-lg font-bold text-slate-800">
              Better Matches
            </h3>

            <p className="text-sm text-slate-500 mt-2 leading-relaxed">
              Compare lifestyle, budget and everyday habits to find people who fit naturally.
            </p>

          </div>

          <div className="bg-white border border-indigo-100 rounded-2xl p-6 shadow-sm">

            <div className="w-11 h-11 rounded-xl bg-indigo-50 flex items-center justify-center text-xl mb-4">
              🤝
            </div>

            <h3 className="text-lg font-bold text-slate-800">
              Connect Easily
            </h3>

            <p className="text-sm text-slate-500 mt-2 leading-relaxed">
              View profiles, connect with compatible flatmates and chat privately.
            </p>

          </div>

          <div className="bg-white border border-pink-100 rounded-2xl p-6 shadow-sm">

            <div className="w-11 h-11 rounded-xl bg-pink-50 flex items-center justify-center text-xl mb-4">
              🏠
            </div>

            <h3 className="text-lg font-bold text-slate-800">
              Made for Greater Noida
            </h3>

            <p className="text-sm text-slate-500 mt-2 leading-relaxed">
              Built for students and professionals looking for a suitable flatmate nearby.
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Home;
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 gap-6 max-w-3xl mx-auto">
      <span className="bg-indigo-100 text-indigo-700 text-sm font-semibold px-3 py-1 rounded-full">
        Hyperlocal for Greater Noida
      </span>
      
      <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 leading-tight">
        Find Your Ideal Flatmate with <span className="text-indigo-600">AI Precision</span>
      </h1>
      
      <p className="text-lg text-slate-600">
        Stop adjusting with incompatible roommates. Match based on lifestyle, budget, sleep schedules, and personal habits in Knowledge Park, Pari Chowk & nearby hubs.
      </p>

      <div className="flex items-center gap-4 mt-4">
        <Link 
          to="/profile-setup" 
          className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:bg-indigo-700 transition-all"
        >
          Set Your Preferences
        </Link>
        <Link 
          to="/listings" 
          className="bg-white border border-slate-300 text-slate-700 px-6 py-3 rounded-xl font-semibold hover:bg-slate-100 transition-all"
        >
          Explore Listings
        </Link>
      </div>
    </div>
  );
}

export default Home;
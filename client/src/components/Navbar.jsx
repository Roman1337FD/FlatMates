import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-indigo-600 tracking-tight">
          FlatMate<span className="text-slate-800">.GN</span>
        </Link>
        
        <div className="flex items-center gap-6 font-medium text-slate-600">
          <Link to="/" className="hover:text-indigo-600 transition-colors">
            Home
          </Link>
          <Link to="/listings" className="hover:text-indigo-600 transition-colors">
            Find Stay
          </Link>
          <Link 
            to="/profile-setup" 
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            My Preferences
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
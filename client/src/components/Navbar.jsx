import { Link, useNavigate } from 'react-router-dom';

function Navbar() {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem('userId');

  const handleLogout = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    localStorage.removeItem('token');
    localStorage.removeItem('userPreferences');

    alert('Logged out successfully!');
    navigate('/login');
  };

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link
          to="/"
          className="text-xl font-bold text-indigo-600 tracking-tight"
        >
          FlatMate<span className="text-slate-800">.GN</span>
        </Link>

        <div className="flex items-center gap-6 font-medium text-slate-600">
          <Link
            to="/"
            className="hover:text-indigo-600 transition-colors"
          >
            Home
          </Link>

          <Link
            to="/listings"
            className="hover:text-indigo-600 transition-colors"
          >
            Find Stay
          </Link>

          {isLoggedIn && (
            <>
              <Link
                to="/profile"
                className="hover:text-indigo-600 transition-colors"
              >
                My Profile
              </Link>

              <Link
                to="/profile-setup"
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                My Preferences
              </Link>

              <button
                onClick={handleLogout}
                className="bg-rose-600 text-white px-4 py-2 rounded-lg hover:bg-rose-700 transition-colors"
              >
                Logout
              </button>
            </>
          )}

          {!isLoggedIn && (
            <>
              <Link
                to="/login"
                className="hover:text-indigo-600 transition-colors"
              >
                Login
              </Link>

              <Link
                to="/register"
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
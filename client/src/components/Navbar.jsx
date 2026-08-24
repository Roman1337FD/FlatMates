import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem('userId')
  );

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  const checkLogin = () => {
    const currentUserId = localStorage.getItem('userId');

    setIsLoggedIn(!!currentUserId);

    return currentUserId;
  };

  const fetchNotifications = async () => {
    const currentUserId = localStorage.getItem('userId');

    if (!currentUserId) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    try {
      const response = await axios.get(
        `http://localhost:5000/api/notifications?userId=${currentUserId}`
      );

      const data = response.data || [];

      setNotifications(data);

      const unread = data.filter(
        (notification) => !notification.isRead
      ).length;

      setUnreadCount(unread);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  };

  useEffect(() => {
    const currentUserId = checkLogin();

    if (!currentUserId) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    fetchNotifications();

    const interval = setInterval(() => {
      fetchNotifications();
    }, 5000);

    return () => clearInterval(interval);
  }, [location.pathname]);

  useEffect(() => {
    const handleStorageChange = () => {
      checkLogin();
      fetchNotifications();
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleNotificationClick = async (notification) => {
    try {
      await axios.put(
        `http://localhost:5000/api/notifications/${notification._id}/read`
      );

      setNotifications((prev) =>
        prev.map((item) =>
          item._id === notification._id
            ? { ...item, isRead: true }
            : item
        )
      );

      setUnreadCount((prev) => Math.max(0, prev - 1));

      setShowNotifications(false);

      const senderId =
        typeof notification.senderId === 'object'
          ? notification.senderId._id
          : notification.senderId;

      navigate('/listings', {
        state: {
          openChatWith: senderId
        }
      });
    } catch (error) {
      console.error('Failed to open notification:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    localStorage.removeItem('token');

    setIsLoggedIn(false);
    setNotifications([]);
    setUnreadCount(0);
    setShowNotifications(false);

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

          {isLoggedIn ? (
            <>
              <div className="relative">

                <button
                  onClick={() =>
                    setShowNotifications(!showNotifications)
                  }
                  className="relative text-2xl hover:text-indigo-600 transition-colors"
                >
                  🔔

                  {unreadCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full min-w-[20px] h-5 px-1 flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-3 w-80 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden z-50">

                    <div className="px-4 py-3 border-b border-slate-200 font-semibold text-slate-800">
                      Notifications
                    </div>

                    <div className="max-h-80 overflow-y-auto">

                      {notifications.length === 0 ? (
                        <div className="p-5 text-center text-sm text-slate-400">
                          No notifications
                        </div>
                      ) : (
                        notifications.map((notification) => (
                          <button
                            key={notification._id}
                            onClick={() =>
                              handleNotificationClick(notification)
                            }
                            className={`w-full text-left px-4 py-3 border-b border-slate-100 hover:bg-slate-50 ${
                              !notification.isRead
                                ? 'bg-indigo-50'
                                : 'bg-white'
                            }`}
                          >
                            <div className="font-semibold text-sm text-slate-800">
                              {notification.senderId?.name || 'Flatmate'}
                            </div>

                            <div className="text-sm text-slate-600 mt-1">
                              {notification.message}
                            </div>

                            <div className="text-xs text-slate-400 mt-1">
                              {new Date(
                                notification.createdAt
                              ).toLocaleString()}
                            </div>
                          </button>
                        ))
                      )}

                    </div>
                  </div>
                )}

              </div>

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
          ) : (
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
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem('userId')
  );

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAccount, setShowAccount] = useState(false);

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
      console.error(
        'Failed to load notifications:',
        error
      );
    }
  };

  const clearChatNotifications = async (senderId) => {
    const currentUserId = localStorage.getItem('userId');

    if (!currentUserId || !senderId) {
      return;
    }

    try {
      await axios.put(
        'http://localhost:5000/api/notifications/chat/read',
        {
          userId: currentUserId,
          senderId
        }
      );

      setNotifications((prev) => {
        return prev.filter((notification) => {
          const notificationSenderId =
            typeof notification.senderId === 'object'
              ? notification.senderId?._id
              : notification.senderId;

          return (
            String(notificationSenderId) !==
            String(senderId)
          );
        });
      });

      await fetchNotifications();
    } catch (error) {
      console.error(
        'Failed to clear chat notifications:',
        error
      );
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
  }, [location.pathname]);

  useEffect(() => {
    const currentUserId = localStorage.getItem('userId');

    if (!currentUserId) {
      return;
    }

    const pathParts = location.pathname.split('/');

    if (
      pathParts[1] === 'chat' &&
      pathParts[2]
    ) {
      const chatUserId = pathParts[2];

      clearChatNotifications(chatUserId);
    }
  }, [location.pathname]);

  useEffect(() => {
    const currentUserId = localStorage.getItem('userId');

    if (!currentUserId) {
      return;
    }

    const socket = io('http://localhost:5000');

    socket.emit('join_user', currentUserId);

    socket.on(
      'new_notification',
      (notification) => {
        if (
          String(notification.receiverId) !==
          String(currentUserId)
        ) {
          return;
        }

        const senderId =
          typeof notification.senderId === 'object'
            ? notification.senderId?._id
            : notification.senderId;

        const pathParts = location.pathname.split('/');
        const currentChatUserId =
          pathParts[1] === 'chat'
            ? pathParts[2]
            : null;

        if (
          currentChatUserId &&
          String(currentChatUserId) ===
            String(senderId)
        ) {
          return;
        }

        setNotifications((prev) => {
          const exists = prev.some(
            (item) => {
              if (
                notification._id &&
                item._id
              ) {
                return (
                  String(item._id) ===
                  String(notification._id)
                );
              }

              return false;
            }
          );

          if (exists) {
            return prev;
          }

          return [
            {
              ...notification,
              isRead: false
            },
            ...prev
          ];
        });

        setUnreadCount((prev) => prev + 1);
      }
    );

    socket.on(
      'notifications_read',
      (data) => {
        if (
          String(data.userId) !==
          String(currentUserId)
        ) {
          return;
        }

        const senderId = data.senderId;

        setNotifications((prev) => {
          const remaining = prev.filter(
            (notification) => {
              const notificationSenderId =
                typeof notification.senderId === 'object'
                  ? notification.senderId?._id
                  : notification.senderId;

              return (
                String(notificationSenderId) !==
                String(senderId)
              );
            }
          );

          return remaining;
        });

        fetchNotifications();
      }
    );

    return () => {
      socket.off('new_notification');
      socket.off('notifications_read');
      socket.disconnect();
    };
  }, [location.pathname]);

  useEffect(() => {
    const handleStorageChange = () => {
      checkLogin();
      fetchNotifications();
    };

    window.addEventListener(
      'storage',
      handleStorageChange
    );

    return () => {
      window.removeEventListener(
        'storage',
        handleStorageChange
      );
    };
  }, []);

  const handleNotificationClick = async (
    notification
  ) => {
    try {
      const senderId =
        typeof notification.senderId === 'object'
          ? notification.senderId?._id
          : notification.senderId;

      setShowNotifications(false);

      if (senderId) {
        await clearChatNotifications(senderId);

        navigate(`/chat/${senderId}`);
      }
    } catch (error) {
      console.error(
        'Failed to open notification:',
        error
      );
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    localStorage.removeItem('token');
    localStorage.removeItem('userPreferences');

    setIsLoggedIn(false);
    setNotifications([]);
    setUnreadCount(0);
    setShowNotifications(false);
    setShowAccount(false);

    navigate('/login');
  };

  const closeMenus = () => {
    setShowNotifications(false);
    setShowAccount(false);
  };

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">

        <Link
          to="/"
          onClick={closeMenus}
          className="text-xl font-bold text-indigo-600 tracking-tight"
        >
          FlatMate<span className="text-slate-800">.GN</span>
        </Link>

        <div className="flex items-center gap-2 md:gap-5">

          <Link
            to="/"
            className="hidden md:block font-medium text-slate-600 hover:text-indigo-600 transition-colors"
          >
            Home
          </Link>

          <Link
            to="/listings"
            className="hidden md:block font-medium text-slate-600 hover:text-indigo-600 transition-colors"
          >
            Find Flatmates
          </Link>

          {isLoggedIn ? (
            <>
              <button
                type="button"
                onClick={() => {
                  setShowNotifications(
                    !showNotifications
                  );
                  setShowAccount(false);
                }}
                className="relative w-10 h-10 rounded-full flex items-center justify-center text-xl text-slate-600 hover:bg-slate-100 hover:text-indigo-600 transition"
                title="Notifications"
              >
                🔔

                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold rounded-full min-w-[19px] h-[19px] px-1 flex items-center justify-center border-2 border-white">
                    {unreadCount > 9
                      ? '9+'
                      : unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-16 md:right-20 top-14 w-[320px] bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden z-50">

                  <div className="px-4 py-3 border-b border-slate-200">
                    <h3 className="font-bold text-slate-800">
                      Notifications
                    </h3>

                    <p className="text-xs text-slate-400 mt-1">
                      Your latest activity
                    </p>
                  </div>

                  <div className="max-h-80 overflow-y-auto">

                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-sm text-slate-400">
                        No notifications
                      </div>
                    ) : (
                      notifications.map(
                        (notification) => (
                          <button
                            key={notification._id}
                            onClick={() =>
                              handleNotificationClick(
                                notification
                              )
                            }
                            className={`w-full text-left px-4 py-3 border-b border-slate-100 hover:bg-slate-50 transition ${
                              !notification.isRead
                                ? 'bg-indigo-50'
                                : 'bg-white'
                            }`}
                          >
                            <div className="flex items-start gap-3">

                              <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-sm">
                                💬
                              </div>

                              <div className="flex-1 min-w-0">

                                <div className="font-semibold text-sm text-slate-800">
                                  {notification
                                    .senderId?.name ||
                                    'Flatmate'}
                                </div>

                                <div className="text-sm text-slate-600 mt-1">
                                  {notification.message}
                                </div>

                                <div className="text-xs text-slate-400 mt-1">
                                  {new Date(
                                    notification.createdAt
                                  ).toLocaleString()}
                                </div>

                              </div>

                              {!notification.isRead && (
                                <span className="w-2 h-2 bg-indigo-600 rounded-full mt-2"></span>
                              )}

                            </div>
                          </button>
                        )
                      )
                    )}

                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  setShowAccount(false);
                  setShowNotifications(false);
                  navigate('/chat');
                }}
                className="relative w-10 h-10 rounded-full flex items-center justify-center text-xl text-slate-600 hover:bg-slate-100 hover:text-indigo-600 transition"
                title="Messages"
              >
                💬
              </button>

              <div className="relative">

                <button
                  type="button"
                  onClick={() => {
                    setShowAccount(!showAccount);
                    setShowNotifications(false);
                  }}
                  className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold hover:bg-indigo-200 transition"
                  title="Account"
                >
                  {(localStorage.getItem(
                    'userName'
                  ) || 'U')
                    .charAt(0)
                    .toUpperCase()}
                </button>

                {showAccount && (
                  <div className="absolute right-0 top-12 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden z-50">

                    <div className="px-4 py-4 bg-slate-50 border-b border-slate-200">

                      <div className="font-bold text-slate-800">
                        {localStorage.getItem(
                          'userName'
                        ) || 'User'}
                      </div>

                      <div className="text-xs text-slate-500 mt-1 truncate">
                        {localStorage.getItem(
                          'userEmail'
                        ) || ''}
                      </div>

                    </div>

                    <div className="p-2">

                      <Link
                        to="/profile"
                        onClick={closeMenus}
                        className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-100 transition"
                      >
                        👤
                        <span>My Profile</span>
                      </Link>

                      <Link
                        to="/dashboard"
                        onClick={closeMenus}
                        className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-100 transition"
                      >
                        🏠
                        <span>Dashboard</span>
                      </Link>

                      <Link
                        to="/profile-setup"
                        onClick={closeMenus}
                        className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-100 transition"
                      >
                        ⚙️
                        <span>Preferences</span>
                      </Link>

                      <button
                        type="button"
                        onClick={() => {
                          closeMenus();
                          navigate('/privacy');
                        }}
                        className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-100 transition"
                      >
                        🔒
                        <span>
                          Privacy & Security
                        </span>
                      </button>

                      <div className="border-t border-slate-100 my-2"></div>

                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 transition"
                      >
                        🚪
                        <span>Logout</span>
                      </button>

                    </div>
                  </div>
                )}

              </div>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="font-medium text-slate-600 hover:text-indigo-600 transition-colors"
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
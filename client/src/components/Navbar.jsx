import {
  useEffect,
  useRef,
  useState
} from 'react';

import {
  Link,
  useLocation,
  useNavigate
} from 'react-router-dom';

import { io } from 'socket.io-client';
import api from '../api/axios';

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [isLoggedIn, setIsLoggedIn] =
    useState(
      !!localStorage.getItem('token')
    );

  const [notifications, setNotifications] =
    useState([]);

  const [unreadCount, setUnreadCount] =
    useState(0);

  const [showNotifications, setShowNotifications] =
    useState(false);

  const notificationRef =
    useRef(null);

  const socketRef =
    useRef(null);

  const socketUrl =
    import.meta.env.VITE_SOCKET_URL ||
    'http://localhost:5000';

  useEffect(() => {
    const checkAuth = () => {
      setIsLoggedIn(
        !!localStorage.getItem('token')
      );
    };

    checkAuth();

    window.addEventListener(
      'storage',
      checkAuth
    );

    window.addEventListener(
      'auth-changed',
      checkAuth
    );

    return () => {
      window.removeEventListener(
        'storage',
        checkAuth
      );

      window.removeEventListener(
        'auth-changed',
        checkAuth
      );
    };
  }, []);

  useEffect(() => {
    if (!isLoggedIn) {
      setNotifications([]);
      setUnreadCount(0);
      setShowNotifications(false);

      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }

      return;
    }

    const token =
      localStorage.getItem('token');

    if (!token) {
      setIsLoggedIn(false);
      return;
    }

    const fetchNotifications =
      async () => {
        try {
          const [
            notificationsResponse,
            countResponse
          ] = await Promise.all([
            api.get('/notifications'),
            api.get(
              '/notifications/unread-count'
            )
          ]);

          const allNotifications =
            Array.isArray(
              notificationsResponse.data
            )
              ? notificationsResponse.data
              : [];

          const unreadNotifications =
            allNotifications.filter(
              (notification) =>
                notification &&
                notification.isRead === false
            );

          setNotifications(
            unreadNotifications
          );

          setUnreadCount(
            Number(
              countResponse.data?.count || 0
            )
          );
        } catch (error) {
          console.error(
            'Failed to load notifications:',
            error
          );
        }
      };

    fetchNotifications();

    const handleNotificationsUpdated =
      (event) => {
        const senderId =
          event.detail?.senderId;

        if (senderId) {
          setNotifications((prev) => {
            const remaining =
              prev.filter(
                (notification) => {
                  const notificationSenderId =
                    typeof notification.senderId ===
                    'object'
                      ? notification.senderId?._id
                      : notification.senderId;

                  return (
                    String(
                      notificationSenderId
                    ) !==
                    String(senderId)
                  );
                }
              );

            const removedCount =
              prev.length -
              remaining.length;

            if (removedCount > 0) {
              setUnreadCount(
                (count) =>
                  Math.max(
                    0,
                    count - removedCount
                  )
              );
            }

            return remaining;
          });
        } else {
          fetchNotifications();
        }
      };

    window.addEventListener(
      'notifications-updated',
      handleNotificationsUpdated
    );

    const socket = io(
      socketUrl,
      {
        auth: {
          token
        }
      }
    );

    socketRef.current = socket;

    socket.on(
      'connect',
      () => {
        console.log(
          'Navbar socket connected:',
          socket.id
        );
      }
    );

    socket.on(
      'connect_error',
      (error) => {
        console.error(
          'Navbar socket error:',
          error.message
        );
      }
    );

    socket.on(
      'new_notification',
      (notification) => {
        if (!notification) {
          return;
        }

        setNotifications((prev) => {
          const notificationSenderId =
            typeof notification.senderId ===
            'object'
              ? notification.senderId?._id
              : notification.senderId;

          const exists =
            prev.some(
              (item) =>
                String(item._id) ===
                  String(
                    notification._id
                  ) ||
                (
                  String(
                    typeof item.senderId ===
                    'object'
                      ? item.senderId?._id
                      : item.senderId
                  ) ===
                  String(
                    notificationSenderId
                  ) &&
                  item.message ===
                    notification.message &&
                  item.createdAt ===
                    notification.createdAt
                )
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
          ].slice(0, 30);
        });

        setUnreadCount(
          (prev) => prev + 1
        );
      }
    );

    socket.on(
      'notifications_read',
      (data) => {
        const senderId =
          data?.senderId;

        if (!senderId) {
          fetchNotifications();
          return;
        }

        setNotifications((prev) => {
          const remaining =
            prev.filter(
              (notification) => {
                const notificationSenderId =
                  typeof notification.senderId ===
                  'object'
                    ? notification.senderId?._id
                    : notification.senderId;

                return (
                  String(
                    notificationSenderId
                  ) !==
                  String(senderId)
                );
              }
            );

          const removedCount =
            prev.length -
            remaining.length;

          if (removedCount > 0) {
            setUnreadCount(
              (count) =>
                Math.max(
                  0,
                  count - removedCount
                )
            );
          }

          return remaining;
        });
      }
    );

    return () => {
      window.removeEventListener(
        'notifications-updated',
        handleNotificationsUpdated
      );

      socket.off('connect');
      socket.off('connect_error');
      socket.off('new_notification');
      socket.off('notifications_read');

      socket.disconnect();

      if (
        socketRef.current === socket
      ) {
        socketRef.current = null;
      }
    };
  }, [
    isLoggedIn,
    socketUrl
  ]);

  useEffect(() => {
    const handleOutsideClick =
      (event) => {
        if (
          notificationRef.current &&
          !notificationRef.current.contains(
            event.target
          )
        ) {
          setShowNotifications(false);
        }
      };

    document.addEventListener(
      'mousedown',
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        'mousedown',
        handleOutsideClick
      );
    };
  }, []);

  const markNotificationRead =
    async (
      notificationId
    ) => {
      try {
        await api.put(
          `/notifications/${encodeURIComponent(
            notificationId
          )}/read`
        );

        setNotifications((prev) =>
          prev.filter(
            (notification) =>
              String(
                notification._id
              ) !==
              String(
                notificationId
              )
          )
        );

        setUnreadCount(
          (prev) =>
            Math.max(0, prev - 1)
        );
      } catch (error) {
        console.error(
          'Failed to mark notification:',
          error
        );
      }
    };

  const markAllRead =
    async () => {
      try {
        await api.put(
          '/notifications/read-all'
        );

        setNotifications([]);
        setUnreadCount(0);
      } catch (error) {
        console.error(
          'Failed to mark all notifications:',
          error
        );
      }
    };

  const handleNotificationClick =
    async (
      notification
    ) => {
      if (!notification) {
        return;
      }

      if (
        !notification.isRead &&
        notification._id
      ) {
        await markNotificationRead(
          notification._id
        );
      }

      setShowNotifications(false);

      if (
        notification.senderId
      ) {
        const senderId =
          typeof notification.senderId ===
          'object'
            ? notification.senderId?._id
            : notification.senderId;

        if (senderId) {
          navigate(
            `/chat/${senderId}`
          );
        }
      }
    };

  const handleLogout = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    localStorage.removeItem('token');
    localStorage.removeItem('userPreferences');
    localStorage.removeItem('customUserId');

    setNotifications([]);
    setUnreadCount(0);
    setShowNotifications(false);
    setIsLoggedIn(false);

    window.dispatchEvent(
      new Event('auth-changed')
    );

    navigate('/login', {
      replace: true
    });
  };

  const isActive =
    (path) => {
      return location.pathname ===
        path;
    };

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="min-h-16 py-2 flex items-center justify-between gap-3">

          <Link
            to={
              isLoggedIn
                ? '/dashboard'
                : '/'
            }
            className="flex items-center gap-2 flex-shrink-0"
          >
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-sm">
              F
            </div>

            <span className="hidden sm:block text-xl font-extrabold tracking-tight text-slate-800">
              FlatMate
              <span className="text-indigo-600">
                .GN
              </span>
            </span>

          </Link>

          <div className="flex items-center gap-1.5 sm:gap-2">

            {isLoggedIn ? (
              <>

                <Link
                  to="/dashboard"
                  className={`hidden lg:block px-3 py-2 rounded-xl text-sm font-semibold transition ${
                    isActive('/dashboard')
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Dashboard
                </Link>

                <Link
                  to="/listings"
                  className={`hidden lg:block px-3 py-2 rounded-xl text-sm font-semibold transition ${
                    isActive('/listings')
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Find Flatmates
                </Link>

                <Link
                  to="/chat"
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition ${
                    location.pathname.startsWith(
                      '/chat'
                    )
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-base">
                    💬
                  </span>

                  <span className="hidden md:inline">
                    Messages
                  </span>
                </Link>

                <div
                  ref={notificationRef}
                  className="relative"
                >

                  <button
                    type="button"
                    onClick={() =>
                      setShowNotifications(
                        (prev) =>
                          !prev
                      )
                    }
                    className="relative w-10 h-10 rounded-xl hover:bg-slate-100 flex items-center justify-center text-lg transition"
                    aria-label="Notifications"
                  >
                    🔔

                    {unreadCount >
                      0 && (
                      <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-full bg-red-500 text-white text-[11px] font-bold flex items-center justify-center border-2 border-white">
                        {unreadCount >
                        99
                          ? '99+'
                          : unreadCount}
                      </span>
                    )}
                  </button>

                  {showNotifications && (
                    <div className="absolute right-0 mt-3 w-[min(92vw,380px)] bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden">

                      <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">

                        <div>
                          <h3 className="font-bold text-slate-800">
                            Notifications
                          </h3>

                          <p className="text-xs text-slate-400 mt-0.5">
                            Your latest updates
                          </p>
                        </div>

                        {unreadCount >
                          0 && (
                          <button
                            type="button"
                            onClick={
                              markAllRead
                            }
                            className="text-xs text-indigo-600 font-semibold hover:text-indigo-700"
                          >
                            Mark all read
                          </button>
                        )}

                      </div>

                      <div className="max-h-96 overflow-y-auto">

                        {notifications.length ===
                        0 ? (
                          <div className="p-8 text-center">

                            <div className="w-12 h-12 mx-auto rounded-full bg-indigo-50 flex items-center justify-center text-2xl mb-3">
                              🔔
                            </div>

                            <p className="text-sm font-semibold text-slate-700">
                              No notifications
                            </p>

                            <p className="text-xs text-slate-400 mt-1">
                              You're all caught up.
                            </p>

                          </div>
                        ) : (
                          notifications.map(
                            (
                              notification
                            ) => (
                              <button
                                key={
                                  notification._id ||
                                  `${notification.senderId}-${notification.createdAt}`
                                }
                                type="button"
                                onClick={() =>
                                  handleNotificationClick(
                                    notification
                                  )
                                }
                                className="w-full text-left px-4 py-3.5 border-b border-slate-100 hover:bg-slate-50 transition bg-indigo-50/40"
                              >

                                <div className="flex gap-3">

                                  <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center flex-shrink-0 font-bold">
                                    {(
                                      notification
                                        .senderId
                                        ?.name ||
                                      'F'
                                    )
                                      .charAt(
                                        0
                                      )
                                      .toUpperCase()}
                                  </div>

                                  <div className="flex-1 min-w-0">

                                    <p className="text-sm text-slate-700 break-words leading-5">
                                      {notification.message ||
                                        'You have a new notification.'}
                                    </p>

                                    <p className="text-xs text-slate-400 mt-1">
                                      {notification.createdAt
                                        ? new Date(
                                            notification.createdAt
                                          ).toLocaleString(
                                            [],
                                            {
                                              dateStyle:
                                                'short',
                                              timeStyle:
                                                'short'
                                            }
                                          )
                                        : ''}
                                    </p>

                                  </div>

                                  <span className="w-2 h-2 rounded-full bg-indigo-600 mt-2 flex-shrink-0"></span>

                                </div>

                              </button>
                            )
                          )
                        )}

                      </div>

                    </div>
                  )}

                </div>

                <Link
                  to="/profile"
                  className={`hidden md:block px-3 py-2 rounded-xl text-sm font-semibold transition ${
                    isActive('/profile')
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Profile
                </Link>

                <Link
                  to="/privacy"
                  className={`hidden sm:block px-3 py-2 rounded-xl text-sm font-semibold transition ${
                    isActive('/privacy')
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Privacy & Security
                </Link>

                <button
                  type="button"
                  onClick={
                    handleLogout
                  }
                  className="px-3 py-2 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 transition"
                >
                  Logout
                </button>

              </>
            ) : (
              <>

                <Link
                  to="/login"
                  className="px-3 sm:px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition"
                >
                  Login
                </Link>

                <Link
                  to="/register"
                  className="px-3 sm:px-4 py-2 rounded-xl text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm transition"
                >
                  Register
                </Link>

              </>
            )}

          </div>

        </div>

      </div>
    </nav>
  );
}

export default Navbar;
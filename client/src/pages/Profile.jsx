import {
  useEffect,
  useRef,
  useState
} from 'react';

import {
  Link,
  useNavigate
} from 'react-router-dom';

import api from '../api/axios';

function Profile() {
  const navigate = useNavigate();

  const fileInputRef =
    useRef(null);

  const cameraMenuRef =
    useRef(null);

  const [user, setUser] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  const [uploading, setUploading] =
    useState(false);

  const [selectedFile, setSelectedFile] =
    useState(null);

  const [previewUrl, setPreviewUrl] =
    useState('');

  const [copied, setCopied] =
    useState(false);

  const [editingUserId, setEditingUserId] =
    useState(false);

  const [newUserId, setNewUserId] =
    useState('');

  const [savingUserId, setSavingUserId] =
    useState(false);

  const [showCameraMenu, setShowCameraMenu] =
    useState(false);

  const API_ORIGIN =
    import.meta.env.VITE_SOCKET_URL ||
    'http://localhost:5000';

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

          setNewUserId(
            profile.userId || ''
          );

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
            'Failed to load profile:',
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
            'Failed to load profile'
          );
        } finally {
          setLoading(false);
        }
      };

    fetchProfile();
  }, [navigate]);

  useEffect(() => {
    const handleOutsideClick =
      (event) => {
        if (
          cameraMenuRef.current &&
          !cameraMenuRef.current.contains(
            event.target
          )
        ) {
          setShowCameraMenu(false);
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

  const handleCopyUserId =
    async () => {
      if (!user?.userId) {
        return;
      }

      try {
        await navigator.clipboard.writeText(
          user.userId
        );

        setCopied(true);

        setTimeout(() => {
          setCopied(false);
        }, 1500);
      } catch (error) {
        console.error(
          'Failed to copy user ID:',
          error
        );
      }
    };

  const handleSaveUserId =
    async () => {
      const cleanUserId =
        newUserId
          .trim()
          .toLowerCase();

      if (!cleanUserId) {
        setError(
          'User ID cannot be empty'
        );

        return;
      }

      if (
        cleanUserId.length < 4 ||
        cleanUserId.length > 30
      ) {
        setError(
          'User ID must be between 4 and 30 characters'
        );

        return;
      }

      if (
        !/^[a-z0-9_]+$/.test(
          cleanUserId
        )
      ) {
        setError(
          'User ID can contain only letters, numbers and underscore'
        );

        return;
      }

      try {
        setSavingUserId(true);
        setError('');

        const currentUserId =
          localStorage.getItem(
            'userId'
          );

        const response =
          await api.put(
            `/auth/profile/${encodeURIComponent(
              currentUserId
            )}`,
            {
              userId:
                cleanUserId
            }
          );

        const updatedProfile =
          response.data?.user ||
          response.data;

        setUser(
          updatedProfile || {
            ...user,
            userId:
              cleanUserId
          }
        );

        setNewUserId(
          cleanUserId
        );

        localStorage.setItem(
          'customUserId',
          cleanUserId
        );

        setEditingUserId(false);
      } catch (error) {
        console.error(
          'Failed to update User ID:',
          error
        );

        setError(
          error.response?.data?.message ||
          error.message ||
          'Failed to update User ID'
        );
      } finally {
        setSavingUserId(false);
      }
    };

  const handleFileSelect = (
    event
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif'
    ];

    if (
      !allowedTypes.includes(
        file.type
      )
    ) {
      setError(
        'Only JPG, PNG, WEBP and GIF images are allowed'
      );

      event.target.value = '';

      return;
    }

    if (
      file.size >
      5 * 1024 * 1024
    ) {
      setError(
        'Image must be 5MB or less'
      );

      event.target.value = '';

      return;
    }

    setError('');
    setSelectedFile(file);
    setShowCameraMenu(false);

    const preview =
      URL.createObjectURL(file);

    setPreviewUrl(preview);
  };

  const handleChoosePhoto =
    () => {
      setShowCameraMenu(false);
      fileInputRef.current?.click();
    };

  const handleUpload =
    async () => {
      if (!selectedFile) {
        return;
      }

      try {
        setUploading(true);
        setError('');

        const formData =
          new FormData();

        formData.append(
          'profileImage',
          selectedFile
        );

        const uploadResponse =
          await api.post(
            '/upload/profile-image',
            formData
          );

        const imageUrl =
          uploadResponse.data?.imageUrl;

        if (!imageUrl) {
          throw new Error(
            'Image upload failed'
          );
        }

        const fullImageUrl =
          `${API_ORIGIN}${imageUrl}`;

        const currentUserId =
          localStorage.getItem(
            'userId'
          );

        const profileResponse =
          await api.put(
            `/auth/profile/${encodeURIComponent(
              currentUserId
            )}`,
            {
              profileImage:
                fullImageUrl
            }
          );

        const updatedProfile =
          profileResponse.data?.user ||
          profileResponse.data;

        setUser(
          updatedProfile || {
            ...user,
            profileImage:
              fullImageUrl
          }
        );

        setSelectedFile(null);

        if (fileInputRef.current) {
          fileInputRef.current.value =
            '';
        }

        setPreviewUrl('');
      } catch (error) {
        console.error(
          'Profile image upload error:',
          error
        );

        setError(
          error.response?.data?.message ||
          error.message ||
          'Failed to upload profile image'
        );
      } finally {
        setUploading(false);
      }
    };

  const handleRemoveImage =
    async () => {
      try {
        setUploading(true);
        setError('');
        setShowCameraMenu(false);

        const currentUserId =
          localStorage.getItem(
            'userId'
          );

        const response =
          await api.put(
            `/auth/profile/${encodeURIComponent(
              currentUserId
            )}`,
            {
              profileImage: ''
            }
          );

        const updatedProfile =
          response.data?.user ||
          response.data;

        setUser(
          updatedProfile || {
            ...user,
            profileImage: ''
          }
        );

        setSelectedFile(null);
        setPreviewUrl('');

        if (fileInputRef.current) {
          fileInputRef.current.value =
            '';
        }
      } catch (error) {
        console.error(
          'Remove profile image error:',
          error
        );

        setError(
          error.response?.data?.message ||
          error.message ||
          'Failed to remove profile image'
        );
      } finally {
        setUploading(false);
      }
    };

  const preferences = [
    {
      label: 'Target Area',
      value:
        user?.targetArea ||
        'Not set'
    },
    {
      label: 'Budget',
      value: `₹${user?.budgetMin ?? 0} - ₹${user?.budgetMax ?? 0}`
    },
    {
      label: 'Sleep',
      value:
        user?.sleepSchedule ||
        'Not set'
    },
    {
      label: 'Food',
      value:
        user?.foodPref ||
        'Not set'
    },
    {
      label: 'Smoking',
      value:
        user?.smoking ||
        'Not set'
    },
    {
      label: 'Cleanliness',
      value: `${user?.cleanliness ?? 0} / 5`
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-indigo-50 flex items-center justify-center px-4">

        <div className="bg-white rounded-3xl border border-rose-100 shadow-sm px-8 py-7 text-center">

          <div className="w-10 h-10 mx-auto rounded-full border-4 border-indigo-300 border-t-transparent animate-spin mb-4"></div>

          <p className="text-slate-600 font-medium">
            Loading profile...
          </p>

        </div>

      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-indigo-50 flex items-center justify-center px-4">

        <div className="max-w-md w-full bg-white rounded-3xl border border-rose-100 shadow-sm p-8 text-center">

          <div className="text-3xl mb-3">
            ⚠️
          </div>

          <h2 className="text-xl font-bold text-slate-800">
            Unable to load profile
          </h2>

          <p className="text-slate-500 mt-2">
            {error}
          </p>

          <button
            type="button"
            onClick={() =>
              window.location.reload()
            }
            className="mt-5 bg-indigo-400 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-indigo-500 transition"
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

  const displayedImage =
    previewUrl ||
    user.profileImage ||
    '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-indigo-50 px-4 py-6 sm:py-8">

      <div className="max-w-5xl mx-auto">

        <div className="mb-6">

          <p className="text-xs uppercase tracking-widest text-indigo-500 font-bold">
            Account
          </p>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800 mt-1">
            My Profile
          </h1>

          <p className="text-slate-500 text-sm mt-1">
            Manage your profile and flatmate preferences.
          </p>

        </div>

        {error && (
          <div className="mb-5 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-2xl text-sm">
            {error}
          </div>
        )}

        <section className="relative overflow-visible rounded-3xl bg-gradient-to-r from-rose-200 via-pink-200 to-indigo-300 shadow-md border border-white mb-6">

          <div className="absolute -right-16 -top-16 w-44 h-44 rounded-full border border-white/50 pointer-events-none"></div>

          <div className="absolute -left-14 -bottom-20 w-40 h-40 rounded-full bg-white/20 pointer-events-none"></div>

          <div className="relative p-6 sm:p-8">

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-7">

              <div className="flex items-center gap-5 min-w-0">

                <div
                  ref={cameraMenuRef}
                  className="relative flex-shrink-0"
                >

                  {displayedImage ? (
                    <img
                      src={displayedImage}
                      alt="Profile"
                      className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl object-cover border-4 border-white shadow-lg"
                    />
                  ) : (
                    <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-white text-indigo-500 flex items-center justify-center text-5xl font-extrabold border-4 border-white shadow-lg">
                      {(user.name || 'U')
                        .charAt(0)
                        .toUpperCase()}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() =>
                      setShowCameraMenu(
                        (prev) => !prev
                      )
                    }
                    disabled={uploading}
                    className="absolute right-0 bottom-0 w-10 h-10 rounded-xl bg-white text-indigo-600 shadow-md flex items-center justify-center hover:bg-indigo-50 disabled:opacity-50 transition"
                    title="Profile photo options"
                  >
                    📷
                  </button>

                  {showCameraMenu && (
                    <div className="absolute left-0 top-[calc(100%+10px)] w-48 rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden z-[100]">

                      <button
                        type="button"
                        onClick={
                          handleChoosePhoto
                        }
                        className="w-full text-left px-4 py-3.5 text-sm font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition"
                      >
                        Change photo
                      </button>

                      {user.profileImage && (
                        <button
                          type="button"
                          onClick={
                            handleRemoveImage
                          }
                          className="w-full text-left px-4 py-3.5 text-sm font-semibold text-rose-600 hover:bg-rose-50 transition border-t border-slate-100"
                        >
                          Remove photo
                        </button>
                      )}

                    </div>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={
                      handleFileSelect
                    }
                    className="hidden"
                  />

                </div>

                <div className="min-w-0">

                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/55 border border-white/70 text-xs font-semibold text-indigo-700">

                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>

                    FlatMate.GN Member

                  </div>

                  <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-800 mt-3 truncate">
                    {user.name || 'User'}
                  </h2>

                  <p className="text-slate-700/75 text-sm mt-1 break-all">
                    {user.email || 'No email'}
                  </p>

                  {user.profession && (
                    <p className="text-indigo-700/70 text-sm mt-2">
                      {user.profession}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-2 mt-3">

                    {user.gender && (
                      <span className="px-3 py-1 rounded-full bg-white/50 border border-white/60 text-xs font-semibold text-slate-700">
                        {user.gender}
                      </span>
                    )}

                    {user.targetArea && (
                      <span className="px-3 py-1 rounded-full bg-white/50 border border-white/60 text-xs font-semibold text-slate-700">
                        {user.targetArea}
                      </span>
                    )}

                  </div>

                </div>

              </div>

              <div className="lg:w-60">

                <div className="rounded-2xl bg-white/50 border border-white/70 backdrop-blur-sm px-5 py-4 shadow-sm">

                  <p className="text-[11px] uppercase tracking-[0.18em] text-indigo-700/70 font-bold">
                    Your User ID
                  </p>

                  {!editingUserId ? (
                    <>
                      <p className="font-mono font-bold text-lg text-slate-800 mt-2 break-all">
                        @{user.userId ||
                          'not-set'}
                      </p>

                      <div className="flex items-center gap-4 mt-3">

                        <button
                          type="button"
                          onClick={
                            handleCopyUserId
                          }
                          className="text-xs font-semibold text-indigo-600 hover:text-rose-600"
                        >
                          {copied
                            ? 'Copied ✓'
                            : 'Copy ID'}
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setNewUserId(
                              user.userId ||
                                ''
                            );

                            setError('');

                            setEditingUserId(
                              true
                            );
                          }}
                          className="text-xs font-semibold text-slate-600 hover:text-indigo-600"
                        >
                          Edit ID
                        </button>

                      </div>
                    </>
                  ) : (
                    <div className="mt-3">

                      <input
                        type="text"
                        value={
                          newUserId
                        }
                        onChange={(e) =>
                          setNewUserId(
                            e.target.value
                              .toLowerCase()
                              .replace(
                                /[^a-z0-9_]/g,
                                ''
                              )
                          )
                        }
                        maxLength={30}
                        autoFocus
                        placeholder="Enter User ID"
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                      />

                      <div className="flex gap-2 mt-2">

                        <button
                          type="button"
                          onClick={
                            handleSaveUserId
                          }
                          disabled={
                            savingUserId
                          }
                          className="flex-1 bg-indigo-500 text-white px-3 py-2 rounded-lg text-xs font-bold hover:bg-indigo-600 disabled:opacity-50"
                        >
                          {savingUserId
                            ? 'Saving...'
                            : 'Save'}
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setNewUserId(
                              user.userId ||
                                ''
                            );

                            setEditingUserId(
                              false
                            );

                            setError('');
                          }}
                          disabled={
                            savingUserId
                          }
                          className="flex-1 bg-white/60 border border-white/70 text-slate-700 px-3 py-2 rounded-lg text-xs font-semibold hover:bg-white disabled:opacity-50"
                        >
                          Cancel
                        </button>

                      </div>

                    </div>
                  )}

                </div>

              </div>

            </div>

          </div>

        </section>

        {selectedFile && (
          <section className="bg-white rounded-2xl border border-indigo-100 shadow-sm p-4 sm:p-5 mb-6">

            <div className="flex flex-col sm:flex-row sm:items-center gap-4">

              <img
                src={previewUrl}
                alt="Selected profile"
                className="w-20 h-20 rounded-2xl object-cover border border-slate-200"
              />

              <div className="flex-1 min-w-0">

                <p className="text-xs uppercase tracking-wider text-indigo-500 font-bold">
                  New Profile Photo
                </p>

                <p className="text-sm font-semibold text-slate-800 mt-1 truncate">
                  {selectedFile.name}
                </p>

                <p className="text-xs text-slate-500 mt-1">
                  {(
                    selectedFile.size /
                    (1024 * 1024)
                  ).toFixed(2)}{' '}
                  MB
                </p>

              </div>

              <div className="flex gap-2">

                <button
                  type="button"
                  onClick={
                    handleUpload
                  }
                  disabled={uploading}
                  className="bg-indigo-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-600 disabled:opacity-50"
                >
                  {uploading
                    ? 'Uploading...'
                    : 'Save Photo'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedFile(
                      null
                    );

                    setPreviewUrl('');

                    if (
                      fileInputRef.current
                    ) {
                      fileInputRef.current.value =
                        '';
                    }
                  }}
                  disabled={uploading}
                  className="bg-slate-100 text-slate-700 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-200 disabled:opacity-50"
                >
                  Cancel
                </button>

              </div>

            </div>

          </section>
        )}

        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-6">

          <div className="px-5 sm:px-6 py-5 border-b border-slate-200 bg-gradient-to-r from-white to-rose-50/40">

            <div className="flex items-center justify-between gap-4">

              <div>

                <p className="text-xs uppercase tracking-widest text-indigo-500 font-bold">
                  Lifestyle
                </p>

                <h2 className="text-xl font-bold text-slate-800 mt-1">
                  My Preferences
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  These details help find compatible flatmates.
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

          <div className="p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

            {preferences.map(
              (item) => (
                <div
                  key={item.label}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-4 hover:bg-white hover:border-indigo-100 hover:shadow-sm transition"
                >

                  <p className="text-xs uppercase tracking-wider text-slate-400 font-bold">
                    {item.label}
                  </p>

                  <p className="text-slate-800 font-bold mt-2 break-words">
                    {item.value}
                  </p>

                </div>
              )
            )}

          </div>

        </section>

        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6">

          <p className="text-xs uppercase tracking-widest text-indigo-500 font-bold">
            About
          </p>

          <h2 className="text-xl font-bold text-slate-800 mt-1">
            About Me
          </h2>

          <p className="text-slate-600 leading-7 mt-4 break-words">
            {user.bio ||
              'No bio added yet.'}
          </p>

        </section>

        <div className="mt-6 flex flex-col sm:flex-row gap-3">

          <Link
            to="/profile-setup"
            className="flex-1 text-center bg-indigo-500 text-white py-3 rounded-xl font-bold hover:bg-indigo-600 transition"
          >
            Edit Preferences
          </Link>

          <Link
            to="/listings"
            className="flex-1 text-center bg-slate-800 text-white py-3 rounded-xl font-bold hover:bg-slate-900 transition"
          >
            Find Flatmates
          </Link>

        </div>

      </div>

    </div>
  );
}

export default Profile;
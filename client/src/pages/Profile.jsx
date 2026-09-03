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

  const fileInputRef = useRef(null);

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

    const fetchProfile = async () => {
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

        localStorage.setItem(
          'userName',
          profile.name || ''
        );

        localStorage.setItem(
          'userEmail',
          profile.email || ''
        );
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

  const handleFileSelect = (event) => {
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

    const preview =
      URL.createObjectURL(file);

    setPreviewUrl(preview);
  };

  const handleUpload = async () => {
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

      const userId =
        localStorage.getItem('userId');

      const profileResponse =
        await api.put(
          `/auth/profile/${encodeURIComponent(
            userId
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

      window.dispatchEvent(
        new Event('profile-updated')
      );
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

  const handleRemoveImage = async () => {
    try {
      setUploading(true);
      setError('');

      const userId =
        localStorage.getItem('userId');

      const response =
        await api.put(
          `/auth/profile/${encodeURIComponent(
            userId
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

      window.dispatchEvent(
        new Event('profile-updated')
      );
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

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="bg-white px-6 py-5 rounded-2xl shadow-sm border border-slate-200">
          <p className="text-slate-600 font-medium">
            Loading profile...
          </p>
        </div>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="min-h-screen bg-slate-100 py-10 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
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
              className="mt-5 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-indigo-700"
            >
              Try Again
            </button>
          </div>
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
    <div className="min-h-screen bg-slate-100 py-10 px-4">
      <div className="max-w-3xl mx-auto">

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">

          <div className="bg-indigo-600 px-8 py-10 text-white">

            <div className="relative w-24 h-24 mb-5">

              {displayedImage ? (
                <img
                  src={displayedImage}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-white text-indigo-600 flex items-center justify-center text-4xl font-bold border-4 border-white shadow-md">
                  {(user.name || 'U')
                    .charAt(0)
                    .toUpperCase()}
                </div>
              )}

              <button
                type="button"
                onClick={() =>
                  fileInputRef.current?.click()
                }
                disabled={uploading}
                className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-white text-indigo-600 flex items-center justify-center shadow-md hover:bg-slate-100 disabled:opacity-50"
                title="Change profile photo"
              >
                📷
              </button>

            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleFileSelect}
              className="hidden"
            />

            <h1 className="text-3xl font-bold">
              {user.name || 'User'}
            </h1>

            <p className="text-indigo-100 mt-1">
              {user.email || 'No email'}
            </p>

            <div className="flex flex-wrap gap-2 mt-4">

              {user.gender && (
                <span className="bg-white/15 px-3 py-1 rounded-full text-sm">
                  {user.gender}
                </span>
              )}

              {user.profession && (
                <span className="bg-white/15 px-3 py-1 rounded-full text-sm">
                  {user.profession}
                </span>
              )}

            </div>
          </div>

          <div className="p-8">

            {error && (
              <div className="mb-5 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            {selectedFile && (
              <div className="mb-6 bg-slate-50 border border-slate-200 rounded-xl p-4">

                <p className="text-sm font-medium text-slate-700 mb-3">
                  Selected image
                </p>

                <div className="flex items-center gap-4">

                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-20 h-20 rounded-xl object-cover"
                  />

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-800 truncate">
                      {selectedFile.name}
                    </p>

                    <p className="text-sm text-slate-500">
                      {(
                        selectedFile.size /
                        (1024 * 1024)
                      ).toFixed(2)}{' '}
                      MB
                    </p>
                  </div>

                </div>

                <div className="flex flex-wrap gap-3 mt-4">

                  <button
                    type="button"
                    onClick={handleUpload}
                    disabled={uploading}
                    className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {uploading
                      ? 'Uploading...'
                      : 'Upload Photo'}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFile(null);
                      setPreviewUrl('');

                      if (
                        fileInputRef.current
                      ) {
                        fileInputRef.current.value =
                          '';
                      }
                    }}
                    disabled={uploading}
                    className="bg-slate-200 text-slate-700 px-5 py-2.5 rounded-xl font-medium hover:bg-slate-300 disabled:opacity-50"
                  >
                    Cancel
                  </button>

                </div>
              </div>
            )}

            {user.profileImage &&
              !selectedFile && (
                <div className="mb-6">

                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    disabled={uploading}
                    className="text-red-600 text-sm font-medium hover:text-red-700 disabled:opacity-50"
                  >
                    {uploading
                      ? 'Removing...'
                      : 'Remove profile photo'}
                  </button>

                </div>
              )}

            <h2 className="text-xl font-bold text-slate-800 mb-5">
              My Preferences
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <div className="bg-slate-50 p-4 rounded-xl">
                <p className="text-sm text-slate-500">
                  Target Area
                </p>

                <p className="font-semibold text-slate-800">
                  {user.targetArea ||
                    'Not set'}
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl">
                <p className="text-sm text-slate-500">
                  Budget
                </p>

                <p className="font-semibold text-slate-800">
                  ₹{user.budgetMin ?? 0} - ₹
                  {user.budgetMax ?? 0}
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl">
                <p className="text-sm text-slate-500">
                  Sleep Schedule
                </p>

                <p className="font-semibold text-slate-800">
                  {user.sleepSchedule ||
                    'Not set'}
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl">
                <p className="text-sm text-slate-500">
                  Food Preference
                </p>

                <p className="font-semibold text-slate-800">
                  {user.foodPref ||
                    'Not set'}
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl">
                <p className="text-sm text-slate-500">
                  Smoking
                </p>

                <p className="font-semibold text-slate-800">
                  {user.smoking ||
                    'Not set'}
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl">
                <p className="text-sm text-slate-500">
                  Cleanliness
                </p>

                <p className="font-semibold text-slate-800">
                  {user.cleanliness ?? 0} / 5
                </p>
              </div>

            </div>

            <div className="mt-6">

              <h2 className="text-xl font-bold text-slate-800 mb-3">
                About Me
              </h2>

              <div className="bg-slate-50 p-4 rounded-xl">

                <p className="text-slate-700 break-words">
                  {user.bio ||
                    'No bio added yet.'}
                </p>

              </div>

            </div>

            <div className="mt-6 flex flex-wrap gap-3">

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
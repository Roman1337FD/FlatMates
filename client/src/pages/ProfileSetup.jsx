import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

function ProfileSetup() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const [formData, setFormData] = useState({
    name: '',
    gender: 'male',
    profession: 'student',
    targetArea: 'Knowledge Park II',
    budgetMin: 5000,
    budgetMax: 12000,
    sleepSchedule: 'night-owl',
    foodPref: 'veg',
    smoking: 'no',
    cleanliness: 4,
    bio: ''
  });

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
        setLoadingProfile(true);

        const response =
          await api.get(
            `/auth/profile/${encodeURIComponent(
              userId
            )}`
          );

        const user =
          response.data?.user ||
          response.data;

        if (!user) {
          throw new Error(
            'Profile not found'
          );
        }

        setFormData({
          name: user.name || '',
          gender:
            user.gender || 'male',
          profession:
            user.profession ||
            'student',
          targetArea:
            user.targetArea ||
            'Knowledge Park II',
          budgetMin:
            user.budgetMin ?? 5000,
          budgetMax:
            user.budgetMax ?? 12000,
          sleepSchedule:
            user.sleepSchedule ||
            'night-owl',
          foodPref:
            user.foodPref ||
            'veg',
          smoking:
            user.smoking ||
            'no',
          cleanliness:
            user.cleanliness ?? 4,
          bio:
            user.bio || ''
        });

        localStorage.setItem(
          'userName',
          user.name || ''
        );

        localStorage.setItem(
          'userEmail',
          user.email || ''
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

        alert(
          error.response?.data?.message ||
          error.message ||
          'Failed to load profile.'
        );
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]:
        e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const userId =
      localStorage.getItem('userId');

    const token =
      localStorage.getItem('token');

    if (!userId || !token) {
      alert('Please login first.');
      navigate('/login');
      return;
    }

    const name =
      formData.name.trim();

    const targetArea =
      formData.targetArea.trim();

    const profession =
      formData.profession.trim();

    const bio =
      formData.bio.trim();

    const minBudget =
      Number(formData.budgetMin);

    const maxBudget =
      Number(formData.budgetMax);

    const cleanliness =
      Number(formData.cleanliness);

    if (!name) {
      alert('Name is required');
      return;
    }

    if (name.length > 50) {
      alert(
        'Name must be 50 characters or less'
      );
      return;
    }

    if (!targetArea) {
      alert(
        'Preferred area is required'
      );
      return;
    }

    if (targetArea.length > 100) {
      alert(
        'Preferred area must be 100 characters or less'
      );
      return;
    }

    if (profession.length > 50) {
      alert(
        'Profession must be 50 characters or less'
      );
      return;
    }

    if (
      !Number.isFinite(minBudget) ||
      !Number.isFinite(maxBudget)
    ) {
      alert(
        'Budget must be valid numbers'
      );
      return;
    }

    if (
      minBudget < 0 ||
      maxBudget < 0
    ) {
      alert(
        'Budget cannot be negative'
      );
      return;
    }

    if (minBudget > maxBudget) {
      alert(
        'Minimum budget cannot exceed maximum budget'
      );
      return;
    }

    if (
      cleanliness < 1 ||
      cleanliness > 5
    ) {
      alert(
        'Cleanliness must be between 1 and 5'
      );
      return;
    }

    if (bio.length > 500) {
      alert(
        'About Me must be 500 characters or less'
      );
      return;
    }

    try {
      setLoading(true);

      const profileData = {
        name,
        gender:
          formData.gender,
        profession,
        targetArea,
        budgetMin:
          minBudget,
        budgetMax:
          maxBudget,
        sleepSchedule:
          formData.sleepSchedule,
        foodPref:
          formData.foodPref,
        smoking:
          formData.smoking,
        cleanliness,
        bio
      };

      const response =
        await api.put(
          `/auth/profile/${encodeURIComponent(
            userId
          )}`,
          profileData
        );

      const updatedUser =
        response.data?.user ||
        response.data;

      if (!updatedUser) {
        throw new Error(
          'Profile update failed'
        );
      }

      localStorage.setItem(
        'userName',
        updatedUser.name || ''
      );

      localStorage.setItem(
        'userEmail',
        updatedUser.email || ''
      );

      localStorage.setItem(
        'userPreferences',
        JSON.stringify(profileData)
      );

      alert(
        'Preferences saved successfully!'
      );

      navigate('/profile');
    } catch (error) {
      console.error(
        'Profile Update Error:',
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

      alert(
        error.response?.data?.message ||
        error.message ||
        'Failed to save preferences.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">

          <div className="mb-8">

            <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
              Set Up Your Preferences
            </h1>

            <p className="text-slate-500 mt-2">
              Tell us about your lifestyle so we can find compatible flatmates.
            </p>

          </div>

          {loadingProfile ? (
            <div className="py-12 text-center">

              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-600 border-t-transparent mb-3"></div>

              <p className="text-slate-600 font-medium">
                Loading your profile...
              </p>

            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="space-y-6"
            >

              <div>

                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  maxLength={50}
                  required
                  autoComplete="name"
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
                />

              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                <div>

                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Gender
                  </label>

                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
                  >

                    <option value="male">
                      Male
                    </option>

                    <option value="female">
                      Female
                    </option>

                    <option value="other">
                      Other
                    </option>

                  </select>

                </div>

                <div>

                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Profession
                  </label>

                  <select
                    name="profession"
                    value={formData.profession}
                    onChange={handleChange}
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
                  >

                    <option value="student">
                      Student
                    </option>

                    <option value="working">
                      Working Professional
                    </option>

                    <option value="business">
                      Business
                    </option>

                  </select>

                </div>

              </div>

              <div>

                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Preferred Area
                </label>

                <input
                  type="text"
                  name="targetArea"
                  value={formData.targetArea}
                  onChange={handleChange}
                  maxLength={100}
                  required
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
                />

              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                <div>

                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Minimum Budget
                  </label>

                  <input
                    type="number"
                    name="budgetMin"
                    value={formData.budgetMin}
                    onChange={handleChange}
                    min="0"
                    required
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
                  />

                </div>

                <div>

                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Maximum Budget
                  </label>

                  <input
                    type="number"
                    name="budgetMax"
                    value={formData.budgetMax}
                    onChange={handleChange}
                    min="0"
                    required
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
                  />

                </div>

              </div>

              <div>

                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Sleep Schedule
                </label>

                <select
                  name="sleepSchedule"
                  value={formData.sleepSchedule}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
                >

                  <option value="early-bird">
                    Early Bird
                  </option>

                  <option value="night-owl">
                    Night Owl
                  </option>

                  <option value="flexible">
                    Flexible
                  </option>

                </select>

              </div>

              <div>

                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Food Preference
                </label>

                <select
                  name="foodPref"
                  value={formData.foodPref}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
                >

                  <option value="veg">
                    Vegetarian
                  </option>

                  <option value="non-veg">
                    Non-Vegetarian
                  </option>

                  <option value="vegan">
                    Vegan
                  </option>

                </select>

              </div>

              <div>

                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Smoking
                </label>

                <select
                  name="smoking"
                  value={formData.smoking}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
                >

                  <option value="no">
                    No
                  </option>

                  <option value="yes">
                    Yes
                  </option>

                  <option value="occasionally">
                    Occasionally
                  </option>

                </select>

              </div>

              <div>

                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Cleanliness: {formData.cleanliness}/5
                </label>

                <input
                  type="range"
                  name="cleanliness"
                  min="1"
                  max="5"
                  value={formData.cleanliness}
                  onChange={handleChange}
                  className="w-full"
                />

              </div>

              <div>

                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  About Me
                </label>

                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows="5"
                  maxLength={500}
                  placeholder="Tell potential flatmates something about yourself..."
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />

              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-semibold hover:bg-indigo-700 transition disabled:opacity-60"
              >
                {loading
                  ? 'Saving...'
                  : 'Save Preferences'}
              </button>

            </form>
          )}

        </div>

      </div>
    </div>
  );
}

export default ProfileSetup;
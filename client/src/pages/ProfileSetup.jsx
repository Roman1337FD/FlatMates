import {
  useEffect,
  useState
} from 'react';

import {
  useNavigate
} from 'react-router-dom';

import api from '../api/axios';

const GREATER_NOIDA_AREAS = [
  'Knowledge Park I',
  'Knowledge Park II',
  'Knowledge Park III',
  'Pari Chowk',
  'Alpha I',
  'Alpha II',
  'Beta I',
  'Beta II',
  'Gamma I',
  'Gamma II',
  'Delta I',
  'Delta II',
  'Omega I',
  'Omega II',
  'Jagat Farm',
  'Kasna',
  'Surajpur',
  'Jaypee Greens',
  'Greater Noida West',
  'Noida Extension',
  'Gaur City',
  'Techzone',
  'Sector 1',
  'Sector 4',
  'Sector 10',
  'Sector 16B',
  'Sector 137',
  'Sector 150',
  'Other'
];

function ProfileSetup() {
  const navigate = useNavigate();

  const [loading, setLoading] =
    useState(false);

  const [loadingProfile, setLoadingProfile] =
    useState(true);

  const [areaType, setAreaType] =
    useState('');

  const [customArea, setCustomArea] =
    useState('');

  const [formData, setFormData] =
    useState({
      name: '',
      gender: '',
      profession: '',
      targetArea: '',
      budgetMin: '',
      budgetMax: '',
      sleepSchedule: '',
      foodPref: '',
      smoking: '',
      cleanliness: '',
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

    const fetchProfile =
      async () => {
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

          const savedArea =
            user.targetArea || '';

          const isKnownArea =
            GREATER_NOIDA_AREAS.includes(
              savedArea
            ) &&
            savedArea !== 'Other';

          setFormData({
            name:
              user.name || '',

            gender:
              user.gender || '',

            profession:
              user.profession || '',

            targetArea:
              savedArea,

            budgetMin:
              user.budgetMin ??
              '',

            budgetMax:
              user.budgetMax ??
              '',

            sleepSchedule:
              user.sleepSchedule || '',

            foodPref:
              user.foodPref || '',

            smoking:
              user.smoking || '',

            cleanliness:
              user.cleanliness ??
              '',

            bio:
              user.bio || ''
          });

          if (isKnownArea) {
            setAreaType(savedArea);
            setCustomArea('');
          } else if (savedArea) {
            setAreaType('Other');
            setCustomArea(
              savedArea
            );
          } else {
            setAreaType('');
            setCustomArea('');
          }

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

            localStorage.removeItem(
              'customUserId'
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

  const handleAreaChange = (e) => {
    const value =
      e.target.value;

    setAreaType(value);

    if (value === 'Other') {
      setFormData((prev) => ({
        ...prev,
        targetArea:
          customArea.trim()
      }));

      return;
    }

    setCustomArea('');

    setFormData((prev) => ({
      ...prev,
      targetArea: value
    }));
  };

  const handleCustomAreaChange =
    (e) => {
      const value =
        e.target.value;

      setCustomArea(value);

      if (areaType === 'Other') {
        setFormData((prev) => ({
          ...prev,
          targetArea: value
        }));
      }
    };

  const handleSubmit = async (
    e
  ) => {
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
      alert(
        'Name is required'
      );

      return;
    }

    if (name.length > 50) {
      alert(
        'Name must be 50 characters or less'
      );

      return;
    }

    if (!formData.gender) {
      alert(
        'Please select your gender'
      );

      return;
    }

    if (!formData.profession) {
      alert(
        'Please select your profession'
      );

      return;
    }

    if (!targetArea) {
      alert(
        'Please select your preferred area'
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
      !Number.isFinite(
        minBudget
      ) ||
      !Number.isFinite(
        maxBudget
      )
    ) {
      alert(
        'Please enter a valid budget'
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

    if (!formData.sleepSchedule) {
      alert(
        'Please select your sleep schedule'
      );

      return;
    }

    if (!formData.foodPref) {
      alert(
        'Please select your food preference'
      );

      return;
    }

    if (!formData.smoking) {
      alert(
        'Please select your smoking preference'
      );

      return;
    }

    if (
      !Number.isFinite(
        cleanliness
      ) ||
      cleanliness < 1 ||
      cleanliness > 5
    ) {
      alert(
        'Please select your cleanliness level'
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
        JSON.stringify(
          profileData
        )
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

        localStorage.removeItem(
          'customUserId'
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
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-indigo-50 py-6 sm:py-8 px-4">

      <div className="max-w-4xl mx-auto">

        <div className="bg-white rounded-3xl border border-indigo-100 shadow-sm p-5 sm:p-7 md:p-8">

          <div className="mb-7">

            <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 text-indigo-600 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide">
              ⚙️ Preferences
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 mt-3">
              Set Up Your Preferences
            </h1>

            <p className="text-slate-500 mt-2 text-sm sm:text-base">
              Tell us about your lifestyle so we can find compatible flatmates nearby.
            </p>

          </div>

          {loadingProfile ? (
            <div className="py-14 text-center">

              <div className="w-10 h-10 mx-auto rounded-full border-4 border-indigo-200 border-t-indigo-500 animate-spin mb-4"></div>

              <p className="text-slate-700 font-semibold">
                Loading your profile...
              </p>

            </div>
          ) : (
            <form
              onSubmit={
                handleSubmit
              }
              className="space-y-6"
            >

              <div>

                <label
                  htmlFor="name"
                  className="block text-sm font-semibold text-slate-700 mb-2"
                >
                  Name
                </label>

                <input
                  id="name"
                  type="text"
                  name="name"
                  value={
                    formData.name
                  }
                  onChange={
                    handleChange
                  }
                  maxLength={50}
                  required
                  autoComplete="name"
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-slate-50 focus:bg-white outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 text-slate-700"
                />

              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                <div>

                  <label
                    htmlFor="gender"
                    className="block text-sm font-semibold text-slate-700 mb-2"
                  >
                    Gender
                  </label>

                  <select
                    id="gender"
                    name="gender"
                    value={
                      formData.gender
                    }
                    onChange={
                      handleChange
                    }
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-slate-50 focus:bg-white outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 text-slate-700"
                  >

                    <option value="">
                      Select gender
                    </option>

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

                  <label
                    htmlFor="profession"
                    className="block text-sm font-semibold text-slate-700 mb-2"
                  >
                    Profession
                  </label>

                  <select
                    id="profession"
                    name="profession"
                    value={
                      formData.profession
                    }
                    onChange={
                      handleChange
                    }
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-slate-50 focus:bg-white outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 text-slate-700"
                  >

                    <option value="">
                      Select profession
                    </option>

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

                <label
                  htmlFor="targetArea"
                  className="block text-sm font-semibold text-slate-700 mb-2"
                >
                  Preferred Area
                </label>

                <select
                  id="targetArea"
                  value={
                    areaType
                  }
                  onChange={
                    handleAreaChange
                  }
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-slate-50 focus:bg-white outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 text-slate-700"
                >

                  <option value="">
                    Select your area
                  </option>

                  {GREATER_NOIDA_AREAS.map(
                    (area) => (
                      <option
                        key={area}
                        value={area}
                      >
                        {area}
                      </option>
                    )
                  )}

                </select>

                <p className="text-xs text-slate-400 mt-2">
                  Choose a nearby Greater Noida area or select Other if your location is not listed.
                </p>

              </div>

              {areaType ===
                'Other' && (
                <div>

                  <label
                    htmlFor="customArea"
                    className="block text-sm font-semibold text-slate-700 mb-2"
                  >
                    Enter Your Location
                  </label>

                  <input
                    id="customArea"
                    type="text"
                    value={
                      customArea
                    }
                    onChange={
                      handleCustomAreaChange
                    }
                    maxLength={100}
                    placeholder="Example: Sharda Hospital, Gaur City, Sector 4..."
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-slate-50 focus:bg-white outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 text-slate-700 placeholder:text-slate-400"
                  />

                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                <div>

                  <label
                    htmlFor="budgetMin"
                    className="block text-sm font-semibold text-slate-700 mb-2"
                  >
                    Minimum Budget
                  </label>

                  <input
                    id="budgetMin"
                    type="number"
                    name="budgetMin"
                    value={
                      formData.budgetMin
                    }
                    onChange={
                      handleChange
                    }
                    min="0"
                    required
                    placeholder="5000"
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-slate-50 focus:bg-white outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 text-slate-700"
                  />

                </div>

                <div>

                  <label
                    htmlFor="budgetMax"
                    className="block text-sm font-semibold text-slate-700 mb-2"
                  >
                    Maximum Budget
                  </label>

                  <input
                    id="budgetMax"
                    type="number"
                    name="budgetMax"
                    value={
                      formData.budgetMax
                    }
                    onChange={
                      handleChange
                    }
                    min="0"
                    required
                    placeholder="12000"
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-slate-50 focus:bg-white outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 text-slate-700"
                  />

                </div>

              </div>

              <div>

                <label
                  htmlFor="sleepSchedule"
                  className="block text-sm font-semibold text-slate-700 mb-2"
                >
                  Sleep Schedule
                </label>

                <select
                  id="sleepSchedule"
                  name="sleepSchedule"
                  value={
                    formData.sleepSchedule
                  }
                  onChange={
                    handleChange
                  }
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-slate-50 focus:bg-white outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 text-slate-700"
                >

                  <option value="">
                    Select sleep schedule
                  </option>

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

                <label
                  htmlFor="foodPref"
                  className="block text-sm font-semibold text-slate-700 mb-2"
                >
                  Food Preference
                </label>

                <select
                  id="foodPref"
                  name="foodPref"
                  value={
                    formData.foodPref
                  }
                  onChange={
                    handleChange
                  }
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-slate-50 focus:bg-white outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 text-slate-700"
                >

                  <option value="">
                    Select food preference
                  </option>

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

                <label
                  htmlFor="smoking"
                  className="block text-sm font-semibold text-slate-700 mb-2"
                >
                  Smoking
                </label>

                <select
                  id="smoking"
                  name="smoking"
                  value={
                    formData.smoking
                  }
                  onChange={
                    handleChange
                  }
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-slate-50 focus:bg-white outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 text-slate-700"
                >

                  <option value="">
                    Select smoking preference
                  </option>

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

                <label
                  htmlFor="cleanliness"
                  className="block text-sm font-semibold text-slate-700 mb-2"
                >
                  Cleanliness
                  {formData.cleanliness
                    ? `: ${formData.cleanliness}/5`
                    : ''}
                </label>

                <input
                  id="cleanliness"
                  type="range"
                  name="cleanliness"
                  min="1"
                  max="5"
                  value={
                    formData.cleanliness ||
                    1
                  }
                  onChange={
                    handleChange
                  }
                  className="w-full accent-indigo-500"
                />

                <div className="flex justify-between text-xs text-slate-400 mt-1">
                  <span>Less tidy</span>
                  <span>Very tidy</span>
                </div>

              </div>

              <div>

                <label
                  htmlFor="bio"
                  className="block text-sm font-semibold text-slate-700 mb-2"
                >
                  About Me
                </label>

                <textarea
                  id="bio"
                  name="bio"
                  value={
                    formData.bio
                  }
                  onChange={
                    handleChange
                  }
                  rows="5"
                  maxLength={500}
                  placeholder="Tell potential flatmates something about yourself..."
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-slate-50 focus:bg-white outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 text-slate-700 placeholder:text-slate-400 resize-none"
                />

                <p className="text-right text-xs text-slate-400 mt-1">
                  {formData.bio.length}/500
                </p>

              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-500 text-white py-3.5 rounded-xl font-semibold hover:bg-indigo-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
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
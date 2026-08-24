import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function ProfileSetup() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: localStorage.getItem('userName') || '',
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
    const savedPref = localStorage.getItem('userPreferences');

    if (savedPref) {
      try {
        const preferences = JSON.parse(savedPref);

        setFormData((prev) => ({
          ...prev,
          ...preferences
        }));
      } catch (error) {
        console.error('Failed to load preferences:', error);
      }
    }
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const userId = localStorage.getItem('userId');

    if (!userId) {
      alert('Please login first.');
      navigate('/login');
      return;
    }

    if (Number(formData.budgetMin) <= 0) {
      alert('Minimum budget must be greater than 0');
      return;
    }

    if (Number(formData.budgetMax) <= Number(formData.budgetMin)) {
      alert('Maximum budget must be greater than minimum budget');
      return;
    }

    try {
      setLoading(true);

      const profileData = {
        name: formData.name,
        gender: formData.gender,
        profession: formData.profession,
        targetArea: formData.targetArea,
        budgetMin: Number(formData.budgetMin),
        budgetMax: Number(formData.budgetMax),
        sleepSchedule: formData.sleepSchedule,
        foodPref: formData.foodPref,
        smoking: formData.smoking,
        cleanliness: Number(formData.cleanliness),
        bio: formData.bio
      };

      const response = await axios.put(
        `http://localhost:5000/api/auth/profile/${userId}`,
        profileData
      );

      if (response.data.success) {
        const updatedUser = response.data.user;

        localStorage.setItem(
          'userPreferences',
          JSON.stringify(profileData)
        );

        localStorage.setItem(
          'userName',
          updatedUser.name
        );

        localStorage.setItem(
          'userEmail',
          updatedUser.email
        );

        alert('Preferences saved successfully!');

        navigate('/profile');
      }
    } catch (error) {
      console.error('Profile Update Error:', error);

      alert(
        error.response?.data?.message ||
        'Failed to save preferences.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-slate-200 my-6">

      <h2 className="text-2xl font-bold text-slate-800 mb-2">
        Set Your Preferences
      </h2>

      <p className="text-slate-500 mb-6 text-sm">
        Fill in your lifestyle habits and stay details. Our AI uses this
        to calculate match accuracy.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">
            Full Name
          </label>

          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter your name"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Gender
            </label>

            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Profession
            </label>

            <select
              name="profession"
              value={formData.profession}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="student">Student</option>
              <option value="working-professional">
                Working Professional
              </option>
            </select>
          </div>

        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">
            Target Area (Greater Noida)
          </label>

          <select
            name="targetArea"
            value={formData.targetArea}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            <option value="Knowledge Park II">Knowledge Park II</option>
            <option value="Knowledge Park III">Knowledge Park III</option>
            <option value="Pari Chowk">Pari Chowk</option>
            <option value="Alpha 1">Alpha 1</option>
            <option value="Delta 3">Delta 3</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Min Budget (₹/month)
            </label>

            <input
              type="number"
              name="budgetMin"
              min="1"
              value={formData.budgetMin}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Max Budget (₹/month)
            </label>

            <input
              type="number"
              name="budgetMax"
              min="1"
              value={formData.budgetMax}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Sleep Schedule
            </label>

            <select
              name="sleepSchedule"
              value={formData.sleepSchedule}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="early-bird">Early Bird</option>
              <option value="night-owl">Night Owl</option>
              <option value="flexible">Flexible</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Food Preference
            </label>

            <select
              name="foodPref"
              value={formData.foodPref}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="veg">Pure Veg</option>
              <option value="non-veg">Non-Veg OK</option>
              <option value="vegan">Vegan</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Smoking Habit
            </label>

            <select
              name="smoking"
              value={formData.smoking}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="no">Non-Smoker</option>
              <option value="yes">Smoker</option>
              <option value="occasionally">Occasionally</option>
            </select>
          </div>

        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Cleanliness Level: {formData.cleanliness}/5
          </label>

          <input
            type="range"
            name="cleanliness"
            min="1"
            max="5"
            value={formData.cleanliness}
            onChange={handleChange}
            className="w-full accent-indigo-600"
          />

          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>Relaxed</span>
            <span>Very Clean</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">
            Short Bio / Preferences
          </label>

          <textarea
            name="bio"
            rows="3"
            value={formData.bio}
            onChange={handleChange}
            placeholder="e.g. Preparing for exams, quiet environment preferred..."
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          ></textarea>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-lg hover:bg-indigo-700 transition-colors shadow-md disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save & Update Profile'}
        </button>

      </form>
    </div>
  );
}

export default ProfileSetup;
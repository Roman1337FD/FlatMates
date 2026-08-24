import { useState, useEffect } from 'react';
import axios from 'axios';
import MatchCard from '../components/MatchCard';

function Listings() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMatches = async () => {
      setLoading(true);
      setError('');

      try {
        const currentUserId = localStorage.getItem('userId');

        const savedPref = localStorage.getItem('userPreferences');

        if (!currentUserId) {
          setError('Please login first.');
          return;
        }

        if (!savedPref) {
          setError('Please complete your preferences first.');
          return;
        }

        const userProfile = JSON.parse(savedPref);

        const response = await axios.get(
          'http://localhost:5000/api/auth/users'
        );

        const users = response.data.users || [];

        const otherUsers = users.filter(
          (user) => user._id !== currentUserId
        );

        if (otherUsers.length === 0) {
          setError(
            'No other registered users found. Register another user to find a flatmate.'
          );
          return;
        }

        const matchPromises = otherUsers.map(async (target) => {
          const targetProfile = {
            name: target.name,
            targetArea: target.targetArea,
            budgetMin: target.budgetMin,
            budgetMax: target.budgetMax,
            sleepSchedule: target.sleepSchedule,
            foodPref: target.foodPref,
            smoking: target.smoking,
            cleanliness: target.cleanliness,
            bio: target.bio
          };

          const result = await axios.post(
            'http://localhost:5000/api/match/calculate',
            {
              userProfile,
              targetProfile
            }
          );

          return {
            id: target._id,
            userId: target._id,
            name: target.name,
            area: target.targetArea,
            budget: `${target.budgetMin} - ${target.budgetMax}`,
            matchScore: result.data.matchData.matchScore,
            summary: result.data.matchData.summary,
            pros: result.data.matchData.pros,
            cons: result.data.matchData.cons
          };
        });

        const results = await Promise.all(matchPromises);

        results.sort((a, b) => b.matchScore - a.matchScore);

        setMatches(results);

      } catch (err) {
        console.error('Error calculating matches:', err);

        setError(
          err.response?.data?.message ||
          'Failed to load flatmate matches.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, []);

  return (
    <div className="py-6">

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            AI Matched Flatmates in Greater Noida
          </h2>

          <p className="text-slate-500 text-sm">
            Real users matched using Gemini AI based on lifestyle compatibility.
          </p>
        </div>
      </div>

      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-600 border-t-transparent mb-2"></div>

          <p className="text-slate-600 font-medium">
            Gemini AI is analyzing compatibility...
          </p>
        </div>
      )}

      {!loading && error && (
        <div className="max-w-xl mx-auto bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-5 text-center">
          <p className="font-semibold mb-1">
            No matches available
          </p>

          <p className="text-sm">
            {error}
          </p>
        </div>
      )}

      {!loading && !error && matches.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {matches.map((match) => (
            <MatchCard
              key={match.id}
              matchData={match}
            />
          ))}
        </div>
      )}

    </div>
  );
}

export default Listings;
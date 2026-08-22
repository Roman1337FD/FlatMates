import { useState, useEffect } from 'react';
import axios from 'axios';
import MatchCard from '../components/MatchCard';

function Listings() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  const mockTargetProfiles = [
    {
      id: 1,
      name: 'Rohan Sharma',
      targetArea: 'Knowledge Park II',
      budgetMin: 8000,
      budgetMax: 10000,
      sleepSchedule: 'night-owl',
      foodPref: 'veg',
      smoking: 'no',
      cleanliness: 4,
      bio: 'Second year student, late night coding and gaming.'
    },
    {
      id: 2,
      name: 'Aman Verma',
      targetArea: 'Pari Chowk',
      budgetMin: 6000,
      budgetMax: 8000,
      sleepSchedule: 'early-bird',
      foodPref: 'non-veg',
      smoking: 'occasionally',
      cleanliness: 3,
      bio: 'Focusing on studies, early morning gym enthusiast.'
    }
  ];

  useEffect(() => {
    const fetchMatches = async () => {
      setLoading(true);
      const savedPref = localStorage.getItem('userPreferences');
      const userProfile = savedPref ? JSON.parse(savedPref) : {
        name: 'Guest User',
        targetArea: 'Knowledge Park II',
        budgetMin: 5000,
        budgetMax: 12000,
        sleepSchedule: 'night-owl',
        foodPref: 'veg',
        smoking: 'no',
        cleanliness: 4,
        bio: 'Looking for a quiet roommate.'
      };

      try {
        const matchPromises = mockTargetProfiles.map(async (target) => {
          const res = await axios.post('http://localhost:5000/api/match/calculate', {
            userProfile,
            targetProfile: target
          });

          return {
            id: target.id,
            name: target.name,
            area: target.targetArea,
            budget: `${target.budgetMin} - ${target.budgetMax}`,
            matchScore: res.data.matchData.matchScore,
            summary: res.data.matchData.summary,
            pros: res.data.matchData.pros,
            cons: res.data.matchData.cons
          };
        });

        const results = await Promise.all(matchPromises);
        setMatches(results);
      } catch (err) {
        console.error('Error calculating matches:', err);
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
          <h2 className="text-2xl font-bold text-slate-800">AI Matched Flatmates in Greater Noida</h2>
          <p className="text-slate-500 text-sm">Calculated using Gemini AI based on your saved preferences.</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-600 border-t-transparent mb-2"></div>
          <p className="text-slate-600 font-medium">Gemini AI is analyzing compatibility...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {matches.map((match) => (
            <MatchCard key={match.id} matchData={match} />
          ))}
        </div>
      )}
    </div>
  );
}

export default Listings;
import { useEffect, useState } from 'react';
import api from '../api/axios';
import MatchCard from '../components/MatchCard';

function calculateFallbackMatch(
  user,
  target
) {
  let score = 0;

  if (
    user.targetArea &&
    target.targetArea &&
    user.targetArea ===
      target.targetArea
  ) {
    score += 25;
  }

  const userMin =
    Number(user.budgetMin);

  const userMax =
    Number(user.budgetMax);

  const targetMin =
    Number(target.budgetMin);

  const targetMax =
    Number(target.budgetMax);

  if (
    Number.isFinite(userMin) &&
    Number.isFinite(userMax) &&
    Number.isFinite(targetMin) &&
    Number.isFinite(targetMax) &&
    userMin <= targetMax &&
    targetMin <= userMax
  ) {
    score += 25;
  }

  if (
    user.sleepSchedule &&
    user.sleepSchedule ===
      target.sleepSchedule
  ) {
    score += 15;
  }

  if (
    user.foodPref &&
    user.foodPref ===
      target.foodPref
  ) {
    score += 15;
  }

  if (
    user.smoking &&
    user.smoking ===
      target.smoking
  ) {
    score += 10;
  }

  const cleanlinessDifference =
    Math.abs(
      Number(user.cleanliness) -
        Number(target.cleanliness)
    );

  if (
    Number.isFinite(
      cleanlinessDifference
    )
  ) {
    if (
      cleanlinessDifference === 0
    ) {
      score += 10;
    } else if (
      cleanlinessDifference === 1
    ) {
      score += 5;
    }
  }

  return Math.min(
    Math.max(score, 0),
    100
  );
}

function createFallbackResult(
  currentProfile,
  target
) {
  const fallbackScore =
    calculateFallbackMatch(
      currentProfile,
      target
    );

  return {
    id: target._id,

    userId: target._id,

    name:
      target.name ||
      'Flatmate',

    profileImage:
      target.profileImage ||
      '',

    area:
      target.targetArea ||
      'Area not specified',

    budget: `${target.budgetMin ?? 0} - ${target.budgetMax ?? 0}`,

    matchScore:
      fallbackScore,

    summary:
      'AI matching is temporarily unavailable. Compatibility is calculated using your saved preferences.',

    pros: [
      currentProfile.targetArea &&
      currentProfile.targetArea ===
        target.targetArea
        ? 'Same preferred area'
        : 'Different preferred area',

      currentProfile.foodPref &&
      currentProfile.foodPref ===
        target.foodPref
        ? 'Same food preference'
        : 'Different food preference'
    ],

    cons: [
      currentProfile.sleepSchedule !==
      target.sleepSchedule
        ? 'Different sleep schedules'
        : 'Similar sleep schedules',

      currentProfile.smoking !==
      target.smoking
        ? 'Different smoking preferences'
        : 'Similar smoking preferences'
    ]
  };
}

function Listings() {
  const [matches, setMatches] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  useEffect(() => {
    let isMounted = true;

    const fetchMatches = async () => {
      setLoading(true);
      setError('');

      try {
        const currentUserId =
          localStorage.getItem(
            'userId'
          );

        const token =
          localStorage.getItem(
            'token'
          );

        if (
          !currentUserId ||
          !token
        ) {
          if (isMounted) {
            setError(
              'Please login first.'
            );

            setLoading(false);
          }

          return;
        }

        const profileResponse =
          await api.get(
            `/auth/profile/${encodeURIComponent(
              currentUserId
            )}`
          );

        const userProfile =
          profileResponse.data?.user ||
          profileResponse.data;

        if (
          !userProfile ||
          !userProfile._id
        ) {
          if (isMounted) {
            setError(
              'Your profile could not be found.'
            );

            setLoading(false);
          }

          return;
        }

        const response =
          await api.get(
            '/auth/users'
          );

        const usersData =
          response.data?.users ??
          response.data;

        const users =
          Array.isArray(usersData)
            ? usersData
            : [];

        const otherUsers =
          users.filter(
            (user) =>
              user?._id &&
              String(user._id) !==
                String(currentUserId)
          );

        if (
          otherUsers.length === 0
        ) {
          if (isMounted) {
            setError(
              'No other registered users found. Register another user to find a flatmate.'
            );

            setLoading(false);
          }

          return;
        }

        const currentProfile = {
          targetArea:
            userProfile.targetArea,

          budgetMin:
            userProfile.budgetMin,

          budgetMax:
            userProfile.budgetMax,

          sleepSchedule:
            userProfile.sleepSchedule,

          foodPref:
            userProfile.foodPref,

          smoking:
            userProfile.smoking,

          cleanliness:
            userProfile.cleanliness
        };

        const matchPromises =
          otherUsers.map(
            async (target) => {
              try {
                const result =
                  await api.post(
                    '/match/calculate',
                    {
                      targetUserId:
                        target._id
                    }
                  );

                const matchData =
                  result.data?.matchData ||
                  result.data;

                if (
                  !matchData ||
                  typeof matchData.matchScore !==
                    'number'
                ) {
                  throw new Error(
                    'Invalid AI match response'
                  );
                }

                return {
                  id: target._id,

                  userId:
                    target._id,

                  name:
                    target.name ||
                    'Flatmate',

                  profileImage:
                    typeof target.profileImage ===
                    'string'
                      ? target.profileImage
                      : '',

                  area:
                    target.targetArea ||
                    'Area not specified',

                  budget: `${target.budgetMin ?? 0} - ${target.budgetMax ?? 0}`,

                  matchScore:
                    Math.max(
                      0,
                      Math.min(
                        100,
                        Math.round(
                          matchData.matchScore
                        )
                      )
                    ),

                  summary:
                    typeof matchData.summary ===
                    'string'
                      ? matchData.summary
                      : 'Compatibility calculated using AI.',

                  pros:
                    Array.isArray(
                      matchData.pros
                    )
                      ? matchData.pros
                      : [],

                  cons:
                    Array.isArray(
                      matchData.cons
                    )
                      ? matchData.cons
                      : []
                };
              } catch (
                geminiError
              ) {
                console.error(
                  `Gemini failed for ${target.name || 'user'}:`,
                  geminiError
                );

                return createFallbackResult(
                  currentProfile,
                  target
                );
              }
            }
          );

        const results =
          await Promise.all(
            matchPromises
          );

        results.sort(
          (a, b) =>
            b.matchScore -
            a.matchScore
        );

        if (isMounted) {
          setMatches(results);
        }
      } catch (err) {
        console.error(
          'Error loading matches:',
          err
        );

        if (isMounted) {
          setError(
            err.response?.data?.message ||
            err.response?.data?.error ||
            'Failed to load flatmate matches.'
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchMatches();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="py-6">

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">

        <div>

          <h2 className="text-2xl font-bold text-slate-800">
            AI Matched Flatmates in Greater Noida
          </h2>

          <p className="text-slate-500 text-sm">
            Real users matched using lifestyle compatibility.
          </p>

        </div>

      </div>

      {loading && (
        <div className="text-center py-12">

          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-600 border-t-transparent mb-2"></div>

          <p className="text-slate-600 font-medium">
            Finding compatible flatmates...
          </p>

        </div>
      )}

      {!loading &&
        error && (
          <div className="max-w-xl mx-auto bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-5 text-center">

            <p className="font-semibold mb-1">
              No matches available
            </p>

            <p className="text-sm">
              {error}
            </p>

          </div>
        )}

      {!loading &&
        !error &&
        matches.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {matches.map(
              (match) => (
                <MatchCard
                  key={match.id}
                  matchData={match}
                />
              )
            )}

          </div>
        )}

    </div>
  );
}

export default Listings;
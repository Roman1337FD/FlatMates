import {
  useEffect,
  useState
} from 'react';

import {
  useNavigate
} from 'react-router-dom';

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

function isPreferencesComplete(
  user
) {
  if (!user) {
    return false;
  }

  const targetArea =
    String(
      user.targetArea || ''
    ).trim();

  const budgetMin =
    Number(user.budgetMin);

  const budgetMax =
    Number(user.budgetMax);

  const cleanliness =
    Number(user.cleanliness);

  return (
    targetArea.length > 0 &&
    Number.isFinite(budgetMin) &&
    Number.isFinite(budgetMax) &&
    budgetMin >= 0 &&
    budgetMax >= 0 &&
    budgetMin <= budgetMax &&
    Boolean(user.sleepSchedule) &&
    Boolean(user.foodPref) &&
    Boolean(user.smoking) &&
    Number.isFinite(cleanliness) &&
    cleanliness >= 1 &&
    cleanliness <= 5
  );
}

function Listings() {
  const navigate = useNavigate();

  const [matches, setMatches] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  const [preferencesComplete, setPreferencesComplete] =
    useState(false);

  const [checkingPreferences, setCheckingPreferences] =
    useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchMatches =
      async () => {
        try {
          setLoading(true);
          setCheckingPreferences(true);
          setError('');

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
              setCheckingPreferences(false);
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
              setCheckingPreferences(false);
            }

            return;
          }

          const complete =
            isPreferencesComplete(
              userProfile
            );

          if (isMounted) {
            setPreferencesComplete(
              complete
            );
            setCheckingPreferences(
              false
            );
          }

          if (!complete) {
            if (isMounted) {
              setMatches([]);
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
            Array.isArray(
              usersData
            )
              ? usersData
              : [];

          const otherUsers =
            users.filter(
              (user) =>
                user?._id &&
                String(
                  user._id
                ) !==
                  String(
                    currentUserId
                  )
            );

          if (
            otherUsers.length ===
            0
          ) {
            if (isMounted) {
              setError(
                'No other registered users found. Register another user to find a flatmate.'
              );

              setLoading(false);
            }

            return;
          }

          const currentProfile =
            {
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
                    result.data
                      ?.matchData ||
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
                    `Gemini failed for ${
                      target.name ||
                      'user'
                    }:`,
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
            setCheckingPreferences(false);
          }
        }
      };

    fetchMatches();

    return () => {
      isMounted = false;
    };
  }, []);

  if (
    checkingPreferences ||
    loading
  ) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-indigo-50 px-4 py-6 sm:py-8">

        <div className="max-w-6xl mx-auto">

          <div className="bg-white rounded-2xl border border-indigo-100 shadow-sm py-14 text-center">

            <div className="w-10 h-10 mx-auto rounded-full border-4 border-indigo-200 border-t-indigo-500 animate-spin mb-4"></div>

            <p className="text-slate-700 font-semibold">
              {checkingPreferences
                ? 'Checking your preferences...'
                : 'Finding compatible flatmates...'}
            </p>

            <p className="text-slate-400 text-sm mt-1">
              {checkingPreferences
                ? 'Making sure your profile is ready for matching.'
                : 'Comparing lifestyle and budget preferences.'}
            </p>

          </div>

        </div>

      </div>
    );
  }

  if (
    !preferencesComplete
  ) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-indigo-50 px-4 py-6 sm:py-8">

        <div className="max-w-3xl mx-auto">

          <div className="mb-7">

            <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 text-indigo-600 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide">
              ✨ AI Matching
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800 mt-3">
              Find Your Flatmate
            </h1>

            <p className="text-slate-500 text-sm sm:text-base mt-2">
              Complete your preferences first so we can find compatible flatmates for you.
            </p>

          </div>

          <div className="bg-white rounded-3xl border border-indigo-100 shadow-sm p-7 sm:p-9 text-center">

            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-rose-50 to-indigo-50 border border-indigo-100 flex items-center justify-center text-3xl mb-5">
              ⚙️
            </div>

            <h2 className="text-2xl font-bold text-slate-800">
              Complete Your Preferences
            </h2>

            <p className="text-slate-500 mt-2 max-w-lg mx-auto leading-relaxed">
              Add your preferred area, budget, sleep schedule, food preference, smoking preference and cleanliness level before finding flatmates.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-7 text-left">

              <div className="bg-rose-50 border border-rose-100 rounded-xl p-3">
                <p className="text-xs text-slate-500">
                  📍 Area
                </p>
              </div>

              <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3">
                <p className="text-xs text-slate-500">
                  💰 Budget
                </p>
              </div>

              <div className="bg-pink-50 border border-pink-100 rounded-xl p-3">
                <p className="text-xs text-slate-500">
                  🌙 Sleep
                </p>
              </div>

              <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3">
                <p className="text-xs text-slate-500">
                  🍽️ Food
                </p>
              </div>

              <div className="bg-rose-50 border border-rose-100 rounded-xl p-3">
                <p className="text-xs text-slate-500">
                  🚭 Smoking
                </p>
              </div>

              <div className="bg-pink-50 border border-pink-100 rounded-xl p-3">
                <p className="text-xs text-slate-500">
                  ✨ Cleanliness
                </p>
              </div>

            </div>

            <button
              type="button"
              onClick={() =>
                navigate(
                  '/profile-setup'
                )
              }
              className="mt-7 w-full sm:w-auto bg-indigo-500 text-white px-7 py-3 rounded-xl font-semibold hover:bg-indigo-600 transition-colors"
            >
              Complete Preferences
            </button>

          </div>

        </div>

      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-indigo-50 px-4 py-6 sm:py-8">

      <div className="max-w-6xl mx-auto">

        <div className="mb-7">

          <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 text-indigo-600 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide">
            ✨ AI Matching
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800 mt-3">
            Find Your Flatmate
          </h1>

          <p className="text-slate-500 text-sm sm:text-base mt-2 max-w-2xl">
            Discover real users in Greater Noida who match your lifestyle, budget and daily habits.
          </p>

        </div>

        <div className="bg-white rounded-2xl border border-indigo-100 shadow-sm p-4 sm:p-5 mb-7">

          <div className="flex flex-col sm:flex-row sm:items-center gap-4">

            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-50 to-indigo-50 border border-indigo-100 flex items-center justify-center text-xl flex-shrink-0">
              🏠
            </div>

            <div className="flex-1">

              <h2 className="font-bold text-slate-800">
                Smart compatibility matching
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                Matches are based on area, budget, sleep, food, smoking and cleanliness preferences.
              </p>

            </div>

            <div className="px-4 py-2 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 text-sm font-bold whitespace-nowrap">
              Greater Noida
            </div>

          </div>

        </div>

        {!error &&
          matches.length > 0 && (
            <>
              <div className="flex items-center justify-between mb-4">

                <div>

                  <h2 className="text-lg font-bold text-slate-800">
                    Compatible Flatmates
                  </h2>

                  <p className="text-sm text-slate-500 mt-1">
                    Best matches are shown first.
                  </p>

                </div>

                <span className="hidden sm:block px-3 py-1.5 rounded-full bg-white border border-slate-200 text-xs font-bold text-slate-500">
                  {matches.length}{' '}
                  {matches.length ===
                  1
                    ? 'match'
                    : 'matches'}
                </span>

              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {matches.map(
                  (match) => (
                    <MatchCard
                      key={match.id}
                      matchData={
                        match
                      }
                    />
                  )
                )}

              </div>
            </>
          )}

        {error && (
          <div className="max-w-xl mx-auto bg-white border border-rose-200 rounded-2xl shadow-sm p-7 text-center">

            <div className="w-12 h-12 mx-auto rounded-2xl bg-rose-50 flex items-center justify-center text-xl mb-4">
              ⚠️
            </div>

            <h2 className="font-bold text-slate-800">
              No matches available
            </h2>

            <p className="text-sm text-slate-500 mt-2">
              {error}
            </p>

          </div>
        )}

      </div>

    </div>
  );
}

export default Listings;
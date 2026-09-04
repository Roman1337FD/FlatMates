import { useNavigate } from 'react-router-dom';

function MatchCard({ matchData }) {
  const navigate = useNavigate();

  const {
    name,
    area,
    budget,
    matchScore,
    pros = [],
    cons = [],
    summary,
    profileImage
  } = matchData;

  const getScoreColor = (score) => {
    if (score >= 80) {
      return 'bg-emerald-50 text-emerald-700 border-emerald-100';
    }

    if (score >= 60) {
      return 'bg-amber-50 text-amber-700 border-amber-100';
    }

    return 'bg-rose-50 text-rose-700 border-rose-100';
  };

  const handleChat = () => {
    const receiverId = matchData.userId;

    if (!receiverId) {
      alert('User ID not found.');
      return;
    }

    navigate(`/chat/${receiverId}`);
  };

  const handleViewProfile = () => {
    const userId = matchData.userId;

    if (!userId) {
      alert('User ID not found.');
      return;
    }

    navigate(`/profile/${userId}`);
  };

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-indigo-100 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">

      <div>

        <div className="flex items-start justify-between gap-3 mb-5">

          <button
            type="button"
            onClick={handleViewProfile}
            className="flex items-center gap-3 min-w-0 text-left group"
          >

            {profileImage ? (
              <img
                src={profileImage}
                alt={`${name || 'User'} profile`}
                className="w-14 h-14 rounded-full object-cover border-2 border-white ring-2 ring-indigo-100 flex-shrink-0"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-rose-100 to-indigo-100 text-indigo-600 flex items-center justify-center text-xl font-bold border border-indigo-100 flex-shrink-0">
                {(name || 'U')
                  .charAt(0)
                  .toUpperCase()}
              </div>
            )}

            <div className="min-w-0">

              <h3 className="text-lg sm:text-xl font-bold text-slate-800 truncate group-hover:text-indigo-600 transition-colors">
                {name}
              </h3>

              <p className="text-sm text-slate-500 mt-0.5 truncate">
                {area} • ₹{budget}/month
              </p>

            </div>

          </button>

          <span
            className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-bold border flex-shrink-0 ${getScoreColor(
              matchScore
            )}`}
          >
            {matchScore}% Match
          </span>

        </div>

        <div className="bg-gradient-to-r from-rose-50/70 to-indigo-50/70 border border-indigo-100 rounded-2xl p-4 mb-5">

          <p className="text-sm text-slate-600 leading-relaxed">
            "{summary}"
          </p>

        </div>

        <div className="space-y-4 mb-6">

          <div>

            <div className="flex items-center gap-2 mb-2">

              <span className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-xs">
                ✓
              </span>

              <span className="text-xs font-bold text-emerald-600 tracking-wide uppercase">
                Matching Habits
              </span>

            </div>

            <div className="flex flex-wrap gap-2">

              {pros.length > 0 ? (
                pros.map(
                  (pro, index) => (
                    <span
                      key={index}
                      className="text-xs bg-emerald-50 border border-emerald-100 text-emerald-700 px-2.5 py-1.5 rounded-lg font-medium"
                    >
                      ✓ {pro}
                    </span>
                  )
                )
              ) : (
                <span className="text-xs text-slate-400">
                  No matching habits listed
                </span>
              )}

            </div>

          </div>

          <div>

            <div className="flex items-center gap-2 mb-2">

              <span className="w-6 h-6 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center text-xs">
                ✕
              </span>

              <span className="text-xs font-bold text-rose-600 tracking-wide uppercase">
                Potential Differences
              </span>

            </div>

            <div className="flex flex-wrap gap-2">

              {cons.length > 0 ? (
                cons.map(
                  (con, index) => (
                    <span
                      key={index}
                      className="text-xs bg-rose-50 border border-rose-100 text-rose-700 px-2.5 py-1.5 rounded-lg font-medium"
                    >
                      ✕ {con}
                    </span>
                  )
                )
              ) : (
                <span className="text-xs text-slate-400">
                  No major differences listed
                </span>
              )}

            </div>

          </div>

        </div>

      </div>

      <div className="flex flex-col sm:flex-row gap-3">

        <button
          type="button"
          onClick={handleViewProfile}
          className="flex-1 bg-white border border-indigo-200 text-indigo-600 font-semibold py-2.5 rounded-xl hover:bg-indigo-50 transition-colors"
        >
          View Profile
        </button>

        <button
          type="button"
          onClick={handleChat}
          className="flex-1 bg-indigo-500 text-white font-semibold py-2.5 rounded-xl hover:bg-indigo-600 transition-colors"
        >
          Connect & Chat
        </button>

      </div>

    </div>
  );
}

export default MatchCard;
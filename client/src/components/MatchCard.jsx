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
      return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    }

    if (score >= 60) {
      return 'bg-amber-100 text-amber-800 border-amber-300';
    }

    return 'bg-rose-100 text-rose-800 border-rose-300';
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
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">

      <div>
        <div className="flex items-center justify-between mb-4">

          <button
            type="button"
            onClick={handleViewProfile}
            className="flex items-center gap-3 min-w-0 text-left"
          >

            {profileImage ? (
              <img
                src={profileImage}
                alt={`${name || 'User'} profile`}
                className="w-14 h-14 rounded-full object-cover border border-slate-200 flex-shrink-0"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xl font-bold flex-shrink-0">
                {(name || 'U')
                  .charAt(0)
                  .toUpperCase()}
              </div>
            )}

            <div className="min-w-0">
              <h3 className="text-xl font-bold text-slate-800 truncate hover:text-indigo-600">
                {name}
              </h3>

              <p className="text-sm text-slate-500">
                {area} • ₹{budget}/month
              </p>
            </div>

          </button>

          <span
            className={`px-3 py-1 rounded-full text-sm font-bold border flex-shrink-0 ${getScoreColor(
              matchScore
            )}`}
          >
            {matchScore}% Match
          </span>

        </div>

        <p className="text-slate-600 text-sm mb-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
          "{summary}"
        </p>

        <div className="space-y-3 mb-6">

          <div>
            <span className="text-xs font-bold text-emerald-600 tracking-wide uppercase">
              Matching Habits
            </span>

            <div className="flex flex-wrap gap-2 mt-1">
              {pros.map(
                (pro, index) => (
                  <span
                    key={index}
                    className="text-xs bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md font-medium"
                  >
                    ✓ {pro}
                  </span>
                )
              )}
            </div>
          </div>

          <div>
            <span className="text-xs font-bold text-rose-600 tracking-wide uppercase">
              Potential Differences
            </span>

            <div className="flex flex-wrap gap-2 mt-1">
              {cons.map(
                (con, index) => (
                  <span
                    key={index}
                    className="text-xs bg-rose-50 text-rose-700 px-2.5 py-1 rounded-md font-medium"
                  >
                    ✕ {con}
                  </span>
                )
              )}
            </div>
          </div>

        </div>
      </div>

      <div className="flex gap-3">

        <button
          type="button"
          onClick={handleViewProfile}
          className="flex-1 bg-indigo-600 text-white font-medium py-2.5 rounded-xl hover:bg-indigo-700 transition-colors"
        >
          View Profile
        </button>

        <button
          type="button"
          onClick={handleChat}
          className="flex-1 bg-slate-900 text-white font-medium py-2.5 rounded-xl hover:bg-slate-800 transition-colors"
        >
          Connect & Chat
        </button>

      </div>

    </div>
  );
}

export default MatchCard;
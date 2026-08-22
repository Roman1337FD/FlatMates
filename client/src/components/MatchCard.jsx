function MatchCard({ matchData }) {
  const { name, area, budget, matchScore, pros, cons, summary } = matchData;

  const getScoreColor = (score) => {
    if (score >= 80) return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    if (score >= 60) return 'bg-amber-100 text-amber-800 border-amber-300';
    return 'bg-rose-100 text-rose-800 border-rose-300';
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-slate-800">{name}</h3>
            <p className="text-sm text-slate-500">{area} • ₹{budget}/month</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-bold border ${getScoreColor(matchScore)}`}>
            {matchScore}% Match
          </span>
        </div>

        <p className="text-slate-600 text-sm mb-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
          "{summary}"
        </p>

        <div className="space-y-3 mb-6">
          <div>
            <span className="text-xs font-bold text-emerald-600 tracking-wide uppercase">Matching Habits</span>
            <div className="flex flex-wrap gap-2 mt-1">
              {pros.map((pro, index) => (
                <span key={index} className="text-xs bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md font-medium">
                  ✓ {pro}
                </span>
              ))}
            </div>
          </div>

          <div>
            <span className="text-xs font-bold text-rose-600 tracking-wide uppercase">Potential Differences</span>
            <div className="flex flex-wrap gap-2 mt-1">
              {cons.map((con, index) => (
                <span key={index} className="text-xs bg-rose-50 text-rose-700 px-2.5 py-1 rounded-md font-medium">
                  ✕ {con}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <button className="w-full bg-slate-900 text-white font-medium py-2.5 rounded-xl hover:bg-slate-800 transition-colors">
        Connect & Chat
      </button>
    </div>
  );
}

export default MatchCard;
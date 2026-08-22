import MatchCard from '../components/MatchCard';

function Listings() {
  const mockMatches = [
    {
      id: 1,
      name: 'Rohan Sharma',
      area: 'Knowledge Park II',
      budget: '8,500',
      matchScore: 88,
      summary: 'High compatibility! Both prefer late-night study hours and pure vegetarian meals.',
      pros: ['Night Owl', 'Pure Veg', 'Non-Smoker'],
      cons: ['Slightly higher budget preference']
    },
    {
      id: 2,
      name: 'Aman Verma',
      area: 'Pari Chowk',
      budget: '7,000',
      matchScore: 65,
      summary: 'Moderate compatibility. Similar budget, but sleep schedules might clash.',
      pros: ['Budget match', 'Non-Smoker'],
      cons: ['Early Bird vs Night Owl']
    }
  ];

  return (
    <div className="py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Compatible Flatmates in Greater Noida</h2>
          <p className="text-slate-500 text-sm">AI analyzed profiles based on your lifestyle preferences.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {mockMatches.map((match) => (
          <MatchCard key={match.id} matchData={match} />
        ))}
      </div>
    </div>
  );
}

export default Listings;
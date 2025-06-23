import { useEffect, useState } from 'react';
import PageHeader from '../components/common/PageHeader';
import fixturesData from '../data/fixtures.json';
import { VZ_FIXTURES_KEY } from '../utils/storageKeys';
import { formatDate } from '../utils/helpers';

interface Fixture {
  id: string;
  date: string;
  opponent: string;
  location: string;
  competition: string;
}

const Calendario = () => {
  const [fixtures, setFixtures] = useState<Fixture[]>([]);

  useEffect(() => {
    const json = localStorage.getItem(VZ_FIXTURES_KEY);
    if (json) {
      setFixtures(JSON.parse(json));
    } else {
      localStorage.setItem(VZ_FIXTURES_KEY, JSON.stringify(fixturesData));
      setFixtures(fixturesData as Fixture[]);
    }
  }, []);

  return (
    <div>
      <PageHeader
        title="Calendario"
        subtitle="Próximos partidos y eventos programados."
      />
      <div className="container mx-auto px-4 py-8 space-y-4">
        {fixtures.map(match => (
          <div key={match.id} className="card p-4 flex justify-between items-center">
            <div>
              <h3 className="font-bold">{match.competition}</h3>
              <p className="text-sm text-gray-400">
                {formatDate(match.date)} • {match.location === 'home' ? 'Local' : 'Visitante'}
              </p>
            </div>
            <span className="text-primary font-medium">{match.opponent}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Calendario;

import { useParams, Link } from 'react-router-dom';
import { Trophy, ChevronLeft, Calendar, Award, Medal, Star, Users, Briefcase } from 'lucide-react';
import PageHeader from '../components/common/PageHeader';
import { useDataStore } from '../store/dataStore';

const ClubPalmares = () => {
  const { clubName } = useParams<{ clubName: string }>();
  const { clubs } = useDataStore();

  // Find club by slug
  const club = clubs.find(c => c.name.toLowerCase().replace(/\s+/g, '-') === clubName);

  if (!club) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Club no encontrado</h2>
        <p className="text-gray-400 mb-8">El club que estás buscando no existe o ha sido eliminado.</p>
        <Link to="/liga-master" className="btn-primary">
          Volver a Liga Master
        </Link>
      </div>
    );
  }

  const titles = club.titles || [];
  const sortedTitles = [...titles].sort((a, b) => b.year - a.year);

  const getTrophyIcon = (type: string) => {
    switch (type) {
      case 'league':
        return <Trophy size={40} className="text-yellow-400" />;
      case 'cup':
        return <Award size={40} className="text-blue-400" />;
      case 'supercup':
        return <Medal size={40} className="text-purple-400" />;
      default:
        return <Star size={40} className="text-primary" />;
    }
  };

  const getTrophyColor = (type: string) => {
    switch (type) {
      case 'league':
        return 'from-yellow-500/20 to-yellow-600/10 border-yellow-500/30 hover:border-yellow-500/50 shadow-yellow-500/10';
      case 'cup':
        return 'from-blue-500/20 to-blue-600/10 border-blue-500/30 hover:border-blue-500/50 shadow-blue-500/10';
      case 'supercup':
        return 'from-purple-500/20 to-purple-600/10 border-purple-500/30 hover:border-purple-500/50 shadow-purple-500/10';
      default:
        return 'from-primary/20 to-primary/10 border-primary/30 hover:border-primary/50 shadow-primary/10';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'league':
        return 'Liga';
      case 'cup':
        return 'Copa';
      case 'supercup':
        return 'Supercopa';
      default:
        return 'Otro';
    }
  };

  // Group titles by year
  const titlesByYear = sortedTitles.reduce((acc, title) => {
    if (!acc[title.year]) {
      acc[title.year] = [];
    }
    acc[title.year].push(title);
    return acc;
  }, {} as Record<number, typeof titles>);

  const years = Object.keys(titlesByYear)
    .map(Number)
    .sort((a, b) => b - a);

  return (
    <div>
      <PageHeader
        title="Palmarés"
        subtitle={`Títulos y trofeos conquistados por ${club.name}`}
        image="https://images.unsplash.com/photo-1512242712282-774a8bc0d9d3?ixid=M3w3MjUzNDh8MHwxfHNlYXJjaHwyfHxlc3BvcnRzJTIwZ2FtaW5nJTIwdG91cm5hbWVudCUyMGRhcmslMjBuZW9ufGVufDB8fHx8MTc0NzE3MzUxNHww&ixlib=rb-4.1.0"
      />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link
            to={`/liga-master/club/${clubName}`}
            className="inline-flex items-center text-primary hover:text-primary-light"
          >
            <ChevronLeft size={16} className="mr-1" />
            <span>Volver al perfil del club</span>
          </Link>
        </div>

        {/* Club Info Card */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-850 rounded-xl p-6 mb-8 border border-gray-700/50 shadow-xl backdrop-blur-sm">
          <div className="flex items-center gap-6">
            <img
              src={club.logo}
              alt={club.name}
              className="w-20 h-20 object-contain rounded-xl bg-gray-800/50 p-2"
            />
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">{club.name}</h2>
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Trophy size={18} className="text-yellow-400" />
                  <span className="text-gray-300">
                    <span className="text-white font-bold text-lg">{titles.length}</span> títulos
                  </span>
                </div>
                <div className="text-gray-400">
                  Fundado en <span className="text-white font-medium">{club.foundedYear}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Titles Display */}
        {titles.length > 0 ? (
          <div className="space-y-8">
            {years.map((year) => (
              <div key={year} className="bg-gradient-to-br from-gray-800 to-gray-850 rounded-xl p-6 border border-gray-700/50 shadow-xl backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-700/50">
                  <Calendar size={24} className="text-primary" />
                  <h3 className="text-2xl font-bold text-white">{year}</h3>
                  <span className="px-3 py-1 bg-primary/20 text-primary text-sm font-semibold rounded-lg border border-primary/30">
                    {titlesByYear[year].length} {titlesByYear[year].length === 1 ? 'título' : 'títulos'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {titlesByYear[year].map((title, index) => (
                    <div
                      key={title.id || index}
                      className={`group relative bg-gradient-to-br ${getTrophyColor(title.type)} rounded-xl p-6 border transition-all duration-300 hover:scale-105 hover:shadow-lg backdrop-blur-sm overflow-hidden`}
                    >
                      {/* Efecto de brillo animado */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

                      <div className="relative z-10">
                        <div className="flex items-start justify-between mb-4">
                          <div className="p-3 bg-gray-800/50 rounded-lg border border-gray-700/50 group-hover:bg-gray-700/70 transition-colors duration-300">
                            {getTrophyIcon(title.type)}
                          </div>
                          <span className="px-2 py-1 bg-gray-800/70 text-gray-300 text-xs font-semibold rounded border border-gray-700/50">
                            {getTypeLabel(title.type)}
                          </span>
                        </div>
                        <h4 className="text-xl font-bold text-white mb-2 group-hover:text-gray-100 transition-colors duration-300">
                          {title.name}
                        </h4>
                        <div className="flex items-center gap-2 text-gray-300">
                          <Calendar size={16} className="text-gray-400" />
                          <span className="text-sm font-medium">{title.year}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gradient-to-br from-gray-800 to-gray-850 rounded-xl p-12 text-center border border-gray-700/50 shadow-xl backdrop-blur-sm">
            <div className="mb-6">
              <Trophy size={80} className="text-gray-600 mx-auto opacity-50" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-400 mb-3">Sin títulos aún</h3>
            <p className="text-gray-500 text-base max-w-md mx-auto">
              {club.name} aún no ha conquistado ningún trofeo. Los títulos aparecerán aquí cuando se consigan.
            </p>
          </div>
        )}

        {/* Quick Links */}
        <div className="mt-8 flex flex-wrap gap-4 justify-center">
          <Link
            to={`/liga-master/club/${clubName}/plantilla`}
            className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors duration-200 flex items-center gap-2"
          >
            <Users size={18} />
            <span>Ver Plantilla</span>
          </Link>
          <Link
            to={`/liga-master/club/${clubName}/finanzas`}
            className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors duration-200 flex items-center gap-2"
          >
            <Briefcase size={18} />
            <span>Ver Finanzas</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ClubPalmares;


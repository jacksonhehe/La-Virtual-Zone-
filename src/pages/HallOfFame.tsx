import { useState } from 'react';
import { useDataStore } from '../store/dataStore';
import { Link } from 'react-router-dom';
import { Award, ChevronLeft, Star, Shield, Trophy } from 'lucide-react';
import PageHeader from '../components/common/PageHeader';

const HallOfFame = () => {
  const [activeSection, setActiveSection] = useState('clubs');
  const { clubs } = useDataStore();
  
  // Mock legendary clubs
  const legendaryClubs = [
    {
      id: '1',
      name: 'Rayo Digital FC',
      logo: 'https://ui-avatars.com/api/?name=RD&background=ef4444&color=fff&size=128&bold=true',
      manager: 'admin',
      foundedYear: 2023,
      description: 'Club fundador y bicampeón de la Liga Master. Conocido por su estilo de juego ofensivo y dinámico.',
      titles: [
        { name: 'Liga Master', year: 2023, type: 'league' },
        { name: 'Copa PES', year: 2024, type: 'cup' }
      ],
      seasons: 3
    },
    {
      id: '2',
      name: 'Neón FC',
      logo: 'https://ui-avatars.com/api/?name=NFC&background=ec4899&color=fff&size=128&bold=true',
      manager: 'DT Neon',
      foundedYear: 2023,
      description: 'Conocidos por sus espectaculares fichajes y juego vistoso. Campeones de la Liga Master 2024.',
      titles: [
        { name: 'Liga Master', year: 2024, type: 'league' }
      ],
      seasons: 2
    },
    {
      id: '3',
      name: 'Glitchers 404',
      logo: 'https://ui-avatars.com/api/?name=404&background=84cc16&color=fff&size=128&bold=true',
      manager: 'DT Glitch',
      foundedYear: 2023,
      description: 'Campeones de la primera Copa PES. Equipo caracterizado por su intensidad y presión alta.',
      titles: [
        { name: 'Copa PES', year: 2023, type: 'cup' }
      ],
      seasons: 3
    }
  ];
  
  // Mock legendary players
  const legendaryPlayers = [
    {
      id: '1',
      name: 'Carlos García',
      image: 'https://ui-avatars.com/api/?name=CG&background=1e293b&color=fff&size=128',
      position: 'ST',
      clubId: 'club1',
      nationality: 'España',
      activeYears: '2023-Presente',
      achievements: 'Máximo goleador histórico con 42 goles. Bicampeón de la Liga Master.',
      stats: { goals: 42, assists: 16, matches: 56 }
    },
    {
      id: '2',
      name: 'Diego López',
      image: 'https://ui-avatars.com/api/?name=DL&background=1e293b&color=fff&size=128',
      position: 'CAM',
      clubId: 'club4',
      nationality: 'Argentina',
      activeYears: '2023-Presente',
      achievements: 'MVP de la temporada 2024. Campeón de Liga Master.',
      stats: { goals: 28, assists: 35, matches: 53 }
    },
    {
      id: '3',
      name: 'Victor Pérez',
      image: 'https://ui-avatars.com/api/?name=VP&background=1e293b&color=fff&size=128',
      position: 'CB',
      clubId: 'club6',
      nationality: 'España',
      activeYears: '2023-Presente',
      achievements: 'Defensa del año en 2023 y 2024. Campeón de Copa.',
      stats: { goals: 8, assists: 4, matches: 58 }
    },
    {
      id: '4',
      name: 'Lucas Sánchez',
      image: 'https://ui-avatars.com/api/?name=LS&background=1e293b&color=fff&size=128',
      position: 'GK',
      clubId: 'club10',
      nationality: 'México',
      activeYears: '2023-Presente',
      achievements: 'Portero con más porterías a cero (24). Supercampeón 2023.',
      stats: { goals: 0, assists: 0, matches: 54, cleanSheets: 24 }
    },
    {
      id: '5',
      name: 'Marcos Rodríguez',
      image: 'https://ui-avatars.com/api/?name=MR&background=1e293b&color=fff&size=128',
      position: 'CDM',
      clubId: 'club2',
      nationality: 'Colombia',
      activeYears: '2023-Presente',
      achievements: 'Centrocampista con más recuperaciones. Finalista de Copa 2024.',
      stats: { goals: 12, assists: 18, matches: 52 }
    }
  ];

  const getClubName = (clubId: string) => {
    const club = clubs.find(c => c.id === clubId);
    return club ? club.name : 'Desconocido';
  };
  
  // Mock legendary managers
  const legendaryManagers = [
    {
      id: '1',
      name: 'admin',
      avatar: 'https://ui-avatars.com/api/?name=Admin&background=9f65fd&color=fff&size=128&bold=true',
      club: 'Rayo Digital FC',
      seasons: 3,
      titles: 2,
      winRate: 68,
      description: 'Administrador y entrenador del bicampeón Rayo Digital FC. Pionero del sistema 4-3-3 en la Liga Master.'
    },
    {
      id: '2',
      name: 'DT Neon',
      avatar: 'https://ui-avatars.com/api/?name=DT+Neon&background=ec4899&color=fff&size=128&bold=true',
      club: 'Neón FC',
      seasons: 2,
      titles: 1,
      winRate: 65,
      description: 'Ganador del título de Liga Master en su primera temporada completa. Conocido por su juego ofensivo.'
    },
    {
      id: '3',
      name: 'DT Glitch',
      avatar: 'https://ui-avatars.com/api/?name=DT+Glitch&background=84cc16&color=fff&size=128&bold=true',
      club: 'Glitchers 404',
      seasons: 3,
      titles: 1,
      winRate: 62,
      description: 'Campeón de la primera Copa PES. Su equipo es reconocido por su intensidad y presión.'
    }
  ];
  
  // Mock legendary moments
  const legendaryMoments = [
    {
      id: '1',
      title: 'Gol de chilena de Carlos García en la final 2023',
      date: '2023-05-30',
      image: 'https://images.unsplash.com/photo-1556856425-366d6618905d?ixid=M3w3MjUzNDh8MHwxfHNlYXJjaHwxfHxlc3BvcnRzJTIwZ2FtaW5nJTIwdG91cm5hbWVudCUyMGRhcmslMjBuZW9ufGVufDB8fHx8MTc0NzE3MzUxNHww&ixlib=rb-4.1.0',
      description: 'En el minuto 89, con el marcador 1-1, Carlos García anotó una espectacular chilena que dio el título de liga al Rayo Digital FC.'
    },
    {
      id: '2',
      title: 'Remontada histórica de Neón FC',
      date: '2024-03-15',
      image: 'https://images.unsplash.com/photo-1554290712-e640351074bd?ixid=M3w3MjUzNDh8MHwxfHNlYXJjaHwzfHxlc3BvcnRzJTIwZ2FtaW5nJTIwdG91cm5hbWVudCUyMGRhcmslMjBuZW9ufGVufDB8fHx8MTc0NzE3MzUxNHww&ixlib=rb-4.1.0',
      description: 'Perdiendo 3-0 al descanso, el Neón FC logró dar la vuelta al marcador para ganar 3-4 en el descuento y asegurar el título de liga.'
    },
    {
      id: '3',
      title: 'Parada triple de Lucas Sánchez',
      date: '2023-11-10',
      image: 'https://images.unsplash.com/photo-1544194215-541c2d3561a4?ixid=M3w3MjUzNDh8MHwxfHNlYXJjaHw1fHxlc3BvcnRzJTIwZ2FtaW5nJTIwdG91cm5hbWVudCUyMGRhcmslMjBuZW9ufGVufDB8fHx8MTc0NzE3MzUxNHww&ixlib=rb-4.1.0',
      description: 'El portero de Pixel Galaxy realizó tres paradas consecutivas en la misma jugada para mantener su portería a cero en la semifinal de copa.'
    }
  ];
  
  return (
    <div>
      <PageHeader 
        title="Salón de la Fama" 
        subtitle="Los clubes, jugadores, DTs y momentos legendarios de La Virtual Zone"
        image="https://images.unsplash.com/photo-1607853202273-797f1c22a38e?ixid=M3w3MjUzNDh8MHwxfHJhbmRvbXx8fHx8fHx8fDE3MjM5OTA2MjB8&ixlib=rb-4.0.3"
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link 
            to="/liga-master"
            className="inline-flex items-center text-primary hover:text-primary-light"
          >
            <ChevronLeft size={16} className="mr-1" />
            <span>Volver a Liga Master</span>
          </Link>
        </div>
        
        {/* Section tabs */}
        <div className="mb-8 overflow-x-auto">
          <div className="flex space-x-2 min-w-max">
            <button 
              onClick={() => setActiveSection('clubs')}
              className={`px-4 py-2 rounded-md whitespace-nowrap ${activeSection === 'clubs' ? 'bg-primary text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
            >
              <Award size={16} className="inline mr-2" />
              Clubes Legendarios
            </button>
            <button 
              onClick={() => setActiveSection('players')}
              className={`px-4 py-2 rounded-md whitespace-nowrap ${activeSection === 'players' ? 'bg-primary text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
            >
              <Star size={16} className="inline mr-2" />
              Jugadores Históricos
            </button>
            <button 
              onClick={() => setActiveSection('managers')}
              className={`px-4 py-2 rounded-md whitespace-nowrap ${activeSection === 'managers' ? 'bg-primary text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
            >
              <Shield size={16} className="inline mr-2" />
              DTs Exitosos
            </button>
            <button 
              onClick={() => setActiveSection('moments')}
              className={`px-4 py-2 rounded-md whitespace-nowrap ${activeSection === 'moments' ? 'bg-primary text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
            >
              <Trophy size={16} className="inline mr-2" />
              Momentos Legendarios
            </button>
          </div>
        </div>
        
        {/* Section content */}
        <div>
          {/* Legendary Clubs */}
          {activeSection === 'clubs' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold mb-6">Clubes Legendarios</h2>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {legendaryClubs.map(club => (
                  <div key={club.id} className="card overflow-hidden">
                    <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 text-center">
                      <img 
                        src={club.logo} 
                        alt={club.name}
                        className="w-24 h-24 mx-auto mb-4"
                      />
                      <h3 className="text-xl font-bold">{club.name}</h3>
                      <p className="text-gray-400">DT: {club.manager}</p>
                      <p className="text-gray-400 text-sm">Fundado: {club.foundedYear}</p>
                    </div>
                    
                    <div className="p-6">
                      <p className="text-gray-300 mb-4">
                        {club.description}
                      </p>
                      
                      <div className="mb-4">
                        <h4 className="font-bold mb-2">Títulos</h4>
                        <ul className="space-y-1">
                          {club.titles.map((title, index) => (
                            <li key={index} className="flex items-center">
                              <Trophy size={16} className="text-yellow-400 mr-2" />
                              <span>{title.name} {title.year}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="flex space-x-6 text-sm text-gray-400">
                        <div>
                          <span className="block font-bold text-white text-lg">{club.seasons}</span>
                          <span>Temporadas</span>
                        </div>
                        <div>
                          <span className="block font-bold text-white text-lg">{club.titles.length}</span>
                          <span>Títulos</span>
                        </div>
                      </div>
                      
                      <Link
                        to={`/liga-master/club/${club.slug}`}
                        className="btn-secondary w-full mt-4 text-center"
                      >
                        Ver Club
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Legendary Players */}
          {activeSection === 'players' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold mb-6">Jugadores Históricos</h2>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {legendaryPlayers.map(player => (
                  <div key={player.id} className="card overflow-hidden">
                    <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 flex items-center">
                      <img 
                        src={player.image} 
                        alt={player.name}
                        className="w-16 h-16 rounded-full mr-4"
                      />
                      <div>
                        <h3 className="text-xl font-bold">{player.name}</h3>
                        <div className="flex items-center space-x-2">
                          <span className={`inline-block px-2 py-0.5 rounded text-xs ${
                            player.position === 'GK' ? 'bg-yellow-500/20 text-yellow-400' :
                            ['CB', 'LB', 'RB'].includes(player.position) ? 'bg-blue-500/20 text-blue-400' :
                            ['CDM', 'CM', 'CAM'].includes(player.position) ? 'bg-green-500/20 text-green-400' :
                            'bg-red-500/20 text-red-400'
                          }`}>
                            {player.position}
                          </span>
                          <span className="text-gray-400">{player.nationality}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <div className="flex items-center mb-4">
                        <span className="text-gray-400 mr-1">Club:</span>
                        <span className="font-medium">{getClubName(player.clubId)}</span>
                      </div>
                      
                      <p className="text-gray-300 mb-4">
                        {player.achievements}
                      </p>
                      
                      <div className="grid grid-cols-3 gap-2 mb-4">
                        <div className="text-center p-2 bg-gray-800 rounded-lg">
                          <span className="block font-bold text-lg">{player.stats.goals}</span>
                          <span className="text-xs text-gray-400">Goles</span>
                        </div>
                        <div className="text-center p-2 bg-gray-800 rounded-lg">
                          <span className="block font-bold text-lg">{player.stats.assists}</span>
                          <span className="text-xs text-gray-400">Asistencias</span>
                        </div>
                        <div className="text-center p-2 bg-gray-800 rounded-lg">
                          <span className="block font-bold text-lg">{player.stats.matches}</span>
                          <span className="text-xs text-gray-400">Partidos</span>
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-400">
                        <span className="block mb-1">Años activo:</span>
                        <span className="font-medium text-white">{player.activeYears}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Legendary Managers */}
          {activeSection === 'managers' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold mb-6">DTs Exitosos</h2>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {legendaryManagers.map(manager => (
                  <div key={manager.id} className="card overflow-hidden">
                    <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 text-center">
                      <img 
                        src={manager.avatar} 
                        alt={manager.name}
                        className="w-24 h-24 rounded-full mx-auto mb-4 border-2 border-primary"
                      />
                      <h3 className="text-xl font-bold">{manager.name}</h3>
                      <p className="text-gray-400">
                        {manager.club}
                      </p>
                    </div>
                    
                    <div className="p-6">
                      <p className="text-gray-300 mb-4">
                        {manager.description}
                      </p>
                      
                      <div className="grid grid-cols-3 gap-2 mb-4">
                        <div className="text-center p-2 bg-gray-800 rounded-lg">
                          <span className="block font-bold text-lg">{manager.seasons}</span>
                          <span className="text-xs text-gray-400">Temporadas</span>
                        </div>
                        <div className="text-center p-2 bg-gray-800 rounded-lg">
                          <span className="block font-bold text-lg">{manager.titles}</span>
                          <span className="text-xs text-gray-400">Títulos</span>
                        </div>
                        <div className="text-center p-2 bg-gray-800 rounded-lg">
                          <span className="block font-bold text-lg">{manager.winRate}%</span>
                          <span className="text-xs text-gray-400">Victorias</span>
                        </div>
                      </div>
                      
                      <Link 
                        to={`/usuarios/${manager.name}`}
                        className="btn-secondary w-full mt-4 text-center"
                      >
                        Ver Perfil
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Legendary Moments */}
          {activeSection === 'moments' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold mb-6">Momentos Legendarios</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {legendaryMoments.map(moment => (
                  <div key={moment.id} className="card overflow-hidden">
                    <img 
                      src={moment.image} 
                      alt={moment.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-6">
                      <h3 className="text-xl font-bold mb-2">{moment.title}</h3>
                      <p className="text-gray-400 text-sm mb-4">{moment.date}</p>
                      <p className="text-gray-300">
                        {moment.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HallOfFame;
 
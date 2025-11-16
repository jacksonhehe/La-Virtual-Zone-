import { useEffect, useState } from 'react';
import  { Link } from 'react-router-dom';
import {
  Trophy,
  Users,
  TrendingUp,
  Calendar,
  Briefcase,
  Award,
  BarChart4,
  ChevronRight,
  Home,
  MapPin,
  Star,
  Crown,
  Medal,
  Shield
} from 'lucide-react';
import PageHeader from '../components/common/PageHeader';
import StatsCard from '../components/common/StatsCard';
import { useDataStore } from '../store/dataStore';
import { useAuthStore } from '../store/authStore';
import { formatDate, formatCurrency } from '../utils/format';
import {
  formatName,
  applyFilters,
  sortDts,
  getDtsStats,
  type Dt,
  type DtFilters
} from '../utils/dtsUtils';

const LigaMaster = () => {
  const { clubs, tournaments, players, standings, marketStatus } = useDataStore();
  const { user, hasRole } = useAuthStore();


  // Check if user is DT
  const isDT = hasRole('dt');


  // Get active tournament (Liga Master)
  const ligaMaster = tournaments.find(t => t.id === 'tournament1');
  
  // Check if user is DT and has a club assigned (via clubId)
  const userClub = hasRole('dt') && user?.clubId
    ? clubs.find(c => c.id === user.clubId)
    : null;
  
  // Get user's team position in standings
  const userTeamStanding = userClub 
    ? standings.find(s => s.clubId === userClub.id)
    : null;
  
  // Get captain (first player with captain property or highest rated player)
  const captain = userClub 
    ? players.filter(p => p.clubId === userClub.id).sort((a, b) => b.overall - a.overall)[0]
    : null;
  
  // Get next match for user's club
  const nextMatch = userClub && ligaMaster 
    ? ligaMaster.matches
        .filter(m => m.status === 'scheduled' && (m.homeTeam === userClub.name || m.awayTeam === userClub.name))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0]
    : null;

  // Mock formation
  const currentFormation = "4-3-3 Ofensivo";

  // Get squad size
  const squadSize = userClub ? players.filter(p => p.clubId === userClub.id).length : 0;

  

  // If user is DT, show personalized dashboard
  if (isDT && userClub) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          {/* Welcome Banner */}
          <div className="bg-gradient-to-r from-gray-800 to-gray-850 rounded-xl p-8 mb-10 border border-gray-700/50 shadow-lg backdrop-blur-sm">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-3 h-3 bg-green-400 rounded-full shadow-lg shadow-green-400/20"></div>
              <span className="text-green-400 font-semibold text-sm tracking-wide">EN VIVO</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 tracking-tight">
              ¡Bienvenido de vuelta, {user.username}!
            </h1>
            <p className="text-gray-300 text-lg leading-relaxed">
              Lleva a {userClub.name} a conquistar la Liga Master y haz historia
            </p>
          </div> 

          {/* Club Header */}
          <div className="bg-gradient-to-r from-gray-800 to-gray-850 rounded-xl p-8 mb-10 border border-gray-700/50 shadow-xl backdrop-blur-sm">
            <div className="flex flex-col md:flex-row items-start md:items-center space-y-6 md:space-y-0">
              <div className="flex items-center space-x-6 flex-1">
                <div className="relative group">
                  <img
                    src={userClub.logo}
                    alt={userClub.name}
                    className="relative w-20 h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 object-contain rounded-xl bg-gray-800/50 p-0.5 shadow-lg group-hover:shadow-primary/30 group-hover:scale-105 transition-all duration-300"
                  />
                </div>
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent mb-3 tracking-tight drop-shadow-sm">{userClub.name}</h2>
                  <div className="flex flex-wrap items-center gap-4 mb-4">
                    <div className="flex items-center space-x-2">
                      <Users size={18} className="text-primary" />
                      <span className="text-gray-300 font-medium">DT: {user.username}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Briefcase size={18} className="text-green-400" />
                      <span className="text-green-400 font-bold text-lg">{formatCurrency(userClub.budget)}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="px-4 py-2 bg-gradient-to-r from-primary/20 to-primary/10 text-primary text-xs font-bold rounded-lg border border-primary/20 shadow-md">
                      ACTIVO
                    </span>
                    <span className="px-4 py-2 bg-gradient-to-r from-blue-500/20 to-blue-400/10 text-blue-400 text-xs font-bold rounded-lg border border-blue-400/20 shadow-md">
                      TEMPORADA 2025
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div> 
          
                   {/* Quick Access Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            <Link
              to={`/liga-master/club/${userClub.name.toLowerCase().replace(/\s+/g, '-')}/plantilla`}
              className="group bg-gradient-to-br from-gray-800 to-gray-850 rounded-xl p-6 border border-gray-700/50 hover:border-blue-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 hover:scale-[1.02] backdrop-blur-sm"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-blue-500/20 to-blue-600/10 rounded-lg border border-blue-500/20 group-hover:bg-blue-500/30 transition-colors duration-300">
                  <Users size={28} className="text-blue-400 group-hover:text-blue-300 transition-colors duration-300" />
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-white group-hover:text-blue-100 transition-colors duration-300">{squadSize}</p>
                  <p className="text-blue-300 text-sm font-medium">Jugadores</p>
                </div>
              </div>
              <h3 className="text-xl font-bold mb-3 text-white group-hover:text-blue-100 transition-colors duration-300">Plantilla</h3>
              {captain && (
                <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-gray-700/50 to-gray-600/50 rounded-lg border border-gray-600/30">
                  <img
                    src={captain.image}
                    alt={captain.name}
                    className="w-8 h-8 rounded-full object-cover border-2 border-blue-400/30"
                  />
                  <div>
                    <p className="text-sm font-semibold text-white">Capitán: {captain.name}</p>
                    <p className="text-blue-300 text-xs font-medium">Media: {captain.overall}</p>
                  </div>
                </div>
              )}
            </Link>
            
            <Link
              to="/liga-master/tablas-mercado"
              className="group bg-gradient-to-br from-gray-800 to-gray-850 rounded-xl p-6 border border-gray-700/50 hover:border-emerald-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/10 hover:scale-[1.02] backdrop-blur-sm"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 rounded-lg border border-emerald-500/20 group-hover:bg-emerald-500/30 transition-colors duration-300">
                  <BarChart4 size={28} className="text-emerald-400 group-hover:text-emerald-300 transition-colors duration-300" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-gradient-to-r from-emerald-500/20 to-emerald-400/10 text-emerald-300 rounded-lg text-xs font-semibold border border-emerald-500/20">
                    OFICIAL
                  </span>
                </div>
              </div>
              <h3 className="text-xl font-bold mb-3 text-white group-hover:text-emerald-100 transition-colors duration-300">Tablas de Mercado</h3>
              <div className="p-3 bg-gradient-to-r from-gray-700/50 to-gray-600/50 rounded-lg border border-gray-600/30">
                <p className="text-emerald-300 text-sm font-medium">Referencias oficiales 2025</p>
                <p className="text-emerald-400/70 text-xs mt-1">Valores, sueldos y bonos</p>
              </div>
            </Link>

            <Link
              to="/liga-master/comunidad-dt"
              className="group bg-gradient-to-br from-gray-800 to-gray-850 rounded-xl p-6 border border-gray-700/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:scale-[1.02] backdrop-blur-sm"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg border border-primary/20 group-hover:bg-primary/30 transition-colors duration-300">
                  <Crown size={28} className="text-primary group-hover:text-primary/90 transition-colors duration-300" />
                </div>
                <div className="text-right">
                  <span className="px-3 py-1 bg-gradient-to-r from-primary/20 to-primary/10 text-primary text-xs font-semibold rounded-lg border border-primary/20">
                    VER
                  </span>
                </div>
              </div>
              <h3 className="text-xl font-bold mb-3 text-white group-hover:text-primary/90 transition-colors duration-300">Comunidad DT</h3>
              <div className="p-3 bg-gradient-to-r from-gray-700/50 to-gray-600/50 rounded-lg border border-gray-600/30">
                <p className="text-primary font-semibold">DT's Oficiales LVZ</p>
                <p className="text-primary/70 text-xs mt-1">Directores Técnicos certificados</p>
              </div>
            </Link>

            <Link
              to={`/liga-master/club/${userClub.name.toLowerCase().replace(/\s+/g, '-')}/finanzas`}
              className="group bg-gradient-to-br from-gray-800 to-gray-850 rounded-xl p-6 border border-gray-700/50 hover:border-yellow-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-yellow-500/10 hover:scale-[1.02] backdrop-blur-sm"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 rounded-lg border border-yellow-500/20 group-hover:bg-yellow-500/30 transition-colors duration-300">
                  <Briefcase size={28} className="text-yellow-400 group-hover:text-yellow-300 transition-colors duration-300" />
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-white group-hover:text-yellow-100 transition-colors duration-300">{formatCurrency(userClub.budget)}</p>
                  <p className="text-yellow-300 text-sm font-medium">Disponible</p>
                </div>
              </div>
              <h3 className="text-xl font-bold mb-3 text-white group-hover:text-yellow-100 transition-colors duration-300">Finanzas</h3>
              <div className="p-3 bg-gradient-to-r from-gray-700/50 to-gray-600/50 rounded-lg border border-gray-600/30">
                <p className="text-yellow-300 text-sm font-medium">Estado: Saludable</p>
              </div>
            </Link>

            <Link
              to="/liga-master/mercado"
              className="group bg-gradient-to-br from-gray-800 to-gray-850 rounded-xl p-6 border border-gray-700/50 hover:border-purple-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10 hover:scale-[1.02] backdrop-blur-sm"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-purple-500/20 to-purple-600/10 rounded-lg border border-purple-500/20 group-hover:bg-purple-500/30 transition-colors duration-300">
                  <TrendingUp size={28} className="text-purple-400 group-hover:text-purple-300 transition-colors duration-300" />
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 text-xs font-semibold rounded-lg border ${
                    marketStatus
                      ? 'bg-gradient-to-r from-green-500/20 to-green-400/10 text-green-400 border-green-500/20'
                      : 'bg-gradient-to-r from-red-500/20 to-red-400/10 text-red-400 border-red-500/20'
                  }`}>
                    {marketStatus ? 'ABIERTO' : 'CERRADO'}
                  </span>
                </div>
              </div>
              <h3 className="text-xl font-bold mb-3 text-white group-hover:text-purple-100 transition-colors duration-300">Mercado</h3>
              <div className="p-3 bg-gradient-to-r from-gray-700/50 to-gray-600/50 rounded-lg border border-gray-600/30">
                <p className="text-purple-300 text-sm font-medium">Fichajes y ventas</p>
              </div>
            </Link>

            <Link
              to="/liga-master/zonas"
              className="group bg-gradient-to-br from-gray-800 to-gray-850 rounded-xl p-6 border border-gray-700/50 hover:border-green-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/10 hover:scale-[1.02] backdrop-blur-sm"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-green-500/20 to-green-600/10 rounded-lg border border-green-500/20 group-hover:bg-green-500/30 transition-colors duration-300">
                  <BarChart4 size={28} className="text-green-400 group-hover:text-green-300 transition-colors duration-300" />
                </div>
                <div className="text-right">
                  <span className="px-3 py-1 bg-gradient-to-r from-green-500/20 to-green-400/10 text-green-400 text-xs font-semibold rounded-lg border border-green-500/20">
                    4 LIGAS
                  </span>
                </div>
              </div>
              <h3 className="text-xl font-bold mb-3 text-white group-hover:text-green-100 transition-colors duration-300">Zonas</h3>
              <div className="p-3 bg-gradient-to-r from-gray-700/50 to-gray-600/50 rounded-lg border border-gray-600/30">
                <p className="text-green-300 text-sm font-medium">Clasificaciones por zonas</p>
              </div>
            </Link>

            <Link
              to="/liga-master/fixture"
              className="group bg-gradient-to-br from-gray-800 to-gray-850 rounded-xl p-6 border border-gray-700/50 hover:border-orange-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/10 hover:scale-[1.02] backdrop-blur-sm"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-orange-500/20 to-orange-600/10 rounded-lg border border-orange-500/20 group-hover:bg-orange-500/30 transition-colors duration-300">
                  <Calendar size={28} className="text-orange-400 group-hover:text-orange-300 transition-colors duration-300" />
                </div>
                <div className="text-right">
                  {nextMatch && (
                    <span className="px-3 py-1 bg-gradient-to-r from-orange-500/20 to-orange-400/10 text-orange-400 text-xs font-semibold rounded-lg border border-orange-500/20">
                      J{nextMatch.round}
                    </span>
                  )}
                </div>
              </div>
              <h3 className="text-xl font-bold mb-3 text-white group-hover:text-orange-100 transition-colors duration-300">Fixture y Resultados</h3>
              <div className="p-3 bg-gradient-to-r from-gray-700/50 to-gray-600/50 rounded-lg border border-gray-600/30">
                <p className="text-orange-300 text-sm font-medium">Calendario de partidos</p>
                {nextMatch && (
                  <p className="text-orange-400/70 text-xs mt-1">Próximo: {formatDate(nextMatch.date)}</p>
                )}
              </div>
            </Link>

            <Link
              to={`/liga-master/club/${userClub.name.toLowerCase().replace(/\s+/g, '-')}/palmares`}
              className="group bg-gradient-to-br from-gray-800 to-gray-850 rounded-xl p-6 border border-gray-700/50 hover:border-yellow-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-yellow-500/10 hover:scale-[1.02] backdrop-blur-sm"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 rounded-lg border border-yellow-500/20 group-hover:bg-yellow-500/30 transition-colors duration-300">
                  <Trophy size={28} className="text-yellow-400 group-hover:text-yellow-300 transition-colors duration-300" />
                </div>
                <div className="text-right">
                  {userClub.titles && userClub.titles.length > 0 && (
                    <p className="text-2xl font-bold text-white group-hover:text-yellow-100 transition-colors duration-300">{userClub.titles.length}</p>
                  )}
                  <p className="text-yellow-300 text-sm font-medium">Títulos</p>
                </div>
              </div>
              <h3 className="text-xl font-bold mb-3 text-white group-hover:text-yellow-100 transition-colors duration-300">Palmarés</h3>
              <div className="p-3 bg-gradient-to-r from-gray-700/50 to-gray-600/50 rounded-lg border border-gray-600/30">
                <p className="text-yellow-300 text-sm font-medium">Trofeos conquistados</p>
                {userClub.titles && userClub.titles.length > 0 ? (
                  <p className="text-yellow-400/70 text-xs mt-1">{userClub.titles.length} {userClub.titles.length === 1 ? 'trofeo' : 'trofeos'}</p>
                ) : (
                  <p className="text-yellow-400/70 text-xs mt-1">Sin títulos aún</p>
                )}
              </div>
            </Link>
          </div>


          {/* Next Match */}
          {nextMatch && (
            <div className="bg-gradient-to-r from-gray-800 to-gray-850 rounded-xl p-8 mb-10 border border-gray-700/50 shadow-lg backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <div className="p-4 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl border border-primary/20 shadow-md">
                    {nextMatch.homeTeam === userClub.name ? (
                      <Home size={24} className="text-primary" />
                    ) : (
                      <MapPin size={24} className="text-blue-400" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="px-3 py-1 bg-gradient-to-r from-red-500/20 to-red-400/10 text-red-400 text-xs font-semibold rounded-lg border border-red-500/20">
                        PRÓXIMO PARTIDO
                      </span>
                      <span className="text-sm text-gray-400 font-medium">Jornada {nextMatch.round}</span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2 tracking-tight">
                      {nextMatch.homeTeam === userClub.name ? nextMatch.awayTeam : nextMatch.homeTeam}
                    </h3>
                    <p className="text-gray-300 text-base">
                      {formatDate(nextMatch.date)} •
                      {nextMatch.homeTeam === userClub.name ? ' Local' : ' Visitante'}
                    </p>
                  </div>
                </div>
                <Link
                  to="/liga-master/fixture"
                  className="bg-gradient-to-r from-primary/20 to-primary/10 border border-primary/30 text-primary px-6 py-3 rounded-lg hover:bg-primary/30 hover:border-primary/40 transition-all duration-300 flex items-center space-x-2 font-medium shadow-md hover:shadow-primary/20"
                >
                  <Calendar size={18} />
                  <span>Ver Fixture</span>
                  <ChevronRight size={18} />
                </Link>
              </div>
            </div>
          )} 
          
                   {/* Stats Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="group bg-gradient-to-br from-gray-800 to-gray-850 rounded-xl p-6 text-center border border-gray-700/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:scale-105 backdrop-blur-sm">
              <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4 border border-primary/20 group-hover:bg-primary/30 transition-colors duration-300">
                <Trophy size={24} className="text-primary group-hover:text-primary/90 transition-colors duration-300" />
              </div>
              <p className="text-3xl font-bold text-primary mb-3 group-hover:text-primary/90 transition-colors duration-300">
                {userTeamStanding ? userTeamStanding.position || standings.findIndex(s => s.clubId === userClub.id) + 1 : 'N/A'}°
              </p>
              <p className="text-gray-400 text-sm font-medium">Posición en tabla</p>
            </div>

            <div className="group bg-gradient-to-br from-gray-800 to-gray-850 rounded-xl p-6 text-center border border-gray-700/50 hover:border-green-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/10 hover:scale-105 backdrop-blur-sm">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500/20 to-green-600/10 rounded-xl flex items-center justify-center mx-auto mb-4 border border-green-500/20 group-hover:bg-green-500/30 transition-colors duration-300">
                <BarChart4 size={24} className="text-green-400 group-hover:text-green-300 transition-colors duration-300" />
              </div>
              <p className="text-3xl font-bold text-green-400 mb-3 group-hover:text-green-300 transition-colors duration-300">
                {userTeamStanding ? userTeamStanding.goalsFor : 0}
              </p>
              <p className="text-gray-400 text-sm font-medium">Goles a favor</p>
            </div>

            <div className="group bg-gradient-to-br from-gray-800 to-gray-850 rounded-xl p-6 text-center border border-gray-700/50 hover:border-red-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-red-500/10 hover:scale-105 backdrop-blur-sm">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500/20 to-red-600/10 rounded-xl flex items-center justify-center mx-auto mb-4 border border-red-500/20 group-hover:bg-red-500/30 transition-colors duration-300">
                <BarChart4 size={24} className="text-red-400 group-hover:text-red-300 transition-colors duration-300" />
              </div>
              <p className="text-3xl font-bold text-red-400 mb-3 group-hover:text-red-300 transition-colors duration-300">
                {userTeamStanding ? userTeamStanding.goalsAgainst : 0}
              </p>
              <p className="text-gray-400 text-sm font-medium">Goles en contra</p>
            </div>
          </div>

          {/* Footer Links */}
          <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-400">
            <Link to="/liga-master/reglamento" className="hover:text-primary">Reglamento</Link>
            <Link to="/liga-master/hall-of-fame" className="hover:text-primary">Salón de la Fama</Link>
            <Link to="/liga-master/pretemporada" className="hover:text-primary">Pretemporada</Link>
            <Link to="/ayuda" className="hover:text-primary">Ayuda</Link>
          </div>
        </div>
      </div>
    );
  }

  const isLoggedIn = Boolean(user);

  // Default view for non-DT users
  return (
    <div>
      <PageHeader 
        title="Liga Master 2025" 
        subtitle="La competición principal de La Virtual Zone. Liga regular con enfrentamientos ida y vuelta entre los 10 equipos participantes."
        image="https://images.unsplash.com/photo-1511447333015-45b65e60f6d5?ixid=M3w3MjUzNDh8MHwxfHNlYXJjaHw2fHxlc3BvcnRzJTIwZ2FtaW5nJTIwdG91cm5hbWVudCUyMGRhcmslMjBuZW9ufGVufDB8fHx8MTc0NzE3MzUxNHww&ixlib=rb-4.1.0"
      />
      <div className="container mx-auto px-4 py-8">

        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard 
            title="Total de Clubes" 
            value={clubs.length}
            icon={<Users size={24} className="text-primary" />}
          />
          <StatsCard 
            title="Estado del Mercado" 
            value={marketStatus ? "Abierto" : "Cerrado"}
            icon={<TrendingUp size={24} className={marketStatus ? "text-green-400" : "text-red-400"} />}
          />
          <StatsCard 
            title="Presupuesto Medio" 
            value={formatCurrency(clubs.reduce((sum, club) => sum + club.budget, 0) / clubs.length)}
            icon={<Briefcase size={24} className="text-primary" />}
          />
          <StatsCard 
            title="Partidos Disputados" 
            value={ligaMaster ? ligaMaster.matches.filter(m => m.status === 'finished').length : 0}
            icon={<Calendar size={24} className="text-primary" />}
            trend="up"
            trendValue="+3 última semana"
          />
        </div>

        {/* Información educativa para usuarios no logueados */}
        {!isLoggedIn && (
          <div className="space-y-8 mb-12">
            {/* ¿Qué es la Liga Master? */}
            <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
              <div className="flex items-start gap-4">
                <Trophy size={24} className="text-primary mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">¿Qué es la Liga Master?</h3>
                  <p className="text-gray-400 mb-3">
                    La Liga Master es la competición oficial de fútbol virtual de La Virtual Zone, donde los Directores Técnicos
                    gestionan sus clubes profesionales, compiten por el título y forman parte de la élite del fútbol virtual.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-gray-400">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span>Competición semanal con 12 equipos</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <span>Sistema de ascensos y descensos</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                      <span>Mercado de fichajes activo</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                      <span>Estadísticas y rankings en tiempo real</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Cómo funciona */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                <Users size={20} className="text-primary mb-3" />
                <h4 className="text-lg font-bold text-white mb-2">Gestión de Club</h4>
                <p className="text-gray-400 text-sm">
                  Como Director Técnico, tendrás control total sobre tu club: plantilla de 23 jugadores,
                  tácticas, formación y estrategia de partido.
                </p>
              </div>

              <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                <TrendingUp size={20} className="text-green-400 mb-3" />
                <h4 className="text-lg font-bold text-white mb-2">Mercado de Fichajes</h4>
                <p className="text-gray-400 text-sm">
                  Compra y vende jugadores en el mercado abierto. Mejora tu plantilla con fichajes
                  estratégicos y vende excedentes para financiar tu proyecto.
                </p>
              </div>

              <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                <Calendar size={20} className="text-blue-400 mb-3" />
                <h4 className="text-lg font-bold text-white mb-2">Competición Semanal</h4>
                <p className="text-gray-400 text-sm">
                  Partidos cada semana contra otros DT. La Liga Master consta de 22 jornadas
                  con sistema de puntos y clasificación final.
                </p>
              </div>

              <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                <BarChart4 size={20} className="text-purple-400 mb-3" />
                <h4 className="text-lg font-bold text-white mb-2">Estadísticas Avanzadas</h4>
                <p className="text-gray-400 text-sm">
                  Accede a estadísticas detalladas de jugadores, equipos y competiciones.
                  Rankings por posición, forma y rendimiento.
                </p>
              </div>
            </div>

            {/* Beneficios */}
            <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
              <div className="text-center mb-6">
                <Award size={24} className="text-yellow-400 mx-auto mb-2" />
                <h3 className="text-xl font-bold text-white">¿Por qué participar?</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <Award size={20} className="text-primary mx-auto mb-2" />
                  <h4 className="font-semibold text-white mb-1">Reconocimiento</h4>
                  <p className="text-sm text-gray-400">Gana prestigio como DT y forma parte del Hall of Fame</p>
                </div>
                <div className="text-center">
                  <Users size={20} className="text-secondary mx-auto mb-2" />
                  <h4 className="font-semibold text-white mb-1">Comunidad</h4>
                  <p className="text-sm text-gray-400">Conecta con otros apasionados del fútbol virtual</p>
                </div>
                <div className="text-center">
                  <TrendingUp size={20} className="text-green-400 mx-auto mb-2" />
                  <h4 className="font-semibold text-white mb-1">Crecimiento</h4>
                  <p className="text-sm text-gray-400">Desarrolla tus habilidades de gestión deportiva</p>
                </div>
              </div>
            </div>

            {/* Requisitos */}
            <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
              <div className="flex items-start gap-4">
                <Shield size={20} className="text-blue-400 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="text-lg font-bold text-white mb-2">¿Qué necesitas para participar?</h4>
                  <div className="space-y-2 text-sm text-gray-400">
                    <p><strong>Cuenta verificada:</strong> Regístrate y confirma tu email</p>
                    <p><strong>Conocimientos básicos:</strong> No se requieren conocimientos avanzados</p>
                    <p><strong>Tiempo disponible:</strong> 2-3 horas semanales para gestión</p>
                    <p><strong>Pasión por el fútbol:</strong> Ganas de aprender y competir</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Call to Action para usuarios no logueados */}
        {!isLoggedIn && (
          <div className="bg-gray-800/50 rounded-lg p-6 mb-8 border border-gray-700">
            <div className="text-center">
              <Crown size={32} className="text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-3">Conviértete en Director Técnico</h2>
              <p className="text-gray-400 mb-6 max-w-lg mx-auto">
                Gestiona tu propio club, compra y vende jugadores, y compite en la Liga Master.
              </p>
              <div className="flex flex-wrap justify-center gap-3 mb-6">
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>Gestión de club</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span>Mercado de fichajes</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <span>Estadísticas</span>
                </div>
              </div>
              <div className="flex flex-wrap justify-center gap-3">
                <Link
                  to="/registro"
                  className="bg-primary hover:bg-primary-light text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Crear cuenta DT
                </Link>
                <Link
                  to="/login"
                  className="border border-primary/50 text-primary hover:bg-primary/10 px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Iniciar sesión
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Quick access - solo para usuarios logeados */}
        {isLoggedIn && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Link
              to="/liga-master/mercado"
              className="bg-gray-800/50 rounded-lg p-6 border border-gray-700 hover:bg-gray-800 transition-colors"
            >
              <TrendingUp size={24} className="text-green-400 mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">Mercado de Fichajes</h3>
              <p className="text-gray-400 text-sm mb-4">
                Compra y vende jugadores para mejorar tu equipo.
              </p>
              <div className="text-primary flex items-center text-sm font-medium">
                <span>Ir al mercado</span>
                <ChevronRight size={16} className="ml-1" />
              </div>
            </Link>

            <Link
              to="/liga-master/fixture"
              className="bg-gray-800/50 rounded-lg p-6 border border-gray-700 hover:bg-gray-800 transition-colors"
            >
              <Calendar size={24} className="text-blue-400 mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">Fixture y Resultados</h3>
              <p className="text-gray-400 text-sm mb-4">
                Consulta el calendario de partidos y resultados.
              </p>
              <div className="text-primary flex items-center text-sm font-medium">
                <span>Ver fixture</span>
                <ChevronRight size={16} className="ml-1" />
              </div>
            </Link>

            <Link
              to="/liga-master/rankings"
              className="bg-gray-800/50 rounded-lg p-6 border border-gray-700 hover:bg-gray-800 transition-colors"
            >
              <Trophy size={24} className="text-yellow-400 mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">Rankings</h3>
              <p className="text-gray-400 text-sm mb-4">
                Clasificaciones y estadísticas de clubes y jugadores.
              </p>
              <div className="text-primary flex items-center text-sm font-medium">
                <span>Ver rankings</span>
                <ChevronRight size={16} className="ml-1" />
              </div>
            </Link>
          </div>
        )}
        
      </div>
    </div>
  );
}; 

export default LigaMaster;
 

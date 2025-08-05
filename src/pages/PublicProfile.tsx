import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import SmartAvatar from '../components/common/SmartAvatar';
import StatsCard from '../components/common/StatsCard';
import { Users, UserPlus, Shield, Award } from 'lucide-react';
import { getUserByUsername } from '../utils/userService';
import { User } from '../types/shared';
import { slugify } from '../utils/helpers';

const PublicProfile = () => {
  const { username } = useParams<{ username: string }>();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (username) {
      setUser(getUserByUsername(username));
    }
  }, [username]);

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Usuario no encontrado</h2>
        <Link to="/usuarios" className="btn-primary">
          Volver al directorio
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Hero / Banner */}
      <div className="h-48 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600" />
      </div>

      {/* Profile Card */}
      <div className="container mx-auto px-4 -mt-24 relative z-10">
        <div className="bg-gray-800/60 backdrop-blur-lg border border-white/10 rounded-2xl p-6 shadow-2xl flex flex-col md:flex-row md:items-center gap-6">
          <SmartAvatar src={user.avatar} name={user.username} size={120} className="ring-4 ring-white/20" />
          <div className="flex-1 space-y-2">
            <h1 className="text-3xl font-bold gradient-text">{user.username}</h1>
            {user.bio && <p className="text-gray-300 max-w-prose">{user.bio}</p>}

            {user.club && (
              <p className="text-sm text-gray-400">
                Director Técnico de{' '}
                <Link
                  to={`/liga-master/club/${slugify(user.club)}`}
                  className="text-primary font-medium hover:underline"
                >
                  {user.club}
                </Link>
              </p>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          <StatsCard title="Nivel" value={user.level ?? 0} icon={<Shield size={20} />} />
          <StatsCard title="XP" value={user.xp ?? 0} icon={<Award size={20} />} />
          <StatsCard title="Seguidores" value={user.followers ?? 0} icon={<Users size={20} />} />
          <StatsCard title="Siguiendo" value={user.following ?? 0} icon={<UserPlus size={20} />} />
        </div>
      </div>
    </div>
  );
};

export default PublicProfile;

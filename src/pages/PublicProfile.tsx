import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import PageHeader from '../components/common/PageHeader';
import { getUserByUsername } from '../utils/userService';
import { User } from '../types/shared';
import { slugify } from '../utils/helpers';

const PublicProfile = () => {
  const { username } = useParams<{ username: string }>();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (username) {
      getUserByUsername(username).then(setUser)
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
    <div>
      <PageHeader title={user.username} subtitle="Perfil público" />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center space-x-6 mb-8">
          <img src={user.avatar} alt={user.username} className="w-24 h-24 rounded-full" />
          <div>
            <p className="text-gray-300 mb-2">{user.bio}</p>
            <p className="text-sm">Nivel {user.level} &bull; XP {user.xp}</p>
          </div>
        </div>
        {user.club && (
          <p>
            Director Técnico de{' '}
            <Link
              to={`/liga-master/club/${slugify(user.club)}`}
              className="text-primary hover:text-primary-light"
            >
              {user.club}
            </Link>
          </p>
        )}
      </div>
    </div>
  );
};

export default PublicProfile;

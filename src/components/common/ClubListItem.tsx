import { Link } from 'react-router-dom';
import { Club } from '../../types/shared';

interface ClubListItemProps {
  club: Club;
  to?: string;
  className?: string;
}

const ClubListItem = ({ club, to, className = '' }: ClubListItemProps) => {
  const content = (
    <div
      className={`flex items-center p-3 rounded-lg hover:bg-gray-800 transition-colors ${className}`.trim()}
    >
      <img
        src={club.logo}
        alt={club.name}
        className="w-12 h-12 object-contain mr-4"
      />
      <div>
        <h3 className="font-bold" aria-live="polite">
          {club.name}
        </h3>
        <p className="text-sm text-gray-400">DT: {club.manager}</p>
      </div>
    </div>
  );

  return to ? <Link to={to}>{content}</Link> : content;
};

export default ClubListItem;

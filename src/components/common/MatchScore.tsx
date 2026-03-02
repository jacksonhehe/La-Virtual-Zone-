import type { Match } from '../../types';
import { hasPenaltyResult } from '../../utils/matchScore';

interface MatchScoreProps {
  match: Match;
  className?: string;
  penaltyClassName?: string;
  separatorClassName?: string;
  homePerspective?: boolean;
}

const MatchScore = ({
  match,
  className = '',
  penaltyClassName = 'text-[0.65em]',
  separatorClassName = '',
  homePerspective = true,
}: MatchScoreProps) => {
  const home = match.homeScore ?? 0;
  const away = match.awayScore ?? 0;

  if (!hasPenaltyResult(match)) {
    const left = homePerspective ? home : away;
    const right = homePerspective ? away : home;
    return (
      <span className={`inline-flex items-baseline whitespace-nowrap ${className}`}>
        <span>{left}</span>
        <span className={`mx-1 ${separatorClassName}`}>-</span>
        <span>{right}</span>
      </span>
    );
  }

  const homePens = match.penaltyHomeScore ?? 0;
  const awayPens = match.penaltyAwayScore ?? 0;

  if (homePerspective) {
    return (
      <span className={`inline-flex items-baseline whitespace-nowrap ${className}`}>
        <span>{home}</span>
        <span className={`ml-1 ${penaltyClassName}`}>({homePens})</span>
        <span className={`mx-1 ${separatorClassName}`}>-</span>
        <span className={penaltyClassName}>({awayPens})</span>
        <span className="ml-1">{away}</span>
      </span>
    );
  }

  return (
    <span className={`inline-flex items-baseline whitespace-nowrap ${className}`}>
      <span>{away}</span>
      <span className={`ml-1 ${penaltyClassName}`}>({awayPens})</span>
      <span className={`mx-1 ${separatorClassName}`}>-</span>
      <span className={penaltyClassName}>({homePens})</span>
      <span className="ml-1">{home}</span>
    </span>
  );
};

export default MatchScore;

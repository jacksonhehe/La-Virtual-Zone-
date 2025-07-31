import { DtRanking } from '../../types';

interface RankingRowProps {
  rank: number;
  data: DtRanking;
}

const RankingRow = ({ rank, data }: RankingRowProps) => (
  <tr className="border-t border-white/10">
    <td>{rank}</td>
    <td>{data.username}</td>
    <td className="flex items-center justify-center gap-1">
      <img src={data.clubLogo} alt={data.clubName} className="h-4 w-4" />
    </td>
    <td className="text-right">{data.elo}</td>
  </tr>
);

export default RankingRow;

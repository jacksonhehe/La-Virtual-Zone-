import { Player } from '../../types/shared';
import Image from '@/components/ui/Image';

interface PlayerCardProps {
  player: Player;
}

const PlayerCard = ({ player }: PlayerCardProps) => (
  <div
    data-cy="player"
    draggable
    onDragStart={e => e.dataTransfer.setData('text/plain', player.id)}
    className="bg-gray-900 text-xs text-center rounded p-1 cursor-move"
  >
    <Image src={player.image} alt={player.name} width={32} height={32} className="w-8 h-8 mx-auto rounded-full mb-1" />
    <div>{player.dorsal}</div>
  </div>
);

export default PlayerCard;

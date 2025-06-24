import Card from '../../components/common/Card';
import { Banknote, Stethoscope, UserPlus, Megaphone } from 'lucide-react';

interface QuickActionsProps {
  marketOpen: boolean;
}

const QuickActions = ({ marketOpen }: QuickActionsProps) => (
  <Card className="p-4" aria-label="Acciones rápidas">
    <h3 className="mb-4 text-xl font-semibold leading-tight">Acciones rápidas</h3>
    <div className="grid gap-3 sm:grid-cols-2">
      <button
        className={`card-hover bg-accent px-4 py-2 font-semibold text-black flex items-center justify-center gap-2 ${!marketOpen ? 'opacity-50 cursor-not-allowed' : ''}`}
        disabled={!marketOpen}
      >
        <Banknote size={16} />
        <span>Enviar oferta</span>
      </button>
      <button
        aria-label="Informe médico"
        className="card-hover bg-accent px-4 py-2 font-semibold text-black flex items-center justify-center gap-2"
      >
        <Stethoscope size={16} />
        <span>Informe médico</span>
      </button>
      <button
        aria-label="Firmar juvenil"
        className="card-hover bg-accent px-4 py-2 font-semibold text-black flex items-center justify-center gap-2"
      >
        <UserPlus size={16} />
        <span>Firmar juvenil</span>
      </button>
      <button
        aria-label="Publicar declaración"
        className="card-hover bg-accent px-4 py-2 font-semibold text-black flex items-center justify-center gap-2"
      >
        <Megaphone size={16} />
        <span>Publicar declaración</span>
      </button>
    </div>
  </Card>
);

export default QuickActions;

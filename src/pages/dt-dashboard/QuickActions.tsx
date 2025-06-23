import { Banknote, Stethoscope, UserPlus, Megaphone } from 'lucide-react';

interface QuickActionsProps {
  marketOpen: boolean;
}

const QuickActions = ({ marketOpen }: QuickActionsProps) => (
  <div className="grid gap-3 sm:grid-cols-2">
    <button
      className={`card-hover bg-accent px-4 py-2 font-semibold text-black flex items-center justify-center gap-2 focus:outline-none focus:ring-primary ${
        marketOpen ? 'cursor-pointer' : 'opacity-50 cursor-not-allowed'
      }`}
      disabled={!marketOpen}
    >
      <Banknote size={16} />
      <span>Enviar oferta</span>
    </button>
    <button
      aria-label="Informe médico"
      className="card-hover bg-accent px-4 py-2 font-semibold text-black flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus:ring-primary"
    >
      <Stethoscope size={16} />
      <span>Informe médico</span>
    </button>
    <button
      aria-label="Firmar juvenil"
      className="card-hover bg-accent px-4 py-2 font-semibold text-black flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus:ring-primary"
    >
      <UserPlus size={16} />
      <span>Firmar juvenil</span>
    </button>
    <button
      aria-label="Publicar declaración"
      className="card-hover bg-accent px-4 py-2 font-semibold text-black flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus:ring-primary"
    >
      <Megaphone size={16} />
      <span>Publicar declaración</span>
    </button>
  </div>
);

export default QuickActions;

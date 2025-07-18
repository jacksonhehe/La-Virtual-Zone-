import React, { useRef, useState } from 'react';
import { X, Trophy, Users } from 'lucide-react';
import useFocusTrap from '../../hooks/useFocusTrap';
import { useDataStore } from '../../store/dataStore';
import { Tournament } from '../../types';

interface Props {
  tournament: Tournament;
  isOpen: boolean;
  onClose: () => void;
}

const TeamRegistrationModal: React.FC<Props> = ({ tournament, isOpen, onClose }) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  useFocusTrap(dialogRef);
  const { tournaments, updateTournaments } = useDataStore();
  const [teamName, setTeamName] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [sent, setSent] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedTournaments = tournaments.map(t =>
      t.id === tournament.id
        ? {
            ...t,
            participants: [...(t.participants || []), teamName],
            currentTeams: (t.currentTeams || 0) + 1,
          }
        : t
    );
    updateTournaments(updatedTournaments);
    setSent(true);
    setTimeout(onClose, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose}></div>
      <div
        className="relative bg-gradient-to-br from-dark-lighter to-dark rounded-xl shadow-2xl w-full max-w-xl p-8 border border-gray-800/50"
        role="dialog"
        aria-modal="true"
        aria-labelledby="team-reg-title"
        ref={dialogRef}
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>

        {sent ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Trophy size={32} className="text-dark" />
            </div>
            <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              ¡Equipo inscrito!
            </h3>
            <p className="text-gray-300">Nos pondremos en contacto contigo para confirmar los detalles.</p>
          </div>
        ) : (
          <div>
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <Users size={32} className="text-dark" />
              </div>
              <h3 id="team-reg-title" className="text-2xl font-bold mb-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Inscripción de Equipo
              </h3>
              <p className="text-gray-400">Registra tu equipo en "{tournament.name}"</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Nombre del Equipo</label>
                <input
                  className="input w-full bg-dark border-gray-700 focus:border-primary"
                  placeholder="Ej: Atlético Example"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Persona de Contacto</label>
                <input
                  className="input w-full bg-dark border-gray-700 focus:border-primary"
                  placeholder="Nombre y Apellido"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email de Contacto</label>
                <input
                  type="email"
                  className="input w-full bg-dark border-gray-700 focus:border-primary"
                  placeholder="email@ejemplo.com"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn-primary w-full py-3 font-medium">Enviar Solicitud</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamRegistrationModal; 
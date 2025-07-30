import React, { useRef, useState } from 'react';
import { X, Trophy, Users } from 'lucide-react';
import { toast } from 'react-hot-toast';
import useFocusTrap from '../../hooks/useFocusTrap';
import useEscapeKey from '../../hooks/useEscapeKey';
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
  useEscapeKey(onClose, isOpen);
  const { tournaments, updateTournaments } = useDataStore();
  const [teamName, setTeamName] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [sent, setSent] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar que el equipo no esté ya registrado
    if (tournament.participants?.includes(teamName)) {
      toast.error('Este equipo ya está registrado en el torneo.');
      return;
    }
    
    // Validar límite de equipos
    if (tournament.maxTeams && (tournament.participants?.length || 0) >= tournament.maxTeams) {
      toast.error('El torneo ya ha alcanzado el límite máximo de equipos.');
      return;
    }
    
    try {
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
      toast.success(`¡${teamName} registrado exitosamente en ${tournament.name}!`);
      setSent(true);
      setTimeout(() => {
        onClose();
        setSent(false);
        setTeamName('');
        setContactName('');
        setContactEmail('');
      }, 2000);
    } catch (error) {
      console.error('Error al registrar equipo:', error);
      toast.error('Error al registrar el equipo. Inténtalo de nuevo.');
    }
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
          aria-label="Cerrar"
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
              ¡Equipo inscrito exitosamente!
            </h3>
            <p className="text-gray-300 mb-4">Tu equipo "{teamName}" ha sido registrado en "{tournament.name}".</p>
            <p className="text-gray-400 text-sm">Recibirás una confirmación por email en breve.</p>
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
              <p className="text-gray-400 mb-4">Registra tu equipo en "{tournament.name}"</p>
              <div className="bg-dark/50 rounded-lg p-4 mb-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Formato:</span>
                    <div className="text-white font-medium">
                      {tournament.type === 'league' ? 'Liga' : tournament.type === 'cup' ? 'Copa' : 'Amistoso'}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-400">Equipos:</span>
                    <div className="text-white font-medium">
                      {(tournament.participants?.length || 0)}/{tournament.maxTeams || '∞'}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-400">Inicio:</span>
                    <div className="text-white font-medium">
                      {new Date(tournament.startDate).toLocaleDateString()}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-400">Fin:</span>
                    <div className="text-white font-medium">
                      {new Date(tournament.endDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
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
              <button 
                type="submit" 
                disabled={!teamName.trim() || !contactName.trim() || !contactEmail.trim()}
                className="btn-primary w-full py-3 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Enviar Solicitud
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamRegistrationModal; 
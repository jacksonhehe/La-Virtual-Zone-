import { DndContext, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import toast from 'react-hot-toast';
import { Fixture } from '../../types';
import { useGlobalStore } from '../../store/globalStore';
import { useMemo } from 'react';

interface SchedulerProps {
  matches: Fixture[];
  weekStart: Date;
  onEdit?: (m: Fixture) => void;
}

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

const dayId = (d: Date) => d.toISOString().split('T')[0];

function DraggableMatch({ match, onEdit }: { match: Fixture; onEdit?: (m: Fixture) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useDraggable({
    id: match.id,
    data: { dateId: dayId(new Date(match.date)) },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  } as React.CSSProperties;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="card cursor-move select-none"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 flex-1">
          <div className="text-right flex-1">
            <p className="font-medium">{match.homeTeam}</p>
          </div>
          <div className="text-center px-4 text-xs text-gray-400">
            {new Date(match.date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
          </div>
          <div className="text-left flex-1">
            <p className="font-medium">{match.awayTeam}</p>
          </div>
        </div>
        {onEdit && (
          <button className="btn-outline text-xs ml-2" onClick={() => onEdit(match)}>
            Editar
          </button>
        )}
      </div>
    </div>
  );
}

function DroppableDay({ date, children }: { date: Date; children: React.ReactNode }) {
  const { isOver, setNodeRef } = useDroppable({ id: dayId(date) });
  return (
    <div
      ref={setNodeRef}
      className={`space-y-2 p-2 rounded-lg min-h-[6rem] ${isOver ? 'bg-blue-500/20' : 'bg-gray-800'}`}
    >
      <div className="text-sm font-semibold text-center mb-1">
        {date.toLocaleDateString('es-ES', { weekday: 'short', day: '2-digit', month: '2-digit' })}
      </div>
      {children}
    </div>
  );
}

const CalendarScheduler = ({ matches, weekStart, onEdit }: SchedulerProps) => {
  const sensors = useSensors(useSensor(PointerSensor));
  const { updateMatch } = useGlobalStore();

  const days = useMemo(() =>
    Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      return d;
    }), [weekStart]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const match = matches.find(m => m.id === active.id);
    if (!match) return;

    const overDate = new Date(over.id as string);
    const original = new Date(match.date);
    overDate.setHours(original.getHours(), original.getMinutes(), 0, 0);

    const conflict = matches.some(m => {
      if (m.id === match.id) return false;
      if (m.homeTeam === match.homeTeam || m.homeTeam === match.awayTeam || m.awayTeam === match.homeTeam || m.awayTeam === match.awayTeam) {
        if (!m.date) return false;
        const diff = Math.abs(new Date(m.date).getTime() - overDate.getTime());
        return diff < 2 * 60 * 60 * 1000; // 2 hours overlap
      }
      return false;
    });

    if (conflict) {
      toast.error('Conflicto de horario para ese equipo');
      return;
    }

    if (!isSameDay(original, overDate)) {
      updateMatch({ ...match, date: overDate.toISOString() });
    }
  };

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
        {days.map(day => (
          <DroppableDay key={dayId(day)} date={day}>
            {matches.filter(m => m.date && isSameDay(new Date(m.date), day)).map(m => (
              <DraggableMatch key={m.id} match={m} onEdit={onEdit} />
            ))}
          </DroppableDay>
        ))}
      </div>
    </DndContext>
  );
};

export default CalendarScheduler;

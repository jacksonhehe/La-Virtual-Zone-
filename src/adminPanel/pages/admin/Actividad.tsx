import  { useState } from 'react';
import { Calendar, Filter } from 'lucide-react';
import { useGlobalStore } from '../../store/globalStore';

const Actividad = () => {
  const { activities } = useGlobalStore();
  const [dateFilter, setDateFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('all');

  const filteredActivities = activities.filter(activity => {
    const matchesDate = !dateFilter || 
      new Date(activity.date).toDateString() === new Date(dateFilter).toDateString();
    const matchesAction = actionFilter === 'all' || 
      activity.action.toLowerCase().includes(actionFilter.toLowerCase());
    return matchesDate && matchesAction;
  });

  return (
       <div className="p-8 space-y-8">
      <header className="bg-vz-surface p-6 rounded">
        <h1 className="text-4xl font-heading font-bold gradient-text">Actividad del Sistema</h1>
        <p className="text-secondary mt-2">Monitorea todas las acciones en tiempo real</p>
      </header>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary" size={20} />
          <input
            type="date"
            className="input pl-10"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
        </div>
        <select
          className="input"
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
        >
          <option value="all">Todas las acciones</option>
          <option value="user">Usuarios</option>
          <option value="club">Clubes</option>
          <option value="transfer">Transferencias</option>
        </select>
      </div>

      <div className="space-y-3">
        {filteredActivities.length > 0 ? (
          filteredActivities.reverse().map((activity) => (
            <div key={activity.id} className="card">
              <div className="flex items-start space-x-4">
                <div className="w-3 h-3 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{activity.action}</h4>
                    <span className="text-sm text-secondary">
                      {new Date(activity.date).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-secondary text-sm mt-1">{activity.details}</p>
                  <p className="text-xs text-secondary mt-2">Usuario: {activity.userId}</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="card text-center py-8">
            <p className="text-secondary">No se encontró actividad para los filtros seleccionados</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Actividad;
 
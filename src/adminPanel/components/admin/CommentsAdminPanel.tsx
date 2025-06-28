import  { useState } from 'react';
import { Check, X, Eye, Trash } from 'lucide-react';
import toast from 'react-hot-toast';
import { useGlobalStore } from '../../store/globalStore';

const CommentsAdminPanel = () => {
  const { comments, approveComment, hideComment, deleteComment } = useGlobalStore();
  const [filter, setFilter] = useState('pending');

  const filteredComments = comments.filter(comment => 
    filter === 'all' || comment.status === filter
  );

  const handleApprove = (id: string) => {
    approveComment(id);
    toast.success('Comentario aprobado');
  };

  const handleHide = (id: string) => {
    hideComment(id);
    toast.success('Comentario ocultado');
  };

  const handleDelete = (id: string) => {
    deleteComment(id);
    toast.success('Comentario eliminado');
  };

  return (
       <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold gradient-text">Gestión de Comentarios</h2>
          <p className="text-gray-400 mt-2">Modera y supervisa la actividad de la comunidad</p>
        </div>
        <div className="glass-panel p-3">
          <select
            className="input bg-transparent border-none"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="pending">Pendientes</option>
            <option value="approved">Aprobados</option>
            <option value="hidden">Ocultos</option>
            <option value="all">Todos</option>
          </select>
        </div>
      </div> 

      <div className="space-y-4">
        {filteredComments.length > 0 ? (
          filteredComments.map((comment) => (
            <div key={comment.id} className="card">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-gray-300">{comment.content}</p>
                  <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                    <span>Usuario: {comment.userId}</span>
                    <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
                    <span className={`px-2 py-1 rounded-full ${
                      comment.status === 'approved' 
                        ? 'bg-green-900/20 text-green-300'
                        : comment.status === 'hidden'
                        ? 'bg-red-900/20 text-red-300'
                        : 'bg-yellow-900/20 text-yellow-300'
                    }`}>
                      {comment.status === 'approved' ? 'Aprobado' : 
                       comment.status === 'hidden' ? 'Oculto' : 'Pendiente'}
                    </span>
                  </div>
                </div>
                <div className="flex space-x-2 ml-4">
                  {comment.status === 'pending' && (
                    <>
                      <button 
                        className="text-green-400 hover:text-green-300"
                        onClick={() => handleApprove(comment.id)}
                        title="Aprobar"
                      >
                        <Check size={16} />
                      </button>
                      <button 
                        className="text-yellow-400 hover:text-yellow-300"
                        onClick={() => handleHide(comment.id)}
                        title="Ocultar"
                      >
                        <Eye size={16} />
                      </button>
                    </>
                  )}
                  <button 
                    className="text-red-400 hover:text-red-300"
                    onClick={() => handleDelete(comment.id)}
                    title="Eliminar"
                  >
                    <Trash size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="card text-center py-8">
            <p className="text-gray-400">No hay comentarios para mostrar</p>
          </div>
        )}
      </div>
    </div>
  );
}; 

export default CommentsAdminPanel;
 
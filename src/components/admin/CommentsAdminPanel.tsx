import { useCommentStore } from '../../store/commentStore';

const CommentsAdminPanel = () => {
  const { comments, approveComment, hideComment, deleteComment } = useCommentStore();
  const reported = comments.filter(c => c.reported && !c.hidden);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Comentarios Reportados</h2>
      {reported.length > 0 ? (
        <div className="bg-dark-light rounded-lg border border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-dark-lighter text-xs uppercase text-gray-400 border-b border-gray-800">
                  <th className="px-4 py-3 text-left">Autor</th>
                  <th className="px-4 py-3 text-left">Comentario</th>
                  <th className="px-4 py-3 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {reported.map(c => (
                  <tr key={c.id} className="border-b border-gray-800 hover:bg-dark-lighter">
                    <td className="px-4 py-3">{c.author}</td>
                    <td className="px-4 py-3">{c.content}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center space-x-2">
                        <button className="text-green-500" onClick={() => approveComment(c.id)}>
                          Aprobar
                        </button>
                        <button className="text-yellow-500" onClick={() => hideComment(c.id)}>
                          Ocultar
                        </button>
                        <button className="text-red-500" onClick={() => deleteComment(c.id)}>
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-dark-light rounded-lg border border-gray-800 p-6 text-center text-gray-400">
          No hay comentarios reportados.
        </div>
      )}
    </div>
  );
};

export default CommentsAdminPanel;

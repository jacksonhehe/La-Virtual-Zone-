import { useDataStore } from '../../store/dataStore';

const ReportedCommentsPanel = () => {
  const { reportedComments, approveComment, hideComment, deleteComment } = useDataStore();

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Comentarios Reportados</h2>
      <div className="bg-dark-light rounded-lg border border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-dark-lighter text-xs uppercase text-gray-400 border-b border-gray-800">
                <th className="px-4 py-3 text-left">Autor</th>
                <th className="px-4 py-3">Comentario</th>
                <th className="px-4 py-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {reportedComments.map(c => (
                <tr key={c.id} className="border-b border-gray-800 hover:bg-dark-lighter">
                  <td className="px-4 py-3">{c.author}</td>
                  <td className="px-4 py-3">{c.content}</td>
                  <td className="px-4 py-3 text-center space-x-2">
                    <button onClick={() => approveComment(c.id)} className="text-green-500">Aprobar</button>
                    <button onClick={() => hideComment(c.id)} className="text-yellow-500">Ocultar</button>
                    <button onClick={() => deleteComment(c.id)} className="text-red-500">Borrar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReportedCommentsPanel;

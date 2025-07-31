import { useState } from 'react';
import { useCommentStore } from '../../store/commentStore';
import { useAuthStore } from '../../store/authStore';

interface Props {
  postId: string;
}

const Comments = ({ postId }: Props) => {
  const { user } = useAuthStore();
  const { comments, addComment, reportComment } = useCommentStore();
  const [text, setText] = useState('');

  const postComments = comments.filter(c => c.postId === postId && !c.hidden);

  const handleAdd = () => {
    if (!text.trim() || !user) return;
    addComment({
      id: `${Date.now()}`,
      postId,
      author: user.username,
      content: text,
      date: new Date().toISOString(),
      reported: false,
      hidden: false,
    });
    setText('');
  };

  return (
    <div className="bg-dark-light rounded-lg border border-gray-800 p-6">
      <h3 className="font-bold text-lg mb-6">Comentarios</h3>
      <div className="space-y-6 mb-6">
        {postComments.map(c => (
          <div className="flex" key={c.id}>
            <div className="w-10 h-10 rounded-full overflow-hidden mr-3 flex-shrink-0">
              <img
                src={`https://ui-avatars.com/api/?name=${c.author}&background=111827&color=fff&size=128`}
                alt={c.author}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-grow">
              <div className="bg-dark rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{c.author}</span>
                  <span className="text-xs text-gray-400">
                    {new Date(c.date).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-gray-300">{c.content}</p>
              </div>
              <div className="flex items-center mt-2 text-xs text-gray-400 space-x-4">
                <button
                  className="hover:text-red-500 transition-colors"
                  onClick={() => reportComment(c.id)}
                >
                  Reportar
                </button>
              </div>
            </div>
          </div>
        ))}
        {postComments.length === 0 && (
          <p className="text-gray-400">Sé el primero en comentar.</p>
        )}
      </div>
      {user ? (
        <div className="mt-8">
          <h4 className="font-medium mb-3">Deja un comentario</h4>
          <textarea
            className="input w-full min-h-[100px] mb-3"
            placeholder="Escribe tu comentario aquí..."
            value={text}
            onChange={e => setText(e.target.value)}
          />
          <button className="btn-primary" onClick={handleAdd}>
            Enviar comentario
          </button>
        </div>
      ) : (
        <p className="text-gray-400">Inicia sesión para comentar.</p>
      )}
    </div>
  );
};

export default Comments;

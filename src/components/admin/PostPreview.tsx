import { Eye } from 'lucide-react';

interface PostPreviewProps {
  title: string;
  excerpt: string;
  content: string;
  image?: string;
  category: string;
  author: string;
  date: string;
  tags?: string[];
  onClose: () => void;
}

const PostPreview = ({ title, excerpt, content, image, category, author, date, tags = [], onClose }: PostPreviewProps) => {
  // Función simple para convertir markdown básico a HTML
  const markdownToHtml = (markdown: string): string => {
    return markdown
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Negrita
      .replace(/\*(.*?)\*/g, '<em>$1</em>') // Cursiva
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">$1</a>') // Enlaces
      .replace(/^-\s+(.*)$/gm, '<li>$1</li>') // Listas
      .replace(/(<li>.*<\/li>)/s, '<ul class="list-disc list-inside ml-4 my-2">$1</ul>') // Envolver listas
      .replace(/^>\s+(.*)$/gm, '<blockquote class="border-l-4 border-primary pl-4 my-2 italic">$1</blockquote>') // Citas
      .replace(/\n\n/g, '</p><p>') // Párrafos
      .replace(/\n/g, '<br>'); // Saltos de línea
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70"></div>
      <div className="relative bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <Eye size={20} className="text-primary" />
            <h3 className="text-lg font-bold">Vista previa del artículo</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            ✕
          </button>
        </div>

        {/* Contenido de vista previa */}
        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          <div className="p-6">
            {/* Imagen destacada */}
            {image && (
              <div className="mb-6">
                <img
                  src={image}
                  alt={title}
                  className="w-full max-h-64 object-cover rounded-lg"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}

            {/* Categoría y fecha */}
            <div className="flex items-center gap-4 mb-4 text-sm text-gray-400">
              <span className="bg-primary/20 text-primary px-2 py-1 rounded-full text-xs font-medium">
                {category}
              </span>
              <span>Por {author}</span>
              <span>•</span>
              <span>{new Date(date).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</span>
            </div>

            {/* Título */}
            <h1 className="text-3xl font-bold mb-4 text-white">{title || 'Sin título'}</h1>

            {/* Bajada */}
            {excerpt && (
              <p className="text-xl text-gray-300 mb-4 leading-relaxed">{excerpt}</p>
            )}

            {/* Tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-gray-700 text-gray-300 px-3 py-1 rounded-full text-sm border border-gray-600"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Contenido */}
            <div className="prose prose-invert max-w-none">
              <div
                className="text-gray-200 leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: content ? `<p>${markdownToHtml(content)}</p>` : '<p class="text-gray-500 italic">Sin contenido</p>'
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostPreview;

import { useState, useEffect, useRef } from 'react';
import { X, ChevronDown, Eye, Upload, Image } from 'lucide-react';
import { BlogPost } from '../../types';
import { NEWS_CATEGORIES } from '../../constants/newsCategories';
import SimpleTextEditor from './SimpleTextEditor';
import PostPreview from './PostPreview';
import TagInput from './TagInput';

interface EditPostModalProps {
  post: BlogPost;
  onClose: () => void;
  onSave: (post: BlogPost) => void;
}

const EditPostModal = ({ post, onClose, onSave }: EditPostModalProps) => {
  const [title, setTitle] = useState(post.title);
  const [excerpt, setExcerpt] = useState(post.excerpt);
  const [content, setContent] = useState(post.content);
  const [image, setImage] = useState(post.image);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [category, setCategory] = useState(post.category);
  const [author, setAuthor] = useState(post.author);
  const [date, setDate] = useState(new Date(post.date).toISOString().slice(0,10));
  const [tags, setTags] = useState<string[]>(post.tags || []);
  const [error, setError] = useState<string | null>(null);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Dimensiones recomendadas para imagen de noticia
  const RECOMMENDED_IMAGE_SIZE = { width: 1200, height: 630 };

  const handleImageFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      setImageError('El archivo debe ser una imagen');
      return;
    }

    // Validar tamaño (máximo 5MB para noticias)
    if (file.size > 5 * 1024 * 1024) {
      setImageError('La imagen no puede ser mayor a 5MB');
      return;
    }

    setImageError(null);
    setImageFile(file);
    setImage(''); // Limpiar URL si hay archivo

    // Crear preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleImageUpload = async () => {
    if (!imageFile) return;

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target?.result as string;
        setImage(base64);
        setImageFile(null);
        setImagePreview(null);
        setImageError(null);
      };
      reader.readAsDataURL(imageFile);
    } catch (error) {
      setImageError('Error al procesar la imagen');
    }
  };

  const clearImageSelection = () => {
    setImageFile(null);
    setImagePreview(null);
    setImageError(null);
  };

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsCategoryDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const validateUrl = (url: string): boolean => {
    if (!url) return true; // URL opcional
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validaciones básicas
    if (!title.trim()) {
      setError('El título es obligatorio');
      return;
    }
    if (title.trim().length > 100) {
      setError('El título no puede tener más de 100 caracteres');
      return;
    }
    if (!excerpt.trim()) {
      setError('La bajada es obligatoria');
      return;
    }
    if (excerpt.trim().length > 200) {
      setError('La bajada no puede tener más de 200 caracteres');
      return;
    }
    if (!content.trim()) {
      setError('El contenido es obligatorio');
      return;
    }
    if (content.trim().length < 50) {
      setError('El contenido debe tener al menos 50 caracteres');
      return;
    }
    if (image && !validateUrl(image)) {
      setError('La URL de la imagen no es válida');
      return;
    }
    if (author.trim().length > 50) {
      setError('El nombre del autor no puede tener más de 50 caracteres');
      return;
    }

    // Si hay un archivo seleccionado pero no se ha convertido a base64, hacerlo ahora
    if (imageFile && !image) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const finalImage = e.target?.result as string;
        const updatedPost = {
          ...post,
          title: title.trim(),
          excerpt: excerpt.trim(),
          content: content.trim(),
          image: finalImage.trim() || '',
          category,
          author: author.trim(),
          date: new Date(date).toISOString(),
          tags
        };
        onSave(updatedPost);
        onClose();
      };
      reader.readAsDataURL(imageFile);
      return;
    }
    const updatedPost = {
      ...post,
      title: title.trim(),
      excerpt: excerpt.trim(),
      content: content.trim(),
      image: image.trim() || '',
      category,
      author: author.trim(),
      date: new Date(date).toISOString(),
      tags
    };
    onSave(updatedPost);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70"></div>
      <div className="relative bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex-shrink-0 p-6 pb-4">
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
            <X size={20} />
          </button>
          <h3 className="text-xl font-bold mb-4">Editar artículo</h3>
        </div>
        <div className="flex-1 overflow-y-auto px-6">
          <form onSubmit={handleSubmit} className="space-y-4 pb-4">
          {error && <div className="p-3 bg-red-500/20 text-red-400 rounded-lg text-sm">{error}</div>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Título <span className="text-xs text-gray-500">({title.length}/100)</span>
              </label>
              <input
                className="input w-full"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ingresa un título atractivo y descriptivo"
                maxLength={100}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Categoría</label>
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  className="input w-full text-left flex items-center justify-between"
                  onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                >
                  {category}
                  <ChevronDown size={16} className={`transition-transform ${isCategoryDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {isCategoryDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 z-10 bg-gray-700 border border-gray-600 rounded-lg mt-1 max-h-48 overflow-y-auto">
                    {NEWS_CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        className={`w-full text-left px-3 py-2 hover:bg-gray-600 first:rounded-t-lg last:rounded-b-lg ${
                          category === cat ? 'bg-primary/20 text-primary' : 'text-gray-300'
                        }`}
                        onClick={() => {
                          setCategory(cat);
                          setIsCategoryDropdownOpen(false);
                        }}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Autor <span className="text-xs text-gray-500">({author.length}/50)</span>
              </label>
              <input
                className="input w-full"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Nombre del autor"
                maxLength={50}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Fecha de publicación</label>
              <input
                type="date"
                className="input w-full"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                title="Fecha de publicación del artículo"
              />
            </div>
            <div className="md:col-span-2">
              <label className="flex items-center text-sm text-gray-400 mb-1">
                <Image size={16} className="mr-2" />
                Imagen de la Noticia
              </label>
              
              {/* Información de dimensiones recomendadas */}
              <div className="mb-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <p className="text-xs text-blue-300 font-medium mb-1">
                  📐 Dimensiones recomendadas: <span className="font-bold">{RECOMMENDED_IMAGE_SIZE.width} x {RECOMMENDED_IMAGE_SIZE.height} px</span>
                </p>
                <p className="text-xs text-blue-400">Formato: PNG, JPG o WebP • Tamaño máximo: 5MB • Relación de aspecto: 1.91:1</p>
              </div>

              {/* Opción de subir archivo */}
              <div className="mb-3">
                <label className="flex items-center justify-center w-full p-4 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:border-primary/50 transition-colors group">
                  <div className="flex flex-col items-center">
                    <Upload size={24} className="text-gray-400 group-hover:text-primary mb-2" />
                    <span className="text-sm text-gray-400 group-hover:text-gray-300">
                      {imageFile ? imageFile.name : 'Haz clic para subir una imagen'}
                    </span>
                    <span className="text-xs text-gray-500 mt-1">o arrastra y suelta</span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileSelect}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Preview de imagen */}
              {(imagePreview || image) && (
                <div className="mb-3 relative">
                  <div className="relative inline-block">
                    <img 
                      src={imagePreview || image} 
                      alt="Image preview" 
                      className="max-w-full h-48 object-cover rounded-lg border border-gray-600"
                    />
                    {imageFile && (
                      <button
                        type="button"
                        onClick={clearImageSelection}
                        className="absolute top-2 right-2 p-1 bg-red-500 hover:bg-red-600 rounded-full text-white"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                  {imageFile && (
                    <div className="mt-2 flex gap-2">
                      <button
                        type="button"
                        onClick={handleImageUpload}
                        className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-sm rounded-lg"
                      >
                        Usar esta imagen
                      </button>
                      <button
                        type="button"
                        onClick={clearImageSelection}
                        className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded-lg"
                      >
                        Cancelar
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Opción de URL (alternativa) */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-600"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-gray-800 px-2 text-gray-500">O ingresa una URL</span>
                </div>
              </div>
              <input
                className="input w-full mt-3"
                value={image && !imagePreview ? image : ''}
                onChange={(e) => {
                  setImage(e.target.value);
                  setImageFile(null);
                  setImagePreview(null);
                }}
                placeholder="https://ejemplo.com/imagen.jpg"
                disabled={!!imageFile}
              />

              {imageError && (
                <p className="text-red-400 text-xs mt-2">{imageError}</p>
              )}
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-400 mb-1">
                Bajada <span className="text-xs text-gray-500">({excerpt.length}/200)</span>
              </label>
              <input
                className="input w-full"
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Resumen breve y atractivo que aparezca en la lista de artículos"
                maxLength={200}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-400 mb-1">Etiquetas</label>
              <TagInput
                tags={tags}
                onChange={setTags}
                placeholder="futbol, liga-master, noticia..."
                maxTags={5}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-400 mb-1">Contenido</label>
              <SimpleTextEditor
                value={content}
                onChange={setContent}
                placeholder="Escribe el contenido de la noticia aquí... Puedes usar formato Markdown básico."
                showCharCount={true}
                minLength={50}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t border-gray-700 mt-6 px-4 py-4">
            <button type="button" className="btn-outline" onClick={onClose}>Cancelar</button>
            <button
              type="button"
              className="btn-outline flex items-center gap-2"
              onClick={() => setShowPreview(true)}
            >
              <Eye size={16} />
              Vista previa
            </button>
            <button type="submit" className="btn-primary">Guardar</button>
          </div>
          </form>
        </div>
      </div>

      {/* Vista previa */}
      {showPreview && (
        <PostPreview
          title={title}
          excerpt={excerpt}
          content={content}
          image={image}
          category={category}
          author={author}
          date={new Date(date).toISOString()}
          tags={tags}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
};

export default EditPostModal;


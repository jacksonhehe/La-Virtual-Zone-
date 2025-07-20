import { useState, useRef } from 'react';
import { X, Upload, Image, Film } from 'lucide-react';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: {
    id: string;
    type: 'image' | 'video';
    title: string;
    description: string;
    category: string;
    image: string;
    author: string;
    date: string;
  }) => void;
}

const UploadModal = ({ isOpen, onClose, onUpload }: UploadModalProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('torneos');
  const [fileType, setFileType] = useState<'image' | 'video'>('image');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Crear URL para previsualización
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    
    // Determinar tipo de archivo
    if (file.type.startsWith('image/')) {
      setFileType('image');
    } else if (file.type.startsWith('video/')) {
      setFileType('video');
    }
  };
  
  // Función para usar una imagen de demostración
  const useDemoImage = () => {
    setPreviewUrl('https://images.unsplash.com/photo-1511406361295-0a1ff814c0ce?ixid=M3w3MjUzNDh8MHwxfHNlYXJjaHwyfHxlc3BvcnRzJTIwZ2FtaW5nJTIwZGFyayUyMHRoZW1lfGVufDB8fHx8MTc0NzA3MTE4MHww&ixlib=rb-4.1.0');
    setFileType('image');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!previewUrl) {
      alert('Por favor selecciona un archivo');
      return;
    }

    // Crear nuevo item para la galería
    const newItem = {
      id: Date.now().toString(),
      type: fileType,
      title,
      description,
      category,
      image: previewUrl,
      author: 'usuario',
      date: new Date().toISOString().split('T')[0]
    };

    onUpload(newItem);
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategory('torneos');
    setFileType('image');
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-dark-lighter rounded-lg w-full max-w-2xl">
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold">Subir contenido</h2>
          <button 
            onClick={() => {
              resetForm();
              onClose();
            }}
            className="text-gray-400 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Archivo</label>
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-600 rounded-lg p-6 cursor-pointer hover:border-primary transition-colors">
              {previewUrl ? (
                <div className="w-full">
                  {fileType === 'image' ? (
                    <img 
                      src={previewUrl} 
                      alt="Preview" 
                      className="max-h-48 mx-auto object-contain rounded"
                    />
                  ) : (
                    <video 
                      src={previewUrl} 
                      controls 
                      className="max-h-48 w-full object-contain rounded"
                    />
                  )}
                  <button 
                    type="button"
                    onClick={() => {
                      setPreviewUrl(null);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                      }
                    }}
                    className="mt-2 text-sm text-red-500 hover:text-red-400"
                  >
                    Eliminar archivo
                  </button>
                </div>
              ) : (
                <div className="w-full flex flex-col items-center">
                  <label className="w-full flex flex-col items-center mb-4">
                    <Upload size={48} className="text-gray-500 mb-2" />
                    <span className="text-sm text-gray-400 mb-2">Haz clic para seleccionar o arrastra un archivo</span>
                    <span className="text-xs text-gray-500">Imágenes (JPG, PNG, GIF) o Videos (MP4, WEBM)</span>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*,video/*"
                      onChange={handleFileChange}
                      ref={fileInputRef}
                    />
                  </label>
                  
                  <button
                    type="button"
                    onClick={useDemoImage}
                    className="mt-2 px-3 py-1.5 bg-primary/20 text-primary rounded-lg text-sm hover:bg-primary/30 transition-colors"
                  >
                    Usar imagen de demostración
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Título</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input w-full"
              placeholder="Título del contenido"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Descripción</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input w-full h-24"
              placeholder="Descripción del contenido"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Categoría</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="input w-full"
              required
            >
              <option value="torneos">Torneos</option>
              <option value="club">Clubes</option>
              <option value="jugadas">Jugadas</option>
              <option value="eventos">Eventos</option>
              <option value="memes">Memes</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => {
                resetForm();
                onClose();
              }}
              className="btn-secondary"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={!previewUrl || !title || !description}
            >
              <Upload size={16} className="mr-2" />
              Subir
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadModal;
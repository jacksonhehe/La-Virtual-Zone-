import { useState, type ChangeEvent } from 'react';
import PageHeader from '../components/common/PageHeader';
import { Image, Search, Calendar, User, Tag, Plus, X, Upload, AlertCircle } from 'lucide-react';
import { useDataStore } from '../store/dataStore';
import { useAuthStore } from '../store/authStore';
import { uploadMediaToSupabase, isStorageAvailable } from '../utils/supabaseStorage';
import { config } from '../lib/config';

const initialFormState = {
  title: '',
  type: 'image' as 'image' | 'video' | 'clip',
  url: '',
  thumbnailUrl: '',
  category: '',
  description: ''
};

const Gallery = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewerItem, setViewerItem] = useState<any | null>(null);

  const { mediaItems, addMediaItem, mediaLoading } = useDataStore();
  const { user } = useAuthStore();
  const [showUpload, setShowUpload] = useState(false);
  const [form, setForm] = useState(() => ({ ...initialFormState }));
  const [localImage, setLocalImage] = useState<{ name: string; dataUrl: string } | null>(null);
  const [localImageError, setLocalImageError] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const fallback = [
    {
      id: 'f1',
      type: 'image',
      title: 'Final de la Liga Master 2024',
      description: 'Rayo Digital FC vs Atlético Pixelado',
      category: 'Torneos',
      image: 'https://images.unsplash.com/photo-1511406361295-0a1ff814c0ce?ixlib=rb-4.1.0',
      uploader: 'admin',
      uploadDate: '2024-12-15'
    }
  ];
  const items: any[] = mediaItems && mediaItems.length ? mediaItems : (fallback as any[]);

  const categories = Array.from(new Set(items.map((i: any) => i.category))).filter(Boolean) as string[];
  const filteredItems = items.filter((item: any) => {
    if (activeFilter !== 'all' && item.category !== activeFilter) return false;
    const title = (item.title || '').toLowerCase();
    const desc = (item.description || '').toLowerCase();
    if (searchQuery && !title.includes(searchQuery.toLowerCase()) && !desc.includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const resetUploadState = () => {
    setForm({ ...initialFormState });
    setLocalImage(null);
    setLocalImageError('');
  };

  const closeUploadModal = () => {
    setShowUpload(false);
    resetUploadState();
  };

  const handleTypeChange = (value: 'image' | 'video' | 'clip') => {
    setForm((prev) => ({ ...prev, type: value }));
    if (value !== 'image') {
      setLocalImage(null);
      setLocalImageError('');
    }
  };

  const handleLocalFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    const input = event.target;
    if (!file) {
      setLocalImage(null);
      setLocalImageError('');
      return;
    }

    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      setLocalImage(null);
      setLocalImageError('Solo se permiten archivos de imagen o video.');
      input.value = '';
      return;
    }

    // Validar tamaño máximo (videos: 50MB, imágenes: 10MB)
    const isVideo = file.type.startsWith('video/');
    const maxSize = isVideo ? 50 * 1024 * 1024 : 10 * 1024 * 1024; // 50MB para videos, 10MB para imágenes
    if (file.size > maxSize) {
      setLocalImage(null);
      const maxSizeText = isVideo ? '50MB' : '10MB';
      setLocalImageError(`El ${isVideo ? 'video' : 'archivo'} no puede ser mayor a ${maxSizeText}.`);
      input.value = '';
      return;
    }

    setUploadingImage(true);
    setLocalImageError('');

    try {
      let imageUrl: string;
      let fileSize: number = file.size;
      let mimeType: string = file.type;

      if (isStorageAvailable()) {
        // Subir a Supabase Storage
        const result = await uploadMediaToSupabase(file, 'gallery');
        imageUrl = result.url;
        fileSize = result.fileSize;
        mimeType = result.mimeType;
        console.log(`✅ ${isVideo ? 'Video' : 'Imagen'} subida a Supabase Storage:`, result.url);
      } else {
        // Usar base64 local
        const reader = new FileReader();
        imageUrl = await new Promise((resolve, reject) => {
          reader.onloadend = () => {
            const result = typeof reader.result === 'string' ? reader.result : '';
            if (result) {
              resolve(result);
            } else {
              reject(new Error('No se pudo leer la imagen'));
            }
          };
          reader.onerror = () => reject(new Error('Error al leer la imagen'));
          reader.readAsDataURL(file);
        });
      }

      setLocalImage({
        name: file.name,
        dataUrl: imageUrl,
        fileSize,
        mimeType
      });

    } catch (error) {
      console.error('Error procesando imagen:', error);
      setLocalImage(null);
      setLocalImageError(error instanceof Error ? error.message : 'Error al procesar la imagen.');
    } finally {
      setUploadingImage(false);
      input.value = '';
    }
  };

  return (
    <div>
      <PageHeader
        title="Galería"
        subtitle="Colección de imágenes, videos y contenido multimedia de La Virtual Zone."
        image="https://images.unsplash.com/photo-1511406361295-0a1ff814c0ce?ixlib=rb-4.1.0"
      />

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="w-full md:w-auto order-2 md:order-1">
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setActiveFilter('all')} className={`px-3 py-1.5 rounded-lg text-sm ${activeFilter === 'all' ? 'bg-primary text-white' : 'bg-dark-light text-gray-300 hover:bg-dark-lighter'}`}>Todos</button>
              {categories.map(cat => (
                <button key={cat} onClick={() => setActiveFilter(cat)} className={`px-3 py-1.5 rounded-lg text-sm ${activeFilter === cat ? 'bg-primary text-white' : 'bg-dark-light text-gray-300 hover:bg-dark-lighter'}`}>
                  {cat}
                </button>
              ))}
            </div>
          </div>

        <div className="flex w-full md:w-auto order-1 md:order-2 space-x-2">
            <div className="relative flex-grow max-w-xs">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={16} className="text-gray-500" />
              </div>
              <input
                type="text"
                placeholder="Buscar..."
                className="input pl-10 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button className="btn-primary" onClick={() => setShowUpload(true)}>
              <Plus size={16} className="mr-2" />
              Subir
            </button>
          </div>
        </div>

        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item: any) => (
              <div key={item.id} className="card overflow-hidden group cursor-pointer" onClick={() => setViewerItem(item)}>
                <div className="aspect-video relative overflow-hidden">
                  <img
                    src={item.thumbnailUrl || item.image || item.url}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute top-3 left-3">
                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${item.type === 'video' || item.type === 'clip' ? 'bg-neon-red/20 text-neon-red' : 'bg-neon-blue/20 text-neon-blue'}`}>
                      {(item.type === 'video' || item.type === 'clip') ? 'Video' : 'Imagen'}
                    </span>
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="font-bold mb-2 group-hover:text-primary transition-colors">{item.title}</h3>
                  {item.description && <p className="text-sm text-gray-400 mb-4">{item.description}</p>}
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center"><User size={14} className="mr-1" /><span>{item.uploader || item.author}</span></div>
                    <div className="flex items-center"><Calendar size={14} className="mr-1" /><span>{new Date(item.uploadDate || item.date).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: '2-digit' })}</span></div>
                    <div className="flex items-center"><Tag size={14} className="mr-1" /><span className="capitalize">{item.category}</span></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Image size={48} className="mx-auto mb-4 text-gray-600" />
            <h3 className="text-xl font-bold mb-2">No se encontraron resultados</h3>
            <p className="text-gray-400">No hay resultados que coincidan con tu búsqueda. Intenta con otros términos o filtros.</p>
          </div>
        )}

        {viewerItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80" onClick={() => setViewerItem(null)}></div>
            <div className="relative bg-gray-900 rounded-lg shadow-2xl w-full max-w-4xl overflow-hidden">
              <button onClick={() => setViewerItem(null)} className="absolute top-3 right-3 bg-dark p-1.5 rounded text-gray-300 hover:text-white z-10" aria-label="Cerrar">
                <X size={18} />
              </button>
              <div className="w-full bg-black flex items-center justify-center aspect-video">
                {(viewerItem.type === 'video' || viewerItem.type === 'clip') ? (
                  <video controls className="w-full h-full">
                    <source src={viewerItem.url || viewerItem.thumbnailUrl} />
                  </video>
                ) : (
                  <img src={viewerItem.url || viewerItem.image || viewerItem.thumbnailUrl} alt={viewerItem.title} className="max-h-[80vh] w-auto object-contain" />
                )}
              </div>
              <div className="p-4 border-t border-gray-800">
                <h4 className="font-bold">{viewerItem.title}</h4>
                {viewerItem.description && <p className="text-gray-400 text-sm mt-1">{viewerItem.description}</p>}
              </div>
            </div>
          </div>
        )}

        {showUpload && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-scaleIn">
            <div className="absolute inset-0 bg-black/80" onClick={closeUploadModal}></div>
            <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-700/50">
              {/* Header con gradiente */}
              <div className="relative bg-gradient-to-r from-primary/20 via-primary/10 to-transparent p-6 border-b border-gray-700/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary/20 rounded-lg">
                      <Plus size={24} className="text-primary" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white">Subir contenido</h3>
                      <p className="text-sm text-gray-400">Agrega una imagen o video a la galería</p>
                    </div>
                  </div>
                  <button
                    onClick={closeUploadModal}
                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-all"
                    aria-label="Cerrar"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Título</label>
                    <input className="input w-full" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Tipo</label>
                      <select className="input w-full" value={form.type} onChange={e=>handleTypeChange(e.target.value as 'image'|'video'|'clip')}>
                        <option value="image">Imagen</option>
                        <option value="video">Video</option>
                        <option value="clip">Clip</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Categoría</label>
                      <input className="input w-full" value={form.category} onChange={e=>setForm({...form,category:e.target.value})} placeholder="Torneos, Club, etc." />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">URL del contenido</label>
                    <input
                      className="input w-full disabled:opacity-50 disabled:cursor-not-allowed"
                      value={form.url}
                      onChange={e=>setForm({...form,url:e.target.value})}
                      placeholder="https://..."
                      disabled={!!localImage}
                    />
                    {localImage ? (
                      <p className="text-xs text-gray-500 mt-1">Se usará el archivo local seleccionado.</p>
                    ) : (
                      <p className="text-xs text-gray-500 mt-1">Pega un enlace o elige una imagen de tu equipo.</p>
                    )}
                  </div>
                  {(form.type === 'image' || form.type === 'video' || form.type === 'clip') && (
                    <div>
                      <label className="block text-sm text-gray-400 mb-2 font-medium">
                        Archivo multimedia {config.useSupabase ? '(se subirá a la nube)' : '(se guardará localmente)'}
                      </label>
                      <div className="relative">
                        <input
                          type="file"
                          accept="image/*,video/*"
                          onChange={handleLocalFileChange}
                          className="hidden"
                          id="image-upload"
                          disabled={uploadingImage}
                        />
                        <label
                          htmlFor="image-upload"
                          className={`flex items-center justify-center w-full p-4 border-2 border-dashed rounded-lg transition-all cursor-pointer group ${
                            uploadingImage
                              ? 'border-yellow-500 bg-yellow-500/10 cursor-not-allowed'
                              : 'border-gray-600 hover:border-primary hover:bg-primary/5'
                          }`}
                        >
                          <div className="flex flex-col items-center space-y-2">
                            <div className={`p-3 rounded-full transition-all ${
                              uploadingImage
                                ? 'bg-yellow-500/20'
                                : 'bg-primary/10 group-hover:bg-primary/20'
                            }`}>
                              {uploadingImage ? (
                                <Upload size={24} className="text-yellow-500 animate-pulse" />
                              ) : (
                                <Image size={24} className="text-primary" />
                              )}
                            </div>
                            <div className="text-center">
                              <p className={`text-sm font-medium transition-colors ${
                                uploadingImage
                                  ? 'text-yellow-400'
                                  : 'text-gray-300 group-hover:text-white'
                              }`}>
                                {uploadingImage
                                  ? 'Subiendo imagen...'
                                  : localImage
                                    ? 'Cambiar imagen'
                                    : 'Seleccionar imagen'
                                }
                              </p>
                              <p className="text-xs text-gray-500">
                                {uploadingImage
                                  ? 'Procesando archivo...'
                                  : config.useSupabase
                                    ? 'Imágenes: PNG, JPG, GIF hasta 10MB | Videos: MP4, AVI hasta 50MB'
                                    : 'Imágenes: PNG, JPG, GIF hasta 10MB | Videos: MP4, AVI hasta 50MB (local)'
                                }
                              </p>
                            </div>
                          </div>
                        </label>
                      </div>
                      {localImageError && (
                        <div className="mt-2 flex items-center gap-2 p-2 bg-red-500/10 border border-red-500/20 rounded-lg">
                          <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
                          <p className="text-xs text-red-400">{localImageError}</p>
                        </div>
                      )}
                      {localImage && !uploadingImage && (
                        <div className="mt-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                          <div className="flex items-center gap-4">
                            <img
                              src={localImage.dataUrl}
                              alt="Vista previa"
                              className="w-16 h-16 object-cover rounded-lg border border-gray-600"
                            />
                            <div className="flex-1">
                              <p className="font-medium text-gray-200 text-sm">{localImage.name}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <p className="text-xs text-gray-400">
                                  {localImage.fileSize ? `${(localImage.fileSize / 1024 / 1024).toFixed(2)} MB` : 'Tamaño desconocido'}
                                </p>
                                {config.useSupabase && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-green-500/20 text-green-400">
                                    ☁️ En la nube
                                  </span>
                                )}
                              </div>
                            </div>
                            <button
                              type="button"
                              className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all"
                              onClick={() => {
                                setLocalImage(null);
                                setLocalImageError('');
                              }}
                              title="Quitar imagen"
                              disabled={uploadingImage}
                            >
                              <X size={16} />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">URL de miniatura (opcional)</label>
                    <input className="input w-full" value={form.thumbnailUrl} onChange={e=>setForm({...form,thumbnailUrl:e.target.value})} placeholder="https://..." />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Descripción (opcional)</label>
                    <textarea
                      className="input w-full resize-none"
                      rows={3}
                      value={form.description}
                      onChange={e=>setForm({...form,description:e.target.value})}
                      placeholder="Describe brevemente el contenido..."
                    />
                  </div>
                </div>
              </div>

              {/* Footer mejorado */}
              <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 p-6 border-t border-gray-700/50">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-400">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                    <span>Completa los campos requeridos para subir</span>
                  </div>
                  <div className="flex space-x-3 w-full sm:w-auto">
                    <button
                      type="button"
                      className="flex-1 sm:flex-none btn-outline hover:bg-gray-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={closeUploadModal}
                      disabled={mediaLoading || uploadingImage}
                    >
                      <X size={16} className="mr-2" />
                      Cancelar
                    </button>
                    <button
                      className="flex-1 sm:flex-none btn-primary bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={async () => {
                        const title = form.title.trim();
                        const url = (localImage?.dataUrl || form.url.trim());
                        if (!title || !url || mediaLoading || uploadingImage) return;

                        try {
                          const item: any = {
                            id: `media-${Date.now()}`,
                            title,
                            type: form.type,
                            url,
                            thumbnailUrl: localImage?.dataUrl || form.thumbnailUrl.trim() || url,
                            uploadDate: new Date().toISOString(),
                            uploader: user?.username || 'anon',
                            category: form.category || 'General',
                            likes: 0,
                            views: 0,
                            description: form.description.trim() || undefined,
                            fileSize: localImage?.fileSize,
                            mimeType: localImage?.mimeType
                          };

                          await addMediaItem(item);
                          closeUploadModal();
                        } catch (error) {
                          console.error('Error al subir contenido:', error);
                          // El error ya se maneja en el slice
                        }
                      }}
                      disabled={mediaLoading || uploadingImage || !form.title.trim() || (!localImage?.dataUrl && !form.url.trim())}
                    >
                      {mediaLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                          Subiendo...
                        </>
                      ) : (
                        <>
                          <Plus size={16} className="mr-2" />
                          Subir contenido
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Gallery;

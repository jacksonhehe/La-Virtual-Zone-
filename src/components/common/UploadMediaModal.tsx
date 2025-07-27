import React, { useState, useEffect, useRef } from 'react';
import { v4 as uuid } from 'uuid';
import { useDataStore } from '../../store/dataStore';
import { MediaItem } from '@/types';
import { notifySuccess, notifyError } from '../../utils/toast';
import useFocusTrap from '../../hooks/useFocusTrap';
import useEscapeKey from '../../hooks/useEscapeKey';

interface UploadMediaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const UploadMediaModal: React.FC<UploadMediaModalProps> = ({
  isOpen,
  onClose
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  useFocusTrap(dialogRef);
  useEscapeKey(onClose, isOpen);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  // Generar y limpiar URL de previsualización
  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    
    try {
      // Simulación de subida

      // Crear objeto MediaItem provisional
      const newItem: MediaItem = {
        id: uuid(),
        title,
        type: file!.type.startsWith('video') ? 'video' : 'image',
        url: preview!,
        thumbnailUrl: preview!,
        uploadDate: new Date().toISOString(),
        uploader: 'Tú',
        category: 'Subidas',
        likes: 0,
        views: 0,
        tags: []
      };

      useDataStore.getState().addMediaItem(newItem);
      notifySuccess('Medio subido correctamente');
      onClose();
    } catch (error) {
      notifyError('Error al subir el archivo');
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div
        ref={dialogRef}
        className="relative w-full max-w-lg rounded-2xl bg-[#1f1f2c] border border-white/10 shadow-xl"
        role="dialog"
        aria-modal="true"
      >
        {/* Botón cerrar */}
        <button
          aria-label="Cerrar"
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-white focus-visible:outline-dashed focus-visible:outline-accent"
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold text-white px-6 pt-6">Subir medio</h2>

        <form onSubmit={handleSubmit} className="px-6 pb-6 mt-4 space-y-4">
          {/* Área drag & drop */}
          <label
            htmlFor="file-input"
            className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:bg-white/5 transition-colors"
          >
            {preview ? (
              // Previsualización
              <img src={preview} alt="preview" className="h-full object-contain rounded" />
            ) : (
              <span className="text-gray-400 text-sm text-center px-4">
                Arrastra tu archivo aquí o <span className="text-primary underline">haz clic para seleccionar</span>
                <br /> (imágenes o vídeos)
              </span>
            )}
            <input
              id="file-input"
              type="file"
              accept="image/*,video/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="hidden"
              required
            />
          </label>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-300">Título</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg bg-gray-800 border border-gray-700 p-3 focus:border-primary focus:ring-0 text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-300">Descripción (opcional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg bg-gray-800 border border-gray-700 p-3 focus:border-primary focus:ring-0 text-white resize-none"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isUploading}
              className="btn-outline"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={!file || isUploading}
              className="btn-primary"
            >
              {isUploading ? 'Subiendo...' : 'Subir'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadMediaModal; 
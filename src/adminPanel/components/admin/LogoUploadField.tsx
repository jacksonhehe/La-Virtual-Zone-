import React, { useState, useRef, useEffect } from 'react';
import { Image as ImageIcon, Upload, X, Camera } from 'lucide-react';
import Image from '@/components/ui/Image';
import { toast } from 'react-hot-toast';

interface LogoUploadFieldProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
  showPreview?: boolean;
  maxSize?: number; // in MB
  acceptedTypes?: string[];
}

const LogoUploadField: React.FC<LogoUploadFieldProps> = ({
  value,
  onChange,
  label = "Logo",
  placeholder = "URL del logo o subir archivo",
  className = "",
  showPreview = true,
  maxSize = 2, // 2MB default
  acceptedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"]
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Update preview when value changes
  useEffect(() => {
    if (value && value.trim()) {
      setPreviewUrl(value);
    } else {
      setPreviewUrl(null);
    }
  }, [value]);

  // Initialize preview on mount if value exists
  useEffect(() => {
    if (value && value.trim() && !previewUrl) {
      setPreviewUrl(value);
    }
  }, []);

  const handleFileSelect = (file: File) => {
    // Validate file type
    if (!acceptedTypes.includes(file.type)) {
      toast.error('Tipo de archivo no soportado. Usa JPG, PNG, WebP o GIF.');
      return;
    }

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      toast.error(`El archivo supera ${maxSize}MB.`);
      return;
    }

    setIsUploading(true);

    // Simulate upload process
    setTimeout(() => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        onChange(base64);
        setPreviewUrl(base64);
        setIsUploading(false);
        toast.success('Logo subido correctamente');
      };
      reader.onerror = () => {
        setIsUploading(false);
        toast.error('Error al leer el archivo');
      };
      reader.readAsDataURL(file);
    }, 1000);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleRemoveLogo = () => {
    onChange('');
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <label className="block text-sm font-medium text-gray-300 mb-2">
        <ImageIcon size={16} className="inline mr-2" />
        {label}
      </label>

      {/* URL Input */}
      <div className="space-y-2">
        <input
          type="text"
          className="input w-full bg-dark border-gray-700 focus:border-primary"
          placeholder={placeholder}
          value={value}
          onChange={handleUrlChange}
        />
        <p className="text-xs text-gray-500">
          URL de la imagen o sube un archivo (máx. {maxSize}MB)
        </p>
      </div>

      {/* File Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-4 transition-all duration-200 ${
          isDragOver
            ? 'border-primary bg-primary/10'
            : 'border-gray-600 hover:border-gray-500 bg-gray-800/50'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedTypes.join(',')}
          onChange={handleFileInputChange}
          className="hidden"
        />
        
        <div className="text-center">
          {isUploading ? (
            <div className="flex items-center justify-center space-x-2 text-primary">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              <span>Subiendo...</span>
            </div>
          ) : previewUrl ? (
            <div className="flex flex-col items-center space-y-2">
              <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-700 flex items-center justify-center border border-gray-600">
                <Image
                  src={previewUrl}
                  alt="Logo preview"
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                  onError={() => setPreviewUrl(null)}
                />
              </div>
              <div className="text-sm text-gray-400">
                Logo cargado ✓
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs text-primary underline hover:text-primary/80"
              >
                Cambiar logo
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center space-y-2 text-gray-400 hover:text-white transition-colors"
            >
              <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center">
                <Upload size={24} />
              </div>
              <div className="text-sm">
                <span className="text-primary underline">Haz clic para subir</span> o arrastra aquí
              </div>
              <div className="text-xs text-gray-500">
                JPG, PNG, WebP, GIF (máx. {maxSize}MB)
              </div>
            </button>
          )}
        </div>
      </div>

      {/* Additional Preview for larger display */}
      {showPreview && previewUrl && (
        <div className="relative">
          <div className="w-24 h-24 mx-auto rounded-xl overflow-hidden bg-gray-700 flex items-center justify-center border border-gray-600">
            <Image
              src={previewUrl}
              alt="Logo preview"
              width={96}
              height={96}
              className="w-full h-full object-cover"
              onError={() => setPreviewUrl(null)}
            />
          </div>
          <button
            type="button"
            onClick={handleRemoveLogo}
            className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 transition-colors"
            title="Eliminar logo"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Quick Actions */}
      <div className="flex justify-center space-x-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="btn-outline text-sm flex items-center space-x-1"
        >
          <Camera size={14} />
          <span>Subir Archivo</span>
        </button>
        {value && (
          <button
            type="button"
            onClick={handleRemoveLogo}
            className="btn-outline text-sm flex items-center space-x-1 text-red-400 hover:text-red-300"
          >
            <X size={14} />
            <span>Eliminar</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default LogoUploadField; 
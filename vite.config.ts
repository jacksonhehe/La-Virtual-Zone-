import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['lucide-react', 'xlsx'],
  },
  server: {
    middlewareMode: false,
  },
  configureServer(server) {
    // Función auxiliar para leer fotos
    const readPhotosFromDirectory = () => {
      const publicDir = path.join(process.cwd(), 'public', 'Fotos_Jugadores');
      const photos: { [clubName: string]: string[] } = {};

      if (!fs.existsSync(publicDir)) {
        throw new Error(`Directorio no encontrado: ${publicDir}`);
      }

      const clubDirs = fs.readdirSync(publicDir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);

      for (const clubDir of clubDirs) {
        const clubPath = path.join(publicDir, clubDir);

        if (!fs.existsSync(clubPath)) {
          console.warn(`⚠️ Carpeta no encontrada: ${clubPath}`);
          continue;
        }

        const photoFiles = fs.readdirSync(clubPath)
          .filter(file => file.endsWith('.png'))
          .map(file => file.replace('.png', ''));

        photos[clubDir] = photoFiles;
      }

      return photos;
    };

    // Función para actualizar el archivo JSON
    const updatePhotosJson = (photos: { [clubName: string]: string[] }) => {
      const jsonPath = path.join(process.cwd(), 'public', 'photos-list.json');
      const totalPhotos = Object.values(photos).flat().length;

      const jsonData = {
        ...photos,
        _metadata: {
          lastUpdated: new Date().toISOString(),
          totalPhotos,
          totalClubs: Object.keys(photos).length
        }
      };

      fs.writeFileSync(jsonPath, JSON.stringify(jsonData, null, 2));
      return totalPhotos;
    };

    // Endpoint para leer fotos disponibles
    server.middlewares.use('/api/photos', (req, res) => {
      try {
        console.log('🔍 Leyendo fotos desde el servidor...');

        const photos = readPhotosFromDirectory();
        const totalPhotos = updatePhotosJson(photos);

        console.log(`✅ Total de fotos encontradas: ${totalPhotos}`);
        console.log('💾 Archivo JSON actualizado');

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.end(JSON.stringify(photos));

      } catch (error) {
        console.error('❌ Error en /api/photos:', error);
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
          error: 'Error leyendo fotos del servidor',
          details: error.message
        }));
      }
    });

    // Actualizar fotos al iniciar el servidor
    try {
      console.log('🚀 Inicializando sistema de fotos...');
      const photos = readPhotosFromDirectory();
      const totalPhotos = updatePhotosJson(photos);
      console.log(`📸 Sistema inicializado: ${totalPhotos} fotos listas`);
    } catch (error) {
      console.warn('⚠️ Error inicializando fotos:', error.message);
    }
  },
});

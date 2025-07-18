import { VZ_USERS_KEY, VZ_CURRENT_USER_KEY } from './storageKeys';

export const clearUserData = () => {
  // Limpiar datos de usuarios
  localStorage.removeItem(VZ_USERS_KEY);
  localStorage.removeItem(VZ_CURRENT_USER_KEY);
  
  console.log('Datos de usuarios limpiados. Los datos corregidos se cargarán automáticamente.');
};

// Función para verificar y corregir datos de usuarios existentes
export const fixUserData = () => {
  const usersJson = localStorage.getItem(VZ_USERS_KEY);
  if (usersJson) {
    try {
      const users = JSON.parse(usersJson);
      let needsUpdate = false;
      
      const correctedUsers = users.map((user: any) => {
        // Corregir el usuario admin si existe
        if (user.username === 'admin') {
          if (user.level === 10 && user.xp === 1000) {
            needsUpdate = true;
            return {
              ...user,
              level: 3,
              xp: 2500,
              following: typeof user.following === 'object' ? 0 : user.following
            };
          }
        }
        
        // Corregir following si es un objeto
        if (typeof user.following === 'object') {
          needsUpdate = true;
          return {
            ...user,
            following: 0
          };
        }
        
        return user;
      });
      
      if (needsUpdate) {
        localStorage.setItem(VZ_USERS_KEY, JSON.stringify(correctedUsers));
        console.log('Datos de usuarios corregidos automáticamente.');
      }
    } catch (error) {
      console.error('Error al corregir datos de usuarios:', error);
      clearUserData();
    }
  }
}; 
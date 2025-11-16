import { config } from '../lib/config';

interface ObjectStoreConfig {
  name: string;
  keyPath: string;
  indexes?: { name: string; keyPath: string | string[]; unique?: boolean }[];
}

interface DBConfig {
  name: string;
  version: number;
  stores: ObjectStoreConfig[];
}

class IndexedDBService {
  private db: IDBDatabase | null = null;
  private config: DBConfig;

  constructor(config: DBConfig) {
    this.config = config;
  }

  private async ensureDb(): Promise<IDBDatabase> {
    if (this.db) {
      return this.db;
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.config.name, this.config.version);

      request.onerror = () => {
        console.error('IndexedDB error:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log(`IndexedDB '${this.config.name}' opened successfully`);
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const upgradedDb = (event.target as IDBOpenDBRequest).result;
        console.log(`Upgrading IndexedDB '${this.config.name}' to version ${this.config.version}`);

        this.config.stores.forEach((storeConfig) => {
          if (!upgradedDb.objectStoreNames.contains(storeConfig.name)) {
            const objectStore = upgradedDb.createObjectStore(storeConfig.name, { keyPath: storeConfig.keyPath });

            if (storeConfig.indexes) {
              storeConfig.indexes.forEach((index) => {
                objectStore.createIndex(index.name, index.keyPath, { unique: index.unique });
              });
            }
          }
        });
      };
    });
  }

  private async withStore<T>(storeName: string, mode: IDBTransactionMode, callback: (store: IDBObjectStore) => T | Promise<T>): Promise<T> {
    const db = await this.ensureDb();
    const transaction = db.transaction([storeName], mode);
    const store = transaction.objectStore(storeName);
    return callback(store);
  }

  async getAll<T>(storeName: string): Promise<T[]> {
    return this.withStore(storeName, 'readonly', (store) => {
      return new Promise<T[]>((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result as T[]);
        request.onerror = () => {
          console.error(`Error getting all from ${storeName}:`, request.error);
          reject(request.error);
        };
      });
    });
  }

  async get<T>(storeName: string, key: string | number): Promise<T | null> {
    return this.withStore(storeName, 'readonly', (store) => {
      return new Promise<T | null>((resolve, reject) => {
        const request = store.get(key);
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => {
          console.error(`Error getting item from ${storeName}:`, request.error);
          reject(request.error);
        };
      });
    });
  }

  async put<T>(storeName: string, item: T): Promise<void> {
    await this.withStore(storeName, 'readwrite', (store) => {
      return new Promise<void>((resolve, reject) => {
        const request = store.put(item);
        request.onsuccess = () => resolve();
        request.onerror = () => {
          console.error(`Error putting item in ${storeName}:`, request.error);
          reject(request.error);
        };
      });
    });
  }

  async update(storeName: string, item: any): Promise<void> {
    await this.put(storeName, item);
  }

  async count(storeName: string): Promise<number> {
    return this.withStore(storeName, 'readonly', (store) => {
      return new Promise<number>((resolve, reject) => {
        const request = store.count();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => {
          console.error(`Error counting items in ${storeName}:`, request.error);
          reject(request.error);
        };
      });
    });
  }

  async clear(storeName: string): Promise<void> {
    await this.withStore(storeName, 'readwrite', (store) => {
      return new Promise<void>((resolve, reject) => {
        const request = store.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => {
          console.error(`Error clearing ${storeName}:`, request.error);
          reject(request.error);
        };
      });
    });
  }

  async putMany<T>(storeName: string, items: T[]): Promise<void> {
    if (items.length === 0) {
      console.log('putMany: No hay elementos para guardar');
      return;
    }

    console.log(`putMany: Procesando ${items.length} elementos para ${storeName}`);

    await this.withStore(storeName, 'readwrite', (store) => {
      return new Promise<void>((resolve, reject) => {
        let completed = 0;
        let errors = 0;
        const total = items.length;
        const progressInterval = Math.max(1, Math.ceil(total / 20));

        const checkComplete = () => {
          completed++;
          if (completed % progressInterval === 0 || completed === total) {
            console.log(`putMany progreso: ${completed}/${total} elementos procesados`);
          }

          if (completed === total) {
            if (errors > 0) {
              console.error(`putMany: ${errors} errores durante el proceso`);
              reject(new Error(`${errors} errores al guardar elementos`));
            } else {
              console.log(`putMany: Todos los ${total} elementos guardados exitosamente`);
              resolve();
            }
          }
        };

        const handleError = (error: any) => {
          errors++;
          console.error(`Error putting item in ${storeName}:`, error);
          checkComplete();
        };

        items.forEach((item, index) => {
          try {
            const request = store.put(item);
            request.onsuccess = checkComplete;
            request.onerror = () => handleError(request.error);
          } catch (error) {
            console.error(`Error preparing item ${index} for ${storeName}:`, error);
            handleError(error);
          }
        });
      });
    });
  }
}

const dbService = new IndexedDBService({
  name: config.indexedDB.name,
  version: config.indexedDB.version,
  stores: [
    { name: 'players', keyPath: 'id' },
    { name: 'clubs', keyPath: 'id' },
    { name: 'tournaments', keyPath: 'id' },
    { name: 'matches', keyPath: 'id' },
    { name: 'transfers', keyPath: 'id' },
  ],
});

type MigrationEntry = {
  localKey: string;
  store: string;
  description: string;
};

const MIGRATION_ENTRIES: MigrationEntry[] = [
  { localKey: 'virtual_zone_players', store: 'players', description: 'jugadores' },
  { localKey: 'virtual_zone_clubs', store: 'clubs', description: 'clubes' },
  { localKey: 'virtual_zone_tournaments', store: 'tournaments', description: 'torneos' },
  { localKey: 'virtual_zone_transfers', store: 'transfers', description: 'traspasos' }
];

const LEGACY_STORAGE_KEYS: string[] = [
  'virtual_zone_players',
  'virtual_zone_players_updated',
  'virtual_zone_players_initialized',
  'virtual_zone_clubs',
  'virtual_zone_clubs_updated',
  'virtual_zone_clubs_backup',
  'virtual_zone_clubs_backup_light',
  'virtual_zone_initialized',
  'virtual_zone_transfers',
  'virtual_zone_comments',
  'virtual_zone_migration_done'
];

const getLocalStorage = (): Storage | null => {
  if (typeof window === 'undefined') return null;
  return window.localStorage;
};

const prepareDataForMigration = <T>(value: unknown): T[] => {
  if (Array.isArray(value)) {
    return value as T[];
  }

  if (value && typeof value === 'object') {
    return Object.values(value) as T[];
  }

  return [];
};

export const needsMigration = (): boolean => {
  const storage = getLocalStorage();
  if (!storage) return false;

  const migrationDone = storage.getItem('virtual_zone_migration_done');
  if (migrationDone === 'true') {
    return false;
  }

  return MIGRATION_ENTRIES.some(entry => !!storage.getItem(entry.localKey));
};

export const migrateFromLocalStorage = async (): Promise<void> => {
  const storage = getLocalStorage();
  if (!storage) {
    console.warn('IndexedDBService: No localStorage available for migration');
    return;
  }

  for (const entry of MIGRATION_ENTRIES) {
    const raw = storage.getItem(entry.localKey);
    if (!raw) continue;

    try {
      const parsed = JSON.parse(raw);
      const payload = prepareDataForMigration(parsed);

      if (payload.length === 0) {
        console.log(`IndexedDBService: Nada que migrar desde ${entry.description}`);
        continue;
      }

      console.log(`IndexedDBService: Migrando ${payload.length} elementos de ${entry.description}`);
      await dbService.putMany(entry.store, payload as any[]);
    } catch (error) {
      console.error(`IndexedDBService: Error migrando ${entry.description}:`, error);
    }
  }
};

export const cleanupOldStorage = (): void => {
  const storage = getLocalStorage();
  if (!storage) return;

  LEGACY_STORAGE_KEYS.forEach(key => {
    if (storage.getItem(key)) {
      storage.removeItem(key);
      console.log(`IndexedDBService: Removed legacy key ${key} from localStorage`);
    }
  });
};

export { dbService };

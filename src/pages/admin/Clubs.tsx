import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Edit, Plus, Trash, RefreshCw, UserMinus } from 'lucide-react';
import { formatCurrency } from '../../utils/format';
import { listClubs, createClub, updateClub as saveClub, deleteClub } from '../../utils/clubService';
import { fetchClubsFromSupabase } from '../../utils/clubService';
import { config } from '../../lib/config';
import NewClubModal from '../../components/admin/NewClubModal';
import EditClubModal from '../../components/admin/EditClubModal';
import ConfirmDeleteModal from '../../components/admin/ConfirmDeleteModal';
import { fetchUsers as fetchUsersAsync, updateUser, updateSupabaseUser } from '../../utils/authService';

type RoleType = 'user' | 'dt' | 'admin';

const normalizeUserRoles = (user: any): RoleType[] => {
  if (Array.isArray(user?.roles) && user.roles.length) {
    return Array.from(
      new Set(
        user.roles
          .map((role: string) => role?.toLowerCase?.())
          .filter((role: string) => role === 'user' || role === 'dt' || role === 'admin')
      )
    ) as RoleType[];
  }
  const fallback = typeof user?.role === 'string' ? user.role.toLowerCase() : undefined;
  if (fallback === 'admin' || fallback === 'dt' || fallback === 'user') {
    return [fallback as RoleType];
  }
  return ['user'];
};

const computeRolesForClubAssignment = (user: any, hasClub: boolean) => {
  const roles = normalizeUserRoles(user);
  const roleSet = new Set<RoleType>(roles);

  if (hasClub) {
    roleSet.add('dt');
  } else if (!hasClub && roleSet.has('dt')) {
    roleSet.delete('dt');
  }

  if (roleSet.size === 0) {
    roleSet.add('user');
  }

  const finalRoles = Array.from(roleSet);
  const primaryRole: RoleType = roleSet.has('admin')
    ? 'admin'
    : roleSet.has('dt')
      ? 'dt'
      : 'user';

  return { finalRoles, primaryRole };
};
import { useDataStore } from '../../store/dataStore';

const AdminClubs = () => {
  const [clubsState, setClubsState] = useState<any[]>([]);
  const [showNewClub, setShowNewClub] = useState(false);
  const [editingClub, setEditingClub] = useState<any | null>(null);
  const [deleteClubTarget, setDeleteClubTarget] = useState<any | null>(null);
  const [searchParams] = useSearchParams();
  const { refreshClubs, updateClub, removeClub, clubs, isDataLoaded } = useDataStore();
  const [usersState, setUsersState] = useState<any[]>([]);
  const [dtUsers, setDtUsers] = useState<{ id: string; username: string; clubId?: string | null }[]>([]);

  const fetchAllUsers = useCallback(async () => {
    return await fetchUsersAsync();
  }, []);

  const refreshDtUsers = useCallback(async () => {
    try {
      const allUsers = await fetchAllUsers();
      setUsersState(allUsers);
      const dtList = allUsers
        .filter((u: any) => {
          const roles: string[] = Array.isArray(u.roles)
            ? u.roles
            : u.role
              ? [u.role]
              : [];
          return roles.includes('dt');
        })
        .map((u: any) => ({
          id: u.id,
          username: u.username,
          clubId: u.clubId ?? u.club_id ?? null,
        }));
      setDtUsers(dtList);
    } catch (error) {
      console.error('Error cargando usuarios/DTs:', error);
      setUsersState([]);
      setDtUsers([]);
    }
  }, [fetchAllUsers]);

  useEffect(() => {
    refreshDtUsers();
  }, [refreshDtUsers]);

  useEffect(() => {
    if (showNewClub || editingClub) {
      refreshDtUsers();
    }
  }, [showNewClub, editingClub, refreshDtUsers]);

  const updateDtAssignment = useCallback(async (user: any, club: { id: string; name: string } | null) => {
    if (!user) return;
    try {
      const { finalRoles, primaryRole } = computeRolesForClubAssignment(user, Boolean(club));
      if (config.useSupabase) {
        await updateSupabaseUser(user.id, {
          clubId: club ? club.id : null,
          club: club ? club.name : null,
          roles: finalRoles,
          role: primaryRole
        });
      } else {
        await updateUser({
          ...user,
          clubId: club ? club.id : undefined,
          club: club ? club.name : undefined,
          roles: finalRoles,
          role: primaryRole
        });
      }
    } catch (error) {
      console.error('Error actualizando usuario:', error);
    }
  }, []);

  useEffect(() => {
    // Inicializar con los clubes del store de datos cuando estén disponibles
    if (isDataLoaded && clubs) {
      // Remove duplicates based on ID
      const uniqueClubs = clubs.filter((club: any, index: number, self: any[]) =>
        index === self.findIndex((c) => c.id === club.id)
      );
      setClubsState(uniqueClubs as any);
    }
  }, [clubs, isDataLoaded]);

  // En modo Supabase: cargar clubes desde Supabase si no hay en memoria
  useEffect(() => {
    const loadFromSupabase = async () => {
      if (config.useSupabase && isDataLoaded && (clubs?.length ?? 0) === 0) {
        try {
          const supaClubs = await fetchClubsFromSupabase();
          if (supaClubs.length > 0) {
            try { await (useDataStore.getState().updateClubs?.(supaClubs as any) ?? Promise.resolve()); } catch {}
            setClubsState(supaClubs as any);
          }
        } catch (e) {
          console.error('Error cargando clubes desde Supabase:', e);
        }
      }
    };
    loadFromSupabase();
  }, [isDataLoaded, clubs?.length]);

  useEffect(() => {
    if (searchParams.get('new') === '1') {
      setShowNewClub(true);
    }
  }, [searchParams]);

  const handleCreateClub = async (data: {
    name: string;
    logo?: string;
    managerUserId?: string;
    budget?: number;
    playStyle?: string;
    foundedYear?: number;
    stadium?: string;
    primaryColor?: string;
    secondaryColor?: string;
    description?: string;
    reputation?: number;
    fanBase?: number;
  }) => {
    try {
      // Encontrar el usuario DT para obtener su username
      const selectedUser = data.managerUserId ? usersState.find(u => u.id === data.managerUserId) : null;
      const managerName = selectedUser ? selectedUser.username : '';

      // Crear objeto con la estructura correcta para createClub
      const clubData = {
        ...data,
        manager: managerName
      };

      const created = await createClub(clubData);

      // Si se asignó un DT, actualizar también el usuario
      if (selectedUser && data.managerUserId) {
        await updateDtAssignment(selectedUser, { id: created.id, name: created.name });
        await refreshDtUsers();
      }

      // Actualizar estado local inmediatamente
      setClubsState((prev) => [created as any, ...prev]);

      // Actualizar el store de datos global (agregar el nuevo club)
      await updateClub(created);

      setShowNewClub(false);
    } catch (error) {
      console.error('Error creando club:', error);
    }
  };
  const handleSaveClub = async (data: {
    name: string;
    logo: string;
    managerUserId?: string;
    budget: number;
    playStyle: string;
    foundedYear?: number;
    stadium?: string;
    primaryColor?: string;
    secondaryColor?: string;
    description?: string;
    reputation?: number;
    fanBase?: number;
  }) => {
    if (!editingClub) return;

    try {
      // Encontrar el usuario DT para obtener su username
      const selectedUser = data.managerUserId ? usersState.find(u => u.id === data.managerUserId) : null;
      const managerName = selectedUser ? selectedUser.username : editingClub.manager;

      // Obtener el DT anterior (si existía)
      const previousDtUser = usersState.find(u => u.clubId === editingClub.id);

      // Crear objeto Club completo con los datos actualizados
      const updatedClub = {
        ...editingClub, // Mantener todos los campos existentes
        name: data.name,
        logo: data.logo,
        budget: data.budget,
        playStyle: data.playStyle,
        manager: managerName, // Usar el username del DT
        foundedYear: data.foundedYear ?? editingClub.foundedYear ?? new Date().getFullYear(),
        stadium: data.stadium ?? editingClub.stadium ?? '',
        primaryColor: data.primaryColor ?? editingClub.primaryColor ?? '#ffffff',
        secondaryColor: data.secondaryColor ?? editingClub.secondaryColor ?? '#000000',
        description: data.description ?? editingClub.description ?? '',
        reputation: data.reputation ?? editingClub.reputation ?? 50,
        fanBase: data.fanBase ?? editingClub.fanBase ?? 10000
      };

      // El guardado se hace a través del store

      // Manejar cambios en la asignación de DT
      try {
        // Si había un DT anterior y ahora es diferente, quitarle el club al anterior
        if (previousDtUser && previousDtUser.id !== data.managerUserId) {
          await updateDtAssignment(previousDtUser, null);
          console.log(`🔄 Usuario ${previousDtUser.username} removido del club ${editingClub.name}`);
        }

        // Si se asignó un nuevo DT, actualizarlo
        if (selectedUser && data.managerUserId) {
          await updateDtAssignment(selectedUser, { id: updatedClub.id, name: updatedClub.name });
          console.log(`✅ Usuario ${selectedUser.username} asignado al club ${updatedClub.name}`);
        }

        await refreshDtUsers();
      } catch (error) {
        console.error('Error actualizando usuarios:', error);
      }

      // Actualizar estado local inmediatamente
      setClubsState((prev) => prev.map((c) => (c.id === editingClub.id ? updatedClub : c)));

      // Actualizar el store de datos global (solo este club específico)
      await updateClub(updatedClub);

      setEditingClub(null);
    } catch (error) {
      console.error('Error guardando club:', error);
    }
  };
  const handleDeleteClubInner = async (id: string) => {
    try {
      // Encontrar el DT asignado a este club antes de eliminarlo
      const dtUser = usersState.find(u => u.clubId === id);

      // Si había un DT asignado, quitarle la asignación
      if (dtUser) {
        try {
          await updateDtAssignment(dtUser, null);
          console.log(`🔄 Usuario ${dtUser.username} removido del club eliminado`);
        } catch (error) {
          console.error('Error actualizando usuario al eliminar club:', error);
        }
      }

      await deleteClub(id);

      // Actualizar estado local inmediatamente
      setClubsState((prev) => prev.filter((c) => c.id !== id));

      // Actualizar el store de datos global (eliminar el club)
      await removeClub(id);

      setDeleteClubTarget(null);
      await refreshDtUsers();
    } catch (error) {
      console.error('Error eliminando club:', error);
    }
  };

  const handleRefreshClubs = () => {
    console.log('🔄 Refrescando clubes desde datos seed...');
    if (typeof window !== 'undefined' && (window as any).refreshClubsFromSeed) {
      (window as any).refreshClubsFromSeed();
    }

    // Sincronizar asignaciones de DT después del refresh
    setTimeout(async () => {
      try {
        const updatedClubs = await listClubs();
        const allUsers = await fetchAllUsers();

        // PRIMERO: Limpiar todas las asignaciones de DTs para evitar duplicados
        const dtCandidates = allUsers.filter((u: any) =>
          u.role === 'dt' || (Array.isArray(u.roles) && u.roles.includes('dt'))
        );

        console.log('🔄 Limpiando asignaciones previas de DTs...');
        for (const user of dtCandidates) {
          if (user.clubId || user.club) {
            await updateDtAssignment(user, null);
            console.log(`🔄 Limpiado: ${user.username} removido de ${user.club || 'su club'}`);
          }
        }

        // SEGUNDO: Asignar DTs según los datos de los clubes
        console.log('🔄 Asignando DTs según clubes...');
        const assignedDTs = new Set<string>(); // Para evitar asignaciones duplicadas

        for (const club of updatedClubs) {
          if (club.manager && !assignedDTs.has(club.manager)) {
            const dtUser = allUsers.find((u: any) =>
              u.username === club.manager &&
              (u.role === 'dt' || (Array.isArray(u.roles) && u.roles.includes('dt')))
            );

            if (dtUser && !dtUser.clubId) {
              await updateDtAssignment(dtUser, { id: club.id, name: club.name });
              assignedDTs.add(club.manager);
              console.log(`🔄 Asignado: ${dtUser.username} -> ${club.name}`);
            }
          }
        }

        // Para clubes sin DT asignado, limpiar el manager
        for (const club of updatedClubs) {
          if (club.manager && !assignedDTs.has(club.manager)) {
            await saveClub({
              ...club,
              manager: ''
            });
            console.log(`🔄 Club limpiado: ${club.name} sin manager válido`);
          }
        }

        console.log('✅ Sincronización de asignaciones DT completada');
        await refreshDtUsers();
      } catch (error) {
        console.error('Error sincronizando asignaciones:', error);
      }

      refreshClubs();
      const updatedClubs = await listClubs();
      setClubsState(updatedClubs);
    }, 1000);
  };

  const handleUnassignAllDTs = async () => {
    const confirmed = confirm('¿Estás seguro de que quieres desasignar a TODOS los DTs de sus clubes actuales?\n\nEsta acción removerá todas las asignaciones de clubes de los directores técnicos.');
    if (!confirmed) return;

    try {
      console.log('🔄 Desasignando todos los DTs de sus clubes...');

      const allUsers = await fetchAllUsers();
      const dtCandidates = allUsers.filter((u: any) =>
        u.role === 'dt' || (Array.isArray(u.roles) && u.roles.includes('dt'))
      );

      let updatedCount = 0;

      // PRIMERO: Desasignar a todos los DTs de sus clubes
      for (const user of dtCandidates) {
        const hadAssignment = user.clubId || user.club;
        if (hadAssignment) {
          await updateDtAssignment(user, null);
          updatedCount++;
          console.log(`🔄 Desasignado: ${user.username} removido de ${user.club || user.clubId || 'su club'}`);
        }
      }

      // SEGUNDO: Limpiar el campo manager de todos los clubes
      const allClubs = await listClubs();
      let clubsUpdated = 0;

      for (const club of allClubs) {
        if (club.manager) {
          await saveClub({
            ...club,
            manager: ''
          });
          clubsUpdated++;
          console.log(`🔄 Club limpiado: ${club.name} sin manager`);
        }
      }

      alert(`✅ Desasignación completada!\nSe removieron ${updatedCount} asignaciones de DTs.\nSe limpiaron ${clubsUpdated} clubes.`);

      // Refrescar la vista
      const refreshedClubs = await listClubs();
      setClubsState(refreshedClubs as any);
      await refreshDtUsers();

    } catch (error) {
      console.error('Error desasignando DTs:', error);
      alert('Error al desasignar DTs. Revisa la consola para más detalles.');
    }
  };

  if (!isDataLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-400">Cargando clubes...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold">Gestión de Clubes</h2>
          <span className="text-sm text-gray-400">({clubsState.length} clubes)</span>
        </div>
        <div className="flex gap-2">
          {config.useSupabase && (
            <button
              className="btn-outline flex items-center text-sky-400 border-sky-400 hover:text-sky-300 hover:border-sky-300"
              onClick={async () => {
                try {
                  const supaClubs = await fetchClubsFromSupabase();
                  try { await (useDataStore.getState().updateClubs?.(supaClubs as any) ?? Promise.resolve()); } catch {}
                  setClubsState(supaClubs as any);
                  alert(`Clubes refrescados desde Supabase: ${supaClubs.length}`);
                } catch {
                  alert('Error al refrescar clubes desde Supabase');
                }
              }}
            >
              <RefreshCw size={16} className="mr-2" />
              Refrescar Supabase
            </button>
          )}
          <button
            className="btn-outline flex items-center text-sm"
            onClick={handleRefreshClubs}
            title="Refrescar desde datos seed"
          >
            <RefreshCw size={16} className="mr-2" />
            Refrescar
          </button>
          <button
            className="btn-outline flex items-center text-sm text-red-400 hover:text-red-300 border-red-400 hover:border-red-300"
            onClick={handleUnassignAllDTs}
            title="Desasignar a todos los DTs de sus clubes actuales"
          >
            <UserMinus size={16} className="mr-2" />
            Desasignar DTs
          </button>
          <button className="btn-primary flex items-center" onClick={() => setShowNewClub(true)}>
            <Plus size={16} className="mr-2" />
            Nuevo club
          </button>
        </div>
      </div>

      <div className="bg-dark-light rounded-lg border border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">            <thead>
              <tr className="bg-dark-lighter text-xs uppercase text-gray-400 border-b border-gray-800">
                <th className="px-4 py-3 text-left">Club</th>
                <th className="px-4 py-3 text-center">Año</th>
                <th className="px-4 py-3 text-center">Presupuesto</th>
                <th className="px-4 py-3 text-center">DT</th>
                <th className="px-4 py-3 text-center">Estilo</th>
                <th className="px-4 py-3 text-center">Acciones</th>
              </tr>
            </thead><tbody>
              {!Array.isArray(clubsState) || clubsState.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-gray-400">
                    {Array.isArray(clubsState) ? 'No hay clubes.' : 'Cargando clubes...'}
                  </td>
                </tr>
              ) : clubsState.map((club: any) => (
                <tr key={`${club.id}-${club.budget}`} className="border-b border-gray-800 hover:bg-dark-lighter">
                  <td className="px-4 py-3">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded overflow-hidden mr-3">
                        <img src={club.logo} alt={club.name} />
                      </div>
                      <span className="font-medium">{club.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">{club.foundedYear}</td>
                  <td className="px-4 py-3 text-center">{formatCurrency(club.budget)}</td>
                  <td className="px-4 py-3 text-center">{club.manager}</td>
                  <td className="px-4 py-3 text-center">{club.playStyle}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center gap-2">
                      <button className="p-1 text-gray-400 hover:text-primary" onClick={() => setEditingClub(club)}>
                        <Edit size={16} />
                      </button>
                      <button className="p-1 text-gray-400 hover:text-red-500" onClick={() => setDeleteClubTarget(club)}>
                        <Trash size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody></table>
        </div>
      </div>

      {showNewClub && (
        <NewClubModal onClose={() => setShowNewClub(false)} onCreate={handleCreateClub} dtUsers={dtUsers} />
      )}
      {editingClub && (
        <EditClubModal
          club={editingClub}
          currentDtId={usersState.find((u: any) => u.clubId === editingClub.id)?.id}
          dtUsers={dtUsers}
          onClose={() => setEditingClub(null)}
          onSave={handleSaveClub}
        />
      )}
      {deleteClubTarget && (
        <ConfirmDeleteModal user={{ id: deleteClubTarget.id, username: deleteClubTarget.name }} onCancel={() => setDeleteClubTarget(null)} onConfirm={handleDeleteClubInner} label="club" />
      )}
    </div>
  );
};

export default AdminClubs;

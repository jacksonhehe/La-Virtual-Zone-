import { ChangeEvent, FormEvent, useEffect, useRef, useState } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useDataStore } from '../store/dataStore';
import { getMainRoleLabel, getUserRoles } from './user-panel/helpers';
import UserPanelSidebar from './user-panel/UserPanelSidebar';
import ProfileTab from './user-panel/ProfileTab';
import ClubTab from './user-panel/ClubTab';
import ActivityTab from './user-panel/ActivityTab';
import CommunityTab from './user-panel/CommunityTab';
import SettingsTab from './user-panel/SettingsTab';
import ProfileCustomizationModal from './user-panel/ProfileCustomizationModal';
import DeleteAccountModal from './user-panel/DeleteAccountModal';

const TABS = ['profile', 'club', 'activity', 'community', 'settings'] as const;
type TabKey = (typeof TABS)[number];

const UserPanel = () => {
  const {
    user,
    isAuthenticated,
    logout,
    hasRole,
    updateUser,
    deleteAccount,
    changePassword,
    downloadUserData
  } = useAuthStore();
  const { clubs } = useDataStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [activeTab, setActiveTab] = useState<TabKey>(() => {
    const tabParam = searchParams.get('tab');
    return (TABS.includes(tabParam as TabKey) ? tabParam : 'profile') as TabKey;
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteConfirmationInput, setDeleteConfirmationInput] = useState('');
  const [deleteAcknowledged, setDeleteAcknowledged] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [showProfileCustomization, setShowProfileCustomization] = useState(false);
  const [profileForm, setProfileForm] = useState(() => ({
    bio: (user as any)?.bio || '',
    location: (user as any)?.location || '',
    website: (user as any)?.website || '',
    favoriteTeam: (user as any)?.favoriteTeam || '',
    favoritePosition: (user as any)?.favoritePosition || ''
  }));
  const [profileError, setProfileError] = useState<string | null>(null);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const openFilePicker = () => fileInputRef.current?.click();

  const deleteConfirmationPhrase = user?.username || user?.email || 'ELIMINAR';
  const normalizedDeleteConfirmationPhrase = deleteConfirmationPhrase.trim().toLowerCase();
  const canConfirmDeleteAccount =
    deleteAcknowledged && deleteConfirmationInput.trim().toLowerCase() === normalizedDeleteConfirmationPhrase;
  const isDeleteActionDisabled = !canConfirmDeleteAccount || isDeletingAccount;

  useEffect(() => {
    if (showProfileCustomization && user) {
      setProfileForm({
        bio: (user as any).bio || '',
        location: (user as any).location || '',
        website: (user as any).website || '',
        favoriteTeam: (user as any).favoriteTeam || '',
        favoritePosition: (user as any).favoritePosition || ''
      });
    }
  }, [showProfileCustomization, user]);

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && TABS.includes(tabParam as TabKey)) {
      setActiveTab(tabParam as TabKey);
    }
    const customizeParam = searchParams.get('customize');
    if (customizeParam === '1' || customizeParam === 'true') {
      setShowProfileCustomization(true);
    }
  }, [searchParams]);

  const navigateToTab = (tab: TabKey) => {
    setActiveTab(tab);
    navigate(`/usuario?tab=${tab}`, { replace: true });
  };

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" />;
  }

  const roles = getUserRoles(user);
  const mainRoleLabel = getMainRoleLabel(roles);

  const userClub =
    hasRole('dt') && (user as any).clubId
      ? clubs.find((club) => club.id === (user as any).clubId)
      : hasRole('dt') && (user as any).club
      ? clubs.find((club) => club.name === (user as any).club)
      : null;

  const achievements = (user as any).achievements || [];

  const handleImageSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setImageError('La imagen no puede ser mayor a 2MB');
      return;
    }

    setImageError(null);
    setSelectedImage(file);

    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result as string);
    reader.onerror = () => setImageError('Error al leer la imagen');
    reader.readAsDataURL(file);
  };

  const handleImageUpload = async () => {
    if (!selectedImage || !user) return;

    setImageError(null);

    const toBase64 = (file: File) =>
      new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('No se pudo leer la imagen'));
        reader.readAsDataURL(file);
      });

    try {
      const base64 = await toBase64(selectedImage);
      await updateUser({
        avatar: base64,
        roles: (user as any).roles,
        role: (user as any).role
      } as any);
      setSelectedImage(null);
      setImagePreview(null);
      setImageError(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error updating avatar:', error);
      setImageError('Error al procesar o guardar la imagen');
    }
  };

  const clearImageSelection = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setImageError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const closeDeleteModal = (force = false) => {
    if (isDeletingAccount && !force) return;
    setShowDeleteConfirm(false);
    setDeleteError(null);
    setDeleteConfirmationInput('');
    setDeleteAcknowledged(false);
    setIsDeletingAccount(false);
  };

  const handleDeleteAccount = async () => {
    if (!user || !deleteAcknowledged) return;
    const normalizedInput = deleteConfirmationInput.trim().toLowerCase();
    if (normalizedInput !== normalizedDeleteConfirmationPhrase) return;

    try {
      setDeleteError(null);
      setIsDeletingAccount(true);
      await deleteAccount();
      closeDeleteModal(true);
    } catch (error: any) {
      console.error('Error deleting account:', error);
      setDeleteError('Error al eliminar la cuenta. Por favor, inténtalo de nuevo.');
    } finally {
      setIsDeletingAccount(false);
    }
  };

  const handleProfileSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (profileForm.website && !profileForm.website.match(/^https?:\/\/.+/)) {
      setProfileError('La URL del sitio web debe comenzar con http:// o https://');
      return;
    }

    try {
      await updateUser({
        bio: profileForm.bio,
        location: profileForm.location,
        website: profileForm.website,
        favoriteTeam: profileForm.favoriteTeam,
        favoritePosition: profileForm.favoritePosition
      } as any);
      setShowProfileCustomization(false);
      setProfileError(null);
    } catch (error: any) {
      setProfileError(error?.message || 'Error al actualizar el perfil');
    }
  };

  const handlePasswordChange = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      setPasswordError('Todos los campos son requeridos');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordError('La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('Las contraseñas no coinciden');
      return;
    }

    try {
      await changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPasswordError(null);
    } catch (error: any) {
      setPasswordError(error?.message || 'Error al cambiar la contraseña');
    }
  };

  return (
    <div className="bg-gray-900 min-h-screen text-white">
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />

      <main>
        <div className="container mx-auto px-4 py-10 lg:py-12">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-8">
              <UserPanelSidebar
                user={user}
                roles={roles}
                mainRoleLabel={mainRoleLabel}
                hasRole={hasRole as any}
                userClub={userClub}
                activeTab={activeTab}
                onSelectTab={navigateToTab as any}
                onNavigateAdmin={() => navigate('/admin')}
                logout={logout}
                imagePreview={imagePreview}
              />

              <section className="flex-1 space-y-8">
                {/* Breadcrumb Navigation */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-sm text-gray-400">
                    <span>Usuario</span>
                    <span>/</span>
                    <span className="text-white capitalize">
                      {activeTab === 'profile' && 'Mi Perfil'}
                      {activeTab === 'club' && 'Mi Club'}
                      {activeTab === 'activity' && 'Actividad'}
                      {activeTab === 'community' && 'Comunidad'}
                      {activeTab === 'settings' && 'Configuración'}
                    </span>
                  </div>

                  {/* User Status Indicator */}
                  <div className="flex items-center space-x-2 text-xs">
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="text-gray-400">En línea</span>
                    </div>
                    <span className="text-gray-600">•</span>
                    <span className="text-gray-400">
                      Último acceso: {(user as any)?.lastLogin ?
                        new Date((user as any).lastLogin).toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : 'Nunca'
                      }
                    </span>
                  </div>
                </div>

                {activeTab === 'profile' && (
                  <ProfileTab
                    user={user}
                    achievements={achievements}
                    mainRoleLabel={mainRoleLabel}
                    hasRole={hasRole as any}
                    onOpenCustomization={() => setShowProfileCustomization(true)}
                  />
                )}

                {activeTab === 'club' && hasRole('dt') && <ClubTab userClub={userClub} />}

                {activeTab === 'activity' && <ActivityTab />}

                {activeTab === 'community' && <CommunityTab />}

                {activeTab === 'settings' && (
                  <SettingsTab
                    user={user}
                    imagePreview={imagePreview}
                    selectedImage={selectedImage}
                    imageError={imageError}
                    openFilePicker={openFilePicker}
                    handleImageUpload={handleImageUpload}
                    clearImageSelection={clearImageSelection}
                    passwordForm={passwordForm}
                    setPasswordForm={setPasswordForm}
                    passwordError={passwordError}
                    handlePasswordChange={handlePasswordChange}
                    downloadUserData={downloadUserData}
                    setShowDeleteConfirm={setShowDeleteConfirm}
                  />
                )}
              </section>
            </div>
          </div>
        </div>
      </main>

      {showProfileCustomization && (
        <ProfileCustomizationModal
          profileForm={profileForm}
          setProfileForm={setProfileForm}
          profileError={profileError}
          setProfileError={setProfileError}
          onClose={() => setShowProfileCustomization(false)}
          onSubmit={handleProfileSave}
        />
      )}

      {showDeleteConfirm && (
        <DeleteAccountModal
          deleteConfirmationPhrase={deleteConfirmationPhrase}
          deleteConfirmationInput={deleteConfirmationInput}
          setDeleteConfirmationInput={setDeleteConfirmationInput}
          deleteAcknowledged={deleteAcknowledged}
          setDeleteAcknowledged={setDeleteAcknowledged}
          deleteError={deleteError}
          isDeleteActionDisabled={isDeleteActionDisabled}
          isDeletingAccount={isDeletingAccount}
          closeDeleteModal={() => closeDeleteModal()}
          handleDeleteAccount={handleDeleteAccount}
          downloadUserData={downloadUserData}
        />
      )}
    </div>
  );
};

export default UserPanel;

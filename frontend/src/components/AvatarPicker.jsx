import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PREDEFINED_AVATARS, getUserInitials } from '@/lib/avatars';
import { Camera, Upload, Check } from 'lucide-react';
import { notify } from '@/lib/notify';
import { useAuth } from '@/contexts/AuthContext';

export function AvatarPicker({ user, onAvatarChange, children }) {
  const { t } = useTranslation();
  const { uploadAvatar } = useAuth();
  const [open, setOpen] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar || null);
  const [pendingFile, setPendingFile] = useState(null);
  const [pendingPreviewUrl, setPendingPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handlePredefinedSelect = (avatarId) => {
    // Clear any pending file when switching to predefined
    if (pendingPreviewUrl) {
      URL.revokeObjectURL(pendingPreviewUrl);
      setPendingPreviewUrl(null);
    }
    setPendingFile(null);
    setSelectedAvatar(avatarId);
  };

  const handleFileSelect = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type (jpg, jpeg, png, webp, gif — matches backend)
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      notify.error({ title: t('settings.invalidImageType') });
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      notify.error({ title: t('settings.imageTooLarge') });
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // Revoke previous preview if any
    if (pendingPreviewUrl) {
      URL.revokeObjectURL(pendingPreviewUrl);
    }

    // Show local preview — actual upload happens on Save
    const previewUrl = URL.createObjectURL(file);
    setPendingFile(file);
    setPendingPreviewUrl(previewUrl);
    setSelectedAvatar(previewUrl);

    // Reset input so the same file can be re-selected if needed
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSave = async () => {
    if (pendingFile) {
      // Upload the pending file now
      setUploading(true);
      try {
        const updatedUser = await uploadAvatar(pendingFile);
        URL.revokeObjectURL(pendingPreviewUrl);
        setPendingPreviewUrl(null);
        setPendingFile(null);
        setSelectedAvatar(updatedUser.avatar);
        notify.success({ title: t('settings.imageUploadSuccess') });
        setOpen(false);
      } catch (error) {
        console.error('Error uploading avatar:', error);
        URL.revokeObjectURL(pendingPreviewUrl);
        setPendingPreviewUrl(null);
        setPendingFile(null);
        setSelectedAvatar(user?.avatar || null);

        if (error.code === 'INVALID_FILE_TYPE') {
          notify.error({ title: t('settings.invalidImageType') });
        } else if (error.code === 'FILE_TOO_LARGE') {
          notify.error({ title: t('settings.imageTooLarge') });
        } else {
          notify.error({ title: t('settings.imageUploadError') });
        }
      } finally {
        setUploading(false);
      }
    } else {
      // Predefined avatar — persisted via profile update in parent
      if (selectedAvatar && !selectedAvatar.startsWith('http')) {
        onAvatarChange(selectedAvatar);
      }
      setOpen(false);
    }
  };

  const handleCancel = () => {
    if (pendingPreviewUrl) {
      URL.revokeObjectURL(pendingPreviewUrl);
      setPendingPreviewUrl(null);
    }
    setPendingFile(null);
    setSelectedAvatar(user?.avatar || null);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) handleCancel(); else setOpen(true); }}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm">
            <Camera className="h-4 w-4 mr-2" />
            {t('settings.changeAvatar')}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('settings.changeAvatar')}</DialogTitle>
          <DialogDescription>
            {t('settings.changeAvatarDescription')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Upload Custom Image */}
          <div>
            <h4 className="text-sm font-medium mb-3">{t('settings.customImage')}</h4>
            <div className="flex gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-full"
              >
                <Upload className="h-4 w-4 mr-2" />
                {t('settings.uploadImage')}
              </Button>
            </div>
            {pendingFile && (
              <p className="mt-2 text-xs text-muted-foreground">{t('settings.imagePendingSave')}</p>
            )}
            {selectedAvatar && (selectedAvatar.startsWith('blob:') || selectedAvatar.startsWith('http')) && (
              <div className="mt-3 flex items-center gap-2">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selectedAvatar} />
                </Avatar>
                <span className="text-sm text-muted-foreground">
                  {t('settings.customImagePreview')}
                </span>
              </div>
            )}
          </div>

          {/* Predefined Avatars */}
          <div>
            <h4 className="text-sm font-medium mb-3">{t('settings.predefinedAvatars')}</h4>
            <div className="grid grid-cols-4 gap-3">
              {PREDEFINED_AVATARS.map((avatar) => (
                <button
                  key={avatar.id}
                  onClick={() => handlePredefinedSelect(avatar.id)}
                  className={`relative rounded-full aspect-square hover:ring-2 hover:ring-primary transition-all ${
                    selectedAvatar === avatar.id ? 'ring-2 ring-primary' : ''
                  }`}
                >
                  <div
                    className={`w-full h-full rounded-full bg-gradient-to-br ${avatar.gradient} flex items-center justify-center text-white font-semibold`}
                  >
                    {getUserInitials(user?.name)}
                  </div>
                  {selectedAvatar === avatar.id && (
                    <div className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full p-1">
                      <Check className="h-3 w-3" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleCancel} disabled={uploading}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleSave} disabled={uploading}>
            {uploading ? t('common.uploading') : t('common.save')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
